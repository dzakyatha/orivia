import requests
from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class GatewayProxyView(APIView):
    """
    Gateway Proxy View to forward requests to microservices
    """
    # Verify user identity via JWT
    permission_classes = [IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        # Determine target service
        service_name = kwargs.get('service')
        path = kwargs.get('path')
        
        if service_name == 'planner':
            base_url = settings.TRAVEL_PLANNER_URL
        elif service_name == 'opentrip':
            base_url = settings.OPEN_TRIP_URL
        else:
            return HttpResponse("Service not found", status=404)

        # Construct target URL
        # Strip the leading slash from path to avoid double slashes
        url = f"{base_url}/{path.lstrip('/')}"
        
        # Forward the request
        try:
            # Forward JWT Authorization header
            headers = {key: value for key, value in request.headers.items() 
                      if key.lower() not in ['host', 'content-length']}
            
            # Explicitly set Content-Type if provided
            if request.content_type:
                headers['Content-Type'] = request.content_type

            response = requests.request(
                method=request.method,
                url=url,
                headers=headers,
                data=request.body,
                params=request.GET,
                timeout=10
            )

            # Return microservice response to frontend
            return HttpResponse(
                response.content,
                status=response.status_code,
                content_type=response.headers.get('Content-Type')
            )

        except requests.exceptions.RequestException as e:
            # Handle connection errors (Service Down)
            return HttpResponse(f"Gateway Error: {str(e)}", status=503)