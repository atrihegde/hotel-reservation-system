# Hotel Reservation System

A full-stack hotel reservation management system built with Django (backend) and React (frontend).

## Features

### 1. User Authentication
- Admin-only registration and login
- JWT-based authentication
- Secure logout with token blacklisting

### 2. Room Management
- Add, edit, and delete rooms
- View all rooms
- Room details: number, type (standard/deluxe/suite), floor, capacity, price per night, status, description
- Search and filter rooms by type, price range, capacity, availability, and room number

### 3. Customer Management
- Add, edit, and delete customers
- View all customers
- Customer details: ID, full name, email, phone number, address, government ID number
- Search customers by name, email, phone, or ID

### 4. Reservation Management
- Create, modify, and cancel reservations
- View all reservations
- Reservation details: reservation number, customer, room, check-in/check-out dates, number of guests, booking status
- Automatic double-booking prevention with overlap detection
- Real-time availability checking

### 5. Dashboard
- Key statistics display:
  - Total rooms
  - Available rooms
  - Occupied rooms
  - Rooms under maintenance
  - Active reservations
  - Total customers
- Recent reservations overview

## Tech Stack

### Backend
- Django 6.0.6
- Django REST Framework
- Django REST Framework SimpleJWT
- Django CORS Headers
- SQLite (default database)

### Frontend
- React 18
- React Router DOM
- Axios
- Vite

## Project Structure

```
hotel-reservation-system/
├── backend/
│   ├── hotel_reservation/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── manage.py
│   └── venv/
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── layout/
    │   │   ├── rooms/
    │   │   ├── customers/
    │   │   ├── reservations/
    │   │   └── dashboard/
    │   ├── context/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional, for Django admin access):
```bash
python manage.py createsuperuser
```

6. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/logout/` - Logout (blacklist refresh token)

### Rooms
- `GET /api/rooms/` - List all rooms
- `POST /api/rooms/` - Create a new room
- `GET /api/rooms/:id/` - Get room details
- `PUT /api/rooms/:id/` - Update room
- `DELETE /api/rooms/:id/` - Delete room
- `GET /api/rooms/available/` - Get available rooms
- `GET /api/rooms/search/` - Search and filter rooms

### Customers
- `GET /api/customers/` - List all customers
- `POST /api/customers/` - Create a new customer
- `GET /api/customers/:id/` - Get customer details
- `PUT /api/customers/:id/` - Update customer
- `DELETE /api/customers/:id/` - Delete customer
- `GET /api/customers/search/` - Search customers

### Reservations
- `GET /api/reservations/` - List all reservations
- `POST /api/reservations/` - Create a new reservation
- `GET /api/reservations/:id/` - Get reservation details
- `PUT /api/reservations/:id/` - Update reservation
- `DELETE /api/reservations/:id/` - Delete reservation
- `POST /api/reservations/cancel/` - Cancel a reservation
- `GET /api/reservations/check_availability/` - Check room availability

### Dashboard
- `GET /api/dashboard/` - Get dashboard statistics

## Usage

1. **First-time setup**: Register a new admin account
2. **Login**: Use your credentials to login
3. **Dashboard**: View key statistics and recent reservations
4. **Rooms**: Manage rooms, search and filter by various criteria
5. **Customers**: Manage customer information
6. **Reservations**: Create and manage reservations with automatic overlap prevention

## Access Control

- **Admin**: Full access to all features including create, edit, and delete operations
- All users are admins in this system

## Development Notes

- The backend uses SQLite by default. For production, consider using PostgreSQL or MySQL
- JWT tokens have a lifetime of 1 hour for access tokens and 7 days for refresh tokens
- CORS is configured to allow requests from the frontend development server
- All API endpoints require authentication except for register and login

## Future Enhancements

- Email notifications for reservations
- Payment integration
- Room image uploads
- Advanced reporting and analytics
- Multi-language support
- Mobile app development
