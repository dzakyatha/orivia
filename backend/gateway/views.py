import requests
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache

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
        # If User A and User B see the same trip list, serve the same cached response to both
        query_string = request.META.get('QUERY_STRING', '')
        cache_key = f"gateway:{service_name}:{path}:{query_string}"
        
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
        
        # Forward the request
        try:
            # Forward headers, but strip security-sensitive ones
            # Exclude host, content-length, and any user identity headers
            excluded_headers = ['host', 'content-length', 'x-user-id', 'x-user-role']
            headers = {
                key: value for key, value in request.headers.items() 
                if key.lower() not in excluded_headers
            }
            
            # Always set user identity from authenticated server-side context
            # This prevents header spoofing attacks
            headers['X-User-ID'] = str(request.user.id)
            headers['X-User-Role'] = request.user.role
            
            # Get headers from original request
            if hasattr(request, '_request') and hasattr(request._request, 'headers'):
                headers = {key: value for key, value in request._request.headers.items() 
                          if key.lower() not in ['host', 'content-length']}
            
            # Ensure Authorization header is set
            if 'Authorization' not in headers and request.auth:
                headers['Authorization'] = f"Bearer {str(request.auth)}"

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

            # Return microservice response to frontend
            response = HttpResponse(
                microservice_response.content,
                status=microservice_response.status_code,
                content_type=microservice_response.headers.get('Content-Type')
            )
            self.response = self.finalize_response(request, response, *args, **kwargs)
            return self.response

        except requests.exceptions.RequestException as e:
            # Handle connection errors (Service Down)
            return HttpResponse(f"Gateway Error: {str(e)}", status=503)

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
