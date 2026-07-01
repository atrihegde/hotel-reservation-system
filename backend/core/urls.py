from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView,
    RoomViewSet, CustomerViewSet, ReservationViewSet, DashboardView
)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
