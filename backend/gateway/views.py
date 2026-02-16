import requests
import logging
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)

class GatewayProxyView(APIView):
    """
    Gateway Proxy View to forward requests to microservices
    """
    # Verify user identity via JWT
    permission_classes = [IsAuthenticated]

    def _proxy_request(self, request, service, path):
        """
        Helper method to proxy requests to microservices
        """
        # Determine target service
        if service == 'planner':
            base_url = settings.TRAVEL_PLANNER_URL
            # Map external 'planner' to internal 'perencanaan'
            internal_path = f"perencanaan/{path.lstrip('/')}"
        elif service == 'opentrip':
            base_url = settings.OPEN_TRIP_URL
            # Map external 'opentrip' to internal 'opentrip'
            internal_path = f"opentrip/{path.lstrip('/')}"
        else:
            return HttpResponse("Service not found", status=404)

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
            
            logger.debug(f"Forwarding with user context: ID={headers['X-User-ID']}, Role={headers['X-User-Role']}")
            
            # Explicitly set Content-Type if provided
            if request.content_type:
                headers['Content-Type'] = request.content_type

            response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                data=request.body,
                params=request.GET.dict(),
                timeout=10
            )

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
            return HttpResponse(
                response.content,
                status=response.status_code,
                content_type=response.headers.get('Content-Type')
            )

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