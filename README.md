# MarieCare - Medical Appointment System

## Design and Development of a Secure and Functional Medical Website for Patient and Doctor Interaction

**Author:** Jah Osman

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Doctor Account Creation](#doctor-account-creation)
- [Troubleshooting](#troubleshooting)
- [Project Architecture](#project-architecture)

## Project Overview

MarieCare is a comprehensive medical appointment booking system developed as a thesis project. The platform enables secure patient-doctor interactions, appointment scheduling, and profile management. The system aims to enhance healthcare accessibility and convenience through technology.

This web application streamlines the healthcare appointment process, allowing patients to find doctors by specialty, book appointments with their preferred doctors, and receive email confirmations. Doctors can manage their profiles, availability, and view upcoming appointments.

## Features

### Patient Features
- **Secure Authentication**: Register, login, and access personalized dashboard
- **Doctor Search**: Find doctors by specialization, view profiles and qualifications
- **Appointment Booking**: Schedule appointments with preferred doctors
- **Email Notifications**: Receive booking confirmations via email
- **Profile Management**: Update personal information and view booking history
- **Medicine Store**: Browse and purchase medicines with cart functionality
- **Prescription Management**: View prescriptions and doctor notes from completed appointments
- **Payment Processing**: Secure checkout with Stripe integration
- **Review System**: Rate and review doctors after appointments (multiple reviews allowed)
- **Real-time Notifications**: Instant notifications for booking updates
- **Real-time Chat**: Direct messaging with doctors through WebSocket-powered chat system
- **Unread Message Tracking**: Visual indicators for unread messages in navigation and header
- **Chat History**: Persistent message history with read receipts and message status

### Doctor Features
- **Professional Profile**: Create and manage detailed professional profiles with qualifications and experience
- **Availability Management**: Set and update time slots for patient appointments
- **Appointment Overview**: View upcoming and past appointments with status management
- **Patient Information**: Access basic information about patients with appointments
- **Prescription Module**: Add prescriptions and doctor notes to patient appointments
- **Booking Status Management**: Update appointment status (Pending → Confirmed/Completed/Cancelled)
- **Real-time Notifications**: Instant notifications for new bookings
- **Review Analytics**: View patient reviews and rating statistics
- **Time Slot Management**: Configure availability with flexible time slots
- **Real-time Chat**: Direct communication with patients through integrated chat system
- **Patient Chat Management**: Access to all patient conversations with message threading
- **Message Analytics**: Track unread messages and communication metrics

### Real-time Chat System
- **WebSocket Integration**: Socket.IO-powered real-time bidirectional communication
- **Instant Messaging**: Real-time message delivery between doctors and patients
- **Message Status Tracking**: Read receipts, delivery confirmations, and typing indicators
- **Unread Count Management**: Dynamic unread message counters with automatic updates
- **Cross-platform Access**: Chat available through main navigation and floating widget
- **Message History**: Persistent chat history with proper message threading
- **Authentication Integration**: Secure chat access based on user roles and permissions
- **Automatic Reconnection**: Robust connection handling with retry mechanisms
- **Message Validation**: Input sanitization and content filtering for secure communication
- **Duplicate Prevention**: Advanced message deduplication to prevent double delivery

### Pharmacy & Medicine System
- **Medicine Catalog**: Browse available medicines with detailed information
- **Shopping Cart**: Add medicines to cart with quantity management
- **Secure Checkout**: Stripe-powered payment processing for medicine purchases
- **Order Management**: Track medicine orders and purchase history
- **Inventory Display**: Real-time medicine availability and pricing

### Real-time Features
- **Socket.IO Integration**: Real-time bidirectional communication
- **Instant Notifications**: Toast notifications for booking updates
- **Live Status Updates**: Real-time appointment status changes
- **Responsive UI**: Immediate feedback on user actions

### Review & Rating System
- **Patient Reviews**: Patients can rate and review doctors after appointments
- **Multiple Reviews**: Patients can leave multiple reviews for the same doctor over time
- **Star Rating System**: 1-5 star rating with interactive UI
- **Review Analytics**: Average ratings and review statistics for doctors
- **Feedback Management**: Comprehensive review display and management
- **Review History**: Track all reviews and ratings across multiple appointments
- **Real-time Updates**: Instant review submission and display updates

## Technology Stack

### Frontend
- **React.js**: Component-based UI development
- **React Router**: Navigation and routing
- **Tailwind CSS**: Styling and responsive design
- **React Context API**: State management for authentication, cart, and chat
- **React Icons**: UI icons (e.g., for star ratings, chat, navigation)
- **React Toastify**: User notification system (e.g., for feedback submission status)
- **Stripe.js**: Payment processing integration
- **Socket.IO Client**: Real-time client-side communication for chat and notifications
- **Vite**: Fast development build tool with HMR (Hot Module Replacement)
- **Vitest**: Unit testing framework for React components

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Mongoose**: MongoDB object modeling with schema validation
- **JWT**: Authentication and authorization
- **Bcrypt.js**: Password hashing
- **Nodemailer**: Email sending functionality (Mailtrap/SendGrid support)
- **Stripe API**: Payment processing
- **Cloudinary**: Image storage and management
- **Socket.IO**: Real-time server-side communication for chat and notifications
- **Jest**: Backend testing framework with comprehensive test coverage
- **Multer**: File upload middleware for image handling
- **CORS**: Cross-origin resource sharing configuration
- **Express Rate Limit**: API rate limiting for security

## Prerequisites

Before setting up the project, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas account)
- Stripe account for payments
- SendGrid or Mailtrap account for email functionality
- Cloudinary account for image storage

## Installation

Clone the repository:
```bash
git clone <repository-url>
cd doctor-appointment
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

All required dependencies including Socket.IO, Stripe, and testing frameworks are included in package.json.

3. Create a `.env` file in the backend directory with the following variables (adjust values as needed):
```
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_SITE_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Choose one and comment out the other)
# Mailtrap
#MAIL_HOST=sandbox.smtp.mailtrap.io
#MAIL_PORT=2525
#MAIL_USER=your_mailtrap_user
#MAIL_PASS=your_mailtrap_password
#MAIL_FROM="MarieCare <no-reply@mariecare.com>"

# SendGrid
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your_sendgrid_api_key
MAIL_FROM="MarieCare <your_verified_email>"
```

4. Run the doctor name normalization script from the backend directory:
```bash
node scripts/normalize-doctor-names.js
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

All required dependencies including Socket.IO client, Stripe.js, testing frameworks, and UI libraries are included in package.json.

3. Create a `.env` file in the frontend directory with the following variables:
```
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Running the Application

### Backend
From the backend directory:
```bash
# Development mode with auto-reload
npm run start-dev

# Production mode
npm start
```

### Frontend
From the frontend directory:
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

## Environment Variables

### Backend Environment Variables
- `PORT`: Port number for the backend server (default: 5000)
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret key for JWT token generation (generate a secure key using the command below)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
  ```
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `CLIENT_SITE_URL`: Frontend URL for CORS and redirects

#### Cloudinary Configuration
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

#### Email Configuration
- `MAIL_HOST`: SMTP host (Mailtrap or SendGrid)
- `MAIL_PORT`: SMTP port
- `MAIL_USER`: SMTP username
- `MAIL_PASS`: SMTP password
- `MAIL_FROM`: Email sender name and address

### Frontend Environment Variables
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for payment integration
- `VITE_API_BASE_URL`: Backend API base URL

## API Endpoints

### Authentication
- `POST /api/v1/auth/register`: Register a new user (patient or doctor)
- `POST /api/v1/auth/login`: User login

### User Management
- `GET /api/v1/users/:id`: Get user by ID
- `PUT /api/v1/users/:id`: Update user
- `GET /api/v1/users/profile/me`: Get current user profile
- `GET /api/v1/users/appointments/my-appointments`: Get user's appointments
- `DELETE /api/v1/users/:id`: Delete user account

### Doctor Management
- `GET /api/v1/doctors`: Get all doctors (with search and filter support)
- `GET /api/v1/doctors/:id`: Get doctor by ID with reviews and ratings
- `GET /api/v1/doctors/profile/me`: Get current doctor profile
- `PUT /api/v1/doctors/:id`: Update doctor profile
- `GET /api/v1/doctors/profile/appointments`: Get doctor's appointments
- `GET /api/v1/doctors/:doctorId/available-slots`: Get available time slots for a doctor
- `GET /api/v1/doctors/:doctorId/reviews`: Get reviews for a specific doctor

### Appointments & Bookings
- `GET /api/v1/bookings/user/:userId`: Get user bookings
- `GET /api/v1/bookings/doctor/:doctorId`: Get doctor bookings
- `POST /api/v1/bookings`: Create a new booking
- `GET /api/v1/bookings/:id`: Get booking by ID
- `PUT /api/v1/bookings/:bookingId/status`: Update booking status
- `PUT /api/v1/bookings/:bookingId/prescription`: Add/update prescription and doctor notes
- `DELETE /api/v1/bookings/:id`: Cancel booking (via API only)

### Reviews & Ratings
- `POST /api/v1/doctors/:doctorId/reviews`: Submit a review for a doctor
- `GET /api/v1/doctors/:doctorId/reviews`: Get all reviews for a doctor

### Real-time Chat System
- `GET /api/v1/chats`: Get all chats for the current user
- `POST /api/v1/chats/create`: Create or get existing chat between users
- `GET /api/v1/chats/:chatId/messages`: Get messages for a specific chat with pagination
- `POST /api/v1/chats/:chatId/messages`: Send a new message in a chat
- `DELETE /api/v1/chats/:chatId/messages/:messageId`: Delete a message (soft delete)
- `PUT /api/v1/chats/:chatId/read`: Mark messages as read in a chat
- `GET /api/v1/chats/available-users`: Get available users for starting new chats
- `GET /api/v1/chats/unread-count`: Get total unread message count for user

### WebSocket Events (Socket.IO)
- `connect`: User connects to chat system
- `join`: Join user-specific and chat-specific rooms
- `newMessage`: Real-time message delivery
- `messageDeleted`: Real-time message deletion updates
- `userTyping`: Typing indicator events
- `messageReadReceipt`: Read receipt updates
- `userOnlineStatus`: User online/offline status updates

### Medicine & Pharmacy
- `GET /api/v1/medicines`: Get all available medicines
- `GET /api/v1/medicines/:id`: Get medicine by ID
- `POST /api/v1/medicines`: Add new medicine (admin only)
- `PUT /api/v1/medicines/:id`: Update medicine (admin only)
- `DELETE /api/v1/medicines/:id`: Delete medicine (admin only)

### Payments & Checkout
- `POST /api/v1/checkout/create-checkout-session`: Create Stripe checkout session
- `POST /api/v1/checkout/webhook`: Handle Stripe webhook events

### File Upload
- `POST /api/v1/upload`: Upload image files to Cloudinary

## Testing

The project includes comprehensive testing suites for both frontend and backend:

### Backend Testing (Jest)
```bash
cd backend
npm test
```

**Test Coverage:**
- Authentication system tests
- Booking management tests
- Doctor analytics and dashboard tests
- Review system tests
- User dashboard tests
- Integration tests for complete workflows

### Frontend Testing (Vitest)
```bash
cd frontend
npm test
```

**Test Coverage:**
- Component unit tests
- Context API tests (Auth, Cart)
- Page component tests
- Integration tests for user workflows

## Project Architecture

### Database Schema
- **Users Collection**: Patient and doctor information with role-based access
- **Doctors Collection**: Extended doctor profiles with specializations, qualifications, and time slots
- **Bookings Collection**: Appointment data with status tracking and prescription management
- **Reviews Collection**: Patient feedback and rating system (multiple reviews per user allowed)
- **Medicine Collection**: Pharmacy inventory with pricing and availability
- **Chats Collection**: Real-time messaging system with participant management and message threading
  - Supports dual User/Doctor collections with dynamic references
  - Message read receipts and status tracking
  - Unread count management per participant
  - Soft message deletion with content preservation
  - Participant role-based access control

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for patients, doctors, and admins
- **Input Validation**: Comprehensive validation for all user inputs
- **Password Hashing**: Bcrypt for secure password storage
- **API Rate Limiting**: Protection against abuse and spam
- **Chat Security**: Authenticated access to messaging with participant verification
- **Message Validation**: Content sanitization and input filtering for secure communication
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Navigation & User Experience
- **Responsive Design**: Mobile-first design approach with Tailwind CSS
- **Intuitive Navigation**: Clean header navigation with "Home | Find a Doctor | Chat | Pharmacy"
- **Smart Menu Filtering**: Role-based navigation items (Chat for authenticated users, Pharmacy for non-doctors)
- **Visual Indicators**: Unread message badges and notification counters
- **Dual Chat Access**: Main navigation chat link + floating chat widget for convenience
- **Professional UI**: Healthcare-focused design patterns and user flows

### Real-time Architecture
- **Socket.IO Integration**: WebSocket connections for real-time updates
- **Event-driven Notifications**: Instant alerts for booking changes
- **Connection Management**: Automatic reconnection and error handling

## Doctor Account Creation

To create a doctor account:
1. Register through the registration page
2. For doctors, ensure you select the "Doctor" role during registration
3. Doctor names will automatically be prefixed with "Dr. " in the system

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check that you have correctly configured either SendGrid or Mailtrap in the backend `.env`
   - Only one email provider should be active (comment out the other)
   - Verify your API keys and credentials

2. **Image upload issues**:
   - Confirm your Cloudinary credentials are correct
   - Check file size limits (max 1MB)
   - Ensure you're using supported file formats (JPG, PNG)

3. **Payment processing errors**:
   - Verify Stripe keys are correct in both frontend and backend
   - Use Stripe test card numbers for testing: 4242 4242 4242 4242

4. **Connection errors**:
   - Ensure MongoDB connection string is correct
   - Check that backend and frontend are running on the correct ports
   - Verify API base URL is set correctly in frontend

5. **Chat system issues**:
   - Check that Socket.IO is properly connecting (check browser console for connection logs)
   - Ensure WebSocket connections are not blocked by firewall/proxy
   - Verify JWT tokens are valid for chat authentication
   - Check that both users have appropriate roles (patient/doctor) for chat access

6. **Testing issues**:
   - Ensure all test dependencies are installed
   - Check that MongoDB Memory Server is configured properly for backend tests
   - For frontend tests, verify jsdom environment is set up correctly
   - Run tests with `npm test` in respective directories

7. **Navigation and UI issues**:
   - Clear browser cache if navigation changes don't appear
   - Check that user role is properly set for conditional navigation items
   - Verify unread count badges are updating correctly with real-time data

For additional assistance, please contact the repository maintainer.
