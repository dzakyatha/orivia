import requests
import logging
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache

logger = logging.getLogger(__name__)

class GatewayProxyView(APIView):
    """
    Gateway Proxy View to forward requests to microservices
    """
    # Verify user identity via JWT
    permission_classes = [IsAuthenticated]

    # Rate limit per user
    throttle_classes = [UserRateThrottle]

    def dispatch(self, request, *args, **kwargs):
        # Initialize headers dict
        self.headers = {}
        
        # Wrap the raw WSGIRequest into a DRF Request
        # adds .query_params, .user, .auth, etc.
        request = self.initialize_request(request, *args, **kwargs)
        self.request = request
        self.args = args
        self.kwargs = kwargs
        self.format_kwarg = self.get_format_suffix(**kwargs)

        # Trigger DRF's Auth & Permission checks (including throttling)
        try:
            self.initial(request, *args, **kwargs)
        except Exception as exc:
            response = self.handle_exception(exc)
            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        # Determine target service
        service_name = kwargs.get('service')
        path = kwargs.get('path', '')

        # Cache Key
        query_string = request.META.get('QUERY_STRING', '')
        # include a user-specific component to avoid serving one user's cached response to another authenticated user
        # for anonymous users, use a common cache key without user identifier
        user_identifier = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if user_identifier is not None:
            cache_key = f"gateway:{service_name}:{path}:{query_string}:user:{user_identifier}"
        else:
            cache_key = f"gateway:{service_name}:{path}:{query_string}:anon"
        
        # Only cache safe GET requests for opentrip service
        should_cache = (request.method == 'GET' and service_name == 'opentrip')

        if should_cache:
            try:
                cached_response = cache.get(cache_key)
                if cached_response:
                    response = HttpResponse(
                        cached_response['content'],
                        status=cached_response['status'],
                        content_type=cached_response['content_type']
                    )
                    self.response = self.finalize_response(request, response, *args, **kwargs)
                    return self.response
            except Exception:
                # Cache failure - continue without cache
                pass
        
        if service_name == 'planner':
            base_url = settings.TRAVEL_PLANNER_URL
            # Map external 'planner' to internal 'perencanaan'
            internal_path = f"perencanaan/{path.lstrip('/')}"
        elif service == 'opentrip':
            base_url = settings.OPEN_TRIP_URL
            # Map external 'opentrip' to internal 'opentrip'
            internal_path = f"opentrip/{path.lstrip('/')}"
        else:
            response = HttpResponse("Service not found", status=404)
            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        # Construct target URL
        url = f"{base_url}/api/{internal_path}"
        
        # Log request details (use DEBUG for PII/high-volume data)
        logger.info(f"Gateway proxying {request.method} to service: {service}")
        logger.debug(f"Target URL: {url}")
        logger.debug(f"User ID: {request.user.id}, Role: {request.user.role}")
        
        # Forward the request
        try:
            # Forward headers, but strip security-sensitive ones
            # Security: Never trust client-provided identity headers to prevent spoofing
            excluded_headers = ['host', 'content-length', 'x-user-id', 'x-user-role']
            headers = {
                key: value for key, value in request.headers.items() 
                if key.lower() not in excluded_headers
            }
            
            # Security: Always inject user identity from authenticated server-side context
            # This ensures microservices receive verified user information
            headers['X-User-ID'] = str(request.user.id)
            headers['X-User-Role'] = request.user.role
            
            # Get headers from original request
            if hasattr(request, '_request') and hasattr(request._request, 'headers'):
                headers = {key: value for key, value in request._request.headers.items() 
                          if key.lower() not in ['host', 'content-length']}
            
            # Ensure Authorization header is set
            if 'Authorization' not in headers and request.auth:
                headers['Authorization'] = f"Bearer {str(request.auth)}"
            logger.debug(f"Forwarding with user context: ID={headers['X-User-ID']}, Role={headers['X-User-Role']}")
            
            # Explicitly set Content-Type if provided
            if request.content_type:
                headers['Content-Type'] = request.content_type

            microservice_response = requests.request(
                method=request.method,
                url=target_url,
                headers=headers,
                data=request.body,
                params=request.query_params.dict(),
                timeout=10
            )

            # Save to Cache if applicable
            if should_cache and microservice_response.status_code == 200:
                try:
                    cache_data = {
                        'content': microservice_response.content,
                        'status': microservice_response.status_code,
                        'content_type': microservice_response.headers.get('Content-Type')
                    }
                    cache.set(cache_key, cache_data, timeout=60) # 60s cache
                except Exception:
                    # Cache failure - continue without caching
                    pass
            # Log response metadata only (avoid logging sensitive payload data)
            logger.info(
                f"Microservice response: status={response.status_code}, "
                f"content-type={response.headers.get('Content-Type')}, "
                f"content-length={len(response.content)}"
            )
            
            # Only log response body at DEBUG level with content-type restrictions
            if logger.isEnabledFor(logging.DEBUG):
                content_type = response.headers.get('Content-Type', '')
                # Only sample safe content types (avoid logging binary/sensitive data)
                if 'application/json' in content_type or 'text/' in content_type:
                    logger.debug(f"Response sample: {response.text[:200]}...")

            # Return microservice response to frontend
            response = HttpResponse(
                microservice_response.content,
                status=microservice_response.status_code,
                content_type=microservice_response.headers.get('Content-Type')
            )
            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        except requests.exceptions.RequestException as e:
            # Log full exception details with stack trace for debugging
            logger.exception(f"Gateway error proxying to {service}: {type(e).__name__}")
            # Return generic error message to client (don't leak internal details)
            return HttpResponse("Service temporarily unavailable", status=503)

    def get(self, request, service, path='', *args, **kwargs):
        """Handle GET requests"""
        return self._proxy_request(request, service, path)

    def post(self, request, service, path='', *args, **kwargs):
        """Handle POST requests"""
        return self._proxy_request(request, service, path)

    def put(self, request, service, path='', *args, **kwargs):
        """Handle PUT requests"""
        return self._proxy_request(request, service, path)

    def patch(self, request, service, path='', *args, **kwargs):
        """Handle PATCH requests"""
        return self._proxy_request(request, service, path)

    def delete(self, request, service, path='', *args, **kwargs):
        """Handle DELETE requests"""
        return self._proxy_request(request, service, path)
