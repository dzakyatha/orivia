"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from users.views import (
    GoogleLogin,
    CustomLoginView,
    CustomRegisterView,
    CustomLogoutView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Custom Authentication Endpoints with Logging
    path('api/auth/login/', CustomLoginView.as_view(), name='rest_login'),
    path('api/auth/logout/', CustomLogoutView.as_view(), name='rest_logout'),
    path('api/auth/registration/', CustomRegisterView.as_view(), name='rest_register'),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # Other dj-rest-auth endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
]
