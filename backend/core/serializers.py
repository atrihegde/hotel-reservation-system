from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Room, Customer, Reservation

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        extra_kwargs = {'password': {'write_only': True}}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ReservationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type', read_only=True)
    
    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, attrs):
        if attrs['check_out_date'] <= attrs['check_in_date']:
            raise serializers.ValidationError("Check-out date must be after check-in date")
        
        # Check for overlapping reservations
        room = attrs.get('room')
        check_in = attrs['check_in_date']
        check_out = attrs['check_out_date']
        
        # Exclude current reservation if updating
        instance = self.instance if self.instance else None
        
        overlapping = Reservation.objects.filter(
            room=room,
            booking_status__in=['pending', 'confirmed', 'checked_in'],
        ).exclude(
            booking_status='cancelled'
        ).exclude(
            check_out_date__lte=check_in
        ).exclude(
            check_in_date__gte=check_out
        )
        
        if instance:
            overlapping = overlapping.exclude(id=instance.id)
        
        if overlapping.exists():
            raise serializers.ValidationError("Room is already booked for these dates")
        
        return attrs


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['reservation_number', 'customer', 'room', 'check_in_date', 'check_out_date', 'number_of_guests', 'booking_status']
