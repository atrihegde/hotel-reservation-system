from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
import uuid

from .models import Room, Customer, Reservation
from .serializers import (
    UserSerializer, RegisterSerializer, RoomSerializer,
    CustomerSerializer, ReservationSerializer, ReservationCreateSerializer
)
from .permissions import IsAdminRole

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        
        if check_in and check_out:
            try:
                check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
                check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
                
                booked_rooms = Reservation.objects.filter(
                    booking_status__in=['pending', 'confirmed', 'checked_in'],
                    check_in_date__lt=check_out_date,
                    check_out_date__gt=check_in_date
                ).values_list('room_id', flat=True)
                
                available_rooms = Room.objects.exclude(id__in=booked_rooms).filter(status='available')
                serializer = self.get_serializer(available_rooms, many=True)
                return Response(serializer.data)
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        available_rooms = Room.objects.filter(status='available')
        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        queryset = Room.objects.all()
        
        room_type = request.query_params.get('room_type')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        capacity = request.query_params.get('capacity')
        availability = request.query_params.get('availability')
        room_number = request.query_params.get('room_number')
        
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)
        if capacity:
            queryset = queryset.filter(capacity__gte=capacity)
        if availability:
            queryset = queryset.filter(status=availability)
        if room_number:
            queryset = queryset.filter(room_number__icontains=room_number)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q')
        if query:
            customers = Customer.objects.filter(
                Q(full_name__icontains=query) |
                Q(email__icontains=query) |
                Q(phone_number__icontains=query) |
                Q(customer_id__icontains=query) |
                Q(govt_id_number__icontains=query)
            )
            serializer = self.get_serializer(customers, many=True)
            return Response(serializer.data)
        
        serializer = self.get_serializer(self.queryset, many=True)
        return Response(serializer.data)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservationCreateSerializer
        return ReservationSerializer
    
    @action(detail=False, methods=['post'])
    def cancel(self, request):
        reservation_id = request.data.get('reservation_id')
        try:
            reservation = Reservation.objects.get(reservation_number=reservation_id)
            reservation.booking_status = 'cancelled'
            reservation.save()
            return Response({'message': 'Reservation cancelled successfully'})
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        room_id = request.query_params.get('room_id')
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        
        if not all([room_id, check_in, check_out]):
            return Response(
                {'error': 'room_id, check_in, and check_out are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            room = Room.objects.get(id=room_id)
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            
            overlapping = Reservation.objects.filter(
                room=room,
                booking_status__in=['pending', 'confirmed', 'checked_in'],
                check_in_date__lt=check_out_date,
                check_out_date__gt=check_in_date
            ).exists()
            
            return Response({
                'available': not overlapping,
                'room': RoomSerializer(room).data
            })
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_rooms = Room.objects.count()
        available_rooms = Room.objects.filter(status='available').count()
        occupied_rooms = Room.objects.filter(status='occupied').count()
        maintenance_rooms = Room.objects.filter(status='maintenance').count()
        
        active_reservations = Reservation.objects.filter(
            booking_status__in=['pending', 'confirmed', 'checked_in']
        ).count()
        
        total_customers = Customer.objects.count()
        
        recent_reservations = Reservation.objects.order_by('-created_at')[:5]
        recent_data = ReservationSerializer(recent_reservations, many=True).data
        
        return Response({
            'total_rooms': total_rooms,
            'available_rooms': available_rooms,
            'occupied_rooms': occupied_rooms,
            'maintenance_rooms': maintenance_rooms,
            'active_reservations': active_reservations,
            'total_customers': total_customers,
            'recent_reservations': recent_data
        })
