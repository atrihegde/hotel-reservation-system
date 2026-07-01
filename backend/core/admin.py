from django.contrib import admin
from .models import User, Room, Customer, Reservation


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'room_type', 'floor', 'capacity', 'price_per_night', 'status']
    list_filter = ['room_type', 'status', 'floor']
    search_fields = ['room_number']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'full_name', 'email', 'phone_number']
    search_fields = ['full_name', 'email', 'customer_id', 'govt_id_number']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['reservation_number', 'customer', 'room', 'check_in_date', 'check_out_date', 'booking_status']
    list_filter = ['booking_status', 'check_in_date']
    search_fields = ['reservation_number', 'customer__full_name']
