
from django.urls import path
from frontend.views import HomePageView

# app_name = 'front-end'
urlpatterns = [
    path('', HomePageView.as_view(), name='home'),
    path('patient/<int:pk>/', HomePageView.as_view(), name='patient'),
    path('patient/<str:pk>/', HomePageView.as_view(), name='patient'),
]
