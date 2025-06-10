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

### Doctor Features
- **Professional Profile**: Create and manage detailed professional profiles with qualifications and experience
- **Availability Management**: Set and update time slots for patient appointments
- **Appointment Overview**: View upcoming and past appointments
- **Patient Information**: Access basic information about patients with appointments

### Recent Enhancements (June 2025)
- **Booking status workflow (doctor)** – Pending ➜ Confirmed/Completed/Cancelled with coloured status pills.
- **Prescription module** – Doctors can add prescription text; patients see it in their bookings.
- **Real-time in-app notifications** – Socket.IO server/client set-up, doctors receive instant toast on new booking.
- **Collapsible long text** – Comments & prescriptions now toggle View/Hide on both dashboards.
- **Unified appointment cards** – Doctor dashboard now uses the same styled card layout as patient dashboard for UI consistency.
- **UI color parity** – Doctor and patient dashboards now share identical colors, spacing, and status-pill palette.
- **Dashboard headings** – Added “My appointments” heading to the doctor dashboard for clarity.

## Technology Stack

### Frontend
- **React.js**: Component-based UI development
- **React Router**: Navigation and routing
- **Tailwind CSS**: Styling and responsive design
- **React Context API**: State management
- **React Icons**: UI icons (e.g., for star ratings)
- **React Toastify**: User notification system (e.g., for feedback submission status)
- **Stripe.js**: Payment processing integration
- **Socket.IO Client**: Real-time client-side communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication and authorization
- **Bcrypt.js**: Password hashing
- **Nodemailer**: Email sending functionality
- **Stripe API**: Payment processing
- **Cloudinary**: Image storage and management
- **Socket.IO**: Real-time server-side communication

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
npm install socket.io
```

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
npm install socket.io-client
# For the doctor review feature, ensure you have react-icons and react-toastify:
npm install react-icons react-toastify 
```

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

### Doctor Management
- `GET /api/v1/doctors`: Get all doctors
- `GET /api/v1/doctors/:id`: Get doctor by ID
- `GET /api/v1/doctors/profile/me`: Get current doctor profile
- `PUT /api/v1/doctors/:id`: Update doctor profile

- `PUT /api/v1/doctors/profile/update`: Update doctor profile (authenticated)

### Appointments
- `GET /api/v1/bookings/user/:userId`: Get user bookings
- `GET /api/v1/bookings/doctor/:doctorId`: Get doctor bookings
- `POST /api/v1/bookings`: Create a new booking
- `GET /api/v1/bookings/:id`: Get booking by ID
- `DELETE /api/v1/bookings/:id`: Cancel booking (via API only)

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

For additional assistance, please contact the repository maintainer.

_Last updated: June 10 2025_
