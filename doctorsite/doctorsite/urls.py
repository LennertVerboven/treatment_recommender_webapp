"""doctorsite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
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
from django.contrib.auth import views as auth_views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include
from django.shortcuts import redirect
from frontend.views import HomePageView

urlpatterns = [
    #path('', include('frontend.urls')),
    #path('', redirect('app/')),
    path(''     , lambda request: redirect('/app/', permanent=False)),
    path('api/', include('doctorapp.urls')),
    path('app/', include('frontend.urls')),
    path('admin/', admin.site.urls),

    path(r'accounts/login/',
         auth_views.LoginView.as_view(template_name='patients/login.html'),
         name='login'),
    path(r'accounts/password-change/',
         auth_views.PasswordChangeView.as_view(template_name='patients/change-password.html'),
         name='password-change'),
    path(r'accounts/logout/',
         auth_views.LogoutView.as_view(template_name='patients/logged_out.html'),
         name='logout'),
]

urlpatterns += staticfiles_urlpatterns()
