
# Hospital Management System (HMS)

A full-stack Hospital Management System built using Spring Boot, React, MySQL, and Docker.

The application provides separate functionality for Patients and Doctors, including authentication, appointment booking, appointment management, appointment tracking, doctor changing, appointment cancellation, payments, patient profiles, and medical reports.
## 🎥 Frontend & Backend Connection

[![Watch the video](https://img.youtube.com/vi/Dgyf7-9daMQ/maxresdefault.jpg)](https://youtu.be/Dgyf7-9daMQ)

---

## Features

### Authentication

- Patient signup and login
- Doctor signup and login
- Role-based dashboard navigation
- User profile management
- MySQL-based user storage

### Patient Features

Patients can:

- Register and login
- View the Patient Dashboard
- View and edit their profile
- View available doctors
- Book appointments
- View booked appointments
- Track appointment status
- View appointment journey/timeline
- Change doctor for an appointment
- Cancel appointments
- View payment information
- View medical reports

### Doctor Features

Doctors can:

- Login to the Doctor Dashboard
- View assigned appointments
- View patient information
- Accept appointments
- Start consultations
- Complete appointments
- Update appointment status
- Manage patient appointments

---

## Appointment Lifecycle

Appointments follow the following lifecycle:

Scheduled → Confirmed → In Progress → Completed

Appointments can also be cancelled when they are eligible for cancellation:

Scheduled → Cancelled

### Appointment Statuses

- Scheduled
- Confirmed
- In Progress
- Completed
- Cancelled

---

## Appointment Tracking

The application provides an appointment tracking system that allows patients to see the complete journey of an appointment.

Example:

Scheduled
↓
Confirmed
↓
In Progress
↓
Completed

Each tracking record contains:

- Appointment ID
- Status
- Location
- Updated time

Example tracking response:

```json
{
  "appointmentId": 5,
  "patientName": "patient1",
  "doctorName": "doctor1",
  "currentStatus": "Scheduled",
  "timeline": [
    {
      "appointmentId": 5,
      "status": "Scheduled",
      "location": "Hospital",
      "updatedAt": "2026-08-12T21:01:06"
    }
  ]
}
````

---

## Change Doctor

Patients can change the doctor assigned to an eligible appointment.

Flow:

Patient
↓
View Appointment
↓
Change Doctor
↓
Select New Doctor
↓
Appointment Doctor Updated
↓
Doctor Changed Added To Timeline
↓
Appointment Returns To Scheduled

Example tracking:

Scheduled
↓
Doctor Changed
↓
Scheduled

The previous tracking history is preserved.

---

## Cancel Appointment

Patients can cancel eligible appointments.

Flow:

Scheduled → Cancelled

Cancelled appointments cannot continue through the normal consultation flow.

Completed appointments cannot be changed back to another status.

---

## Payment Management

The system supports appointment-related payment information.

Payment information includes:

* Amount
* Appointment ID
* Patient name
* Doctor name
* Payment method
* Payment status
* Payment date/time

Example:

```json
{
  "amount": 800.0,
  "appointmentId": 2,
  "doctorName": "doctor1",
  "patientName": "patient1",
  "paymentMethod": "UPI",
  "status": "Paid"
}
```

---

## Patient Profile

Patients can view and edit their personal profile.

Profile information includes:

* Full name
* Email
* Username
* Role

The patient profile can be accessed from the Patient Dashboard.

---

## Medical Reports

The Patient module also supports viewing medical report information.

Reports can be associated with the patient's medical information and appointments.

The reports section can be extended to support:

* Diagnosis
* Medical history
* Prescription
* Doctor information
* Medical documents
* PDF reports

---

# Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS
* React Router
* Fetch API

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* REST APIs

## Database

* MySQL
* SQL

## DevOps

* Docker
* Docker Networking
* Dockerized Spring Boot Backend
* Dockerized MySQL

## API Testing

* Postman

---

# Project Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │      Frontend       │
                    │       Vite          │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │     Spring Boot     │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                               │ JPA / Hibernate
                               ▼
                    ┌─────────────────────┐
                    │        MySQL        │
                    │       Database      │
                    └─────────────────────┘

                         Docker
                    ┌───────────────┐
                    │ Docker Network│
                    └───────────────┘
```

---

# Project Structure

```text
HospitalManagementSystem/
│
├── hms-backend/
│   │
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── mahesh/
│   │                   └── hms_backend/
│   │                       │
│   │                       ├── controllers/
│   │                       │   ├── AuthController.java
│   │                       │   ├── AppointmentController.java
│   │                       │   └── PaymentController.java
│   │                       │
│   │                       ├── entity/
│   │                       │   ├── User.java
│   │                       │   ├── Appointment.java
│   │                       │   └── Payment.java
│   │                       │
│   │                       ├── repository/
│   │                       │   ├── UserRepository.java
│   │                       │   ├── AppointmentRepository.java
│   │                       │   └── PaymentRepository.java
│   │                       │
│   │                       ├── service/
│   │                       │   └── AuthService.java
│   │                       │
│   │                       └── dto/
│   │                           ├── LoginRequest.java
│   │                           ├── SignupRequest.java
│   │                           └── AuthResponse.java
│   │
│   ├── Dockerfile
│   └── pom.xml
│
└── hms-frontend/
    │
    ├── src/
    │   │
    │   ├── components/
    │   │
    │   ├── pages/
    │   │   ├── Auth.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── BookAppointment.jsx
    │   │   ├── TrackAppointment.jsx
    │   │   ├── ManageAppointments.jsx
    │   │   ├── Doctors.jsx
    │   │   ├── PatientDetails.jsx
    │   │   └── PatientPayments.jsx
    │   │
    │   └── App.jsx
    │
    ├── package.json
    └── vite.config.js
```

---

# Database

The application uses MySQL as the relational database.

## Users Table

The users table stores:

```text
id
fullName
email
username
password
role
```

Roles:

```text
doctor
patient
```

## Appointments Table

The appointment entity contains:

```text
id
doctorName
patientName
appointmentTime
status
```

Example appointment:

```json
{
  "id": 5,
  "doctorName": "doctor1",
  "patientName": "patient1",
  "appointmentTime": "2026-08-16T14:20:00",
  "status": "Scheduled"
}
```

## Appointment Tracking

Tracking records contain:

```text
id
appointmentId
status
location
updatedAt
```

Tracking records preserve the history of an appointment.

---

# REST API Endpoints

## Authentication

### Signup

```http
POST /api/auth/signup
```

### Login

```http
POST /api/auth/login
```

### Get Profile

```http
GET /api/auth/profile/{username}
```

### Update Profile

```http
PUT /api/auth/profile/{username}
```

---

# Appointment APIs

### Create Appointment

```http
POST /api/appointments
```

Example:

```json
{
  "patientName": "patient1",
  "doctorName": "doctor1",
  "appointmentTime": "2026-08-16T14:20:00",
  "status": "Scheduled"
}
```

### Get Patient Appointments

```http
GET /api/appointments/patient/{patientName}
```

### Get Doctor Appointments

```http
GET /api/appointments/doctor/{doctorName}
```

### Get Doctors

```http
GET /api/appointments/doctors
```

### Update Appointment Status

```http
PUT /api/appointments/{id}/status
```

Example:

```text
/api/appointments/5/status?status=Confirmed&location=Doctor's%20Office
```

### Track Appointment

```http
GET /api/appointments/{id}/tracking
```

### Change Doctor

```http
PUT /api/appointments/{id}/change-doctor
```

### Cancel Appointment

```http
PUT /api/appointments/{id}/status
```

Example:

```text
/api/appointments/5/status?status=Cancelled&location=Hospital
```

---

# Payment APIs

### Create Payment

```http
POST /api/payments
```

### Get Payments

```http
GET /api/payments
```

Payments are associated with appointments and patients.

---

# Frontend Routes

```text
/                         → Login / Signup

/doctor                   → Doctor Dashboard

/doctor/:doctorName/manage
                          → Manage Doctor Appointments

/patient                  → Patient Dashboard

/book-appointment         → Book Appointment

/track-appointment        → Track Appointment

/doctors                  → Doctors List

/patient-details/:id      → Patient Details
```

---

# Patient Workflow

```text
Signup
   ↓
Login
   ↓
Patient Dashboard
   ↓
View Doctors
   ↓
Book Appointment
   ↓
Scheduled
   ↓
Track Appointment
   ↓
Doctor Confirms
   ↓
Confirmed
   ↓
Doctor Starts Consultation
   ↓
In Progress
   ↓
Doctor Completes Consultation
   ↓
Completed
   ↓
Payment / Reports
```

---

# Doctor Workflow

```text
Doctor Signup/Login
        ↓
Doctor Dashboard
        ↓
View Appointments
        ↓
Accept Appointment
        ↓
Confirmed
        ↓
Start Consultation
        ↓
In Progress
        ↓
Complete Appointment
        ↓
Completed
```

---

# Running the Backend

Navigate to the backend directory:

```bash
cd hms-backend
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

# Running the Frontend

Navigate to the frontend directory:

```bash
cd hms-frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

# Running with Docker

Build the backend Docker image:

```bash
docker build -t hms-backend .
```

Run the backend container:

```bash
docker run -p 8080:8080 hms-backend
```

Check running containers:

```bash
docker ps
```

Check Docker networks:

```bash
docker network ls
```

The project uses Docker networking to allow application containers to communicate with each other.

---

# API Testing

Postman can be used to test the backend APIs.

Recommended testing order:

```text
1. Signup
2. Login
3. Get Doctors
4. Create Appointment
5. Get Patient Appointments
6. Get Doctor Appointments
7. Confirm Appointment
8. Start Consultation
9. Complete Appointment
10. Track Appointment
11. Change Doctor
12. Cancel Appointment
13. Create Payment
14. Get Payment Information
15. Get Patient Profile
16. Update Patient Profile
17. View Medical Reports
```

---

# Error Handling

The backend validates appointment status transitions.

For example:

```text
Scheduled → Confirmed
Confirmed → In Progress
In Progress → Completed
```

Invalid transitions are rejected by the backend.

For example:

```text
Completed → Scheduled
Completed → Confirmed
Completed → Cancelled
```

are not allowed.

---

# Security

The current project implements authentication and role-based frontend navigation.

For production deployment, the following improvements can be added:

* Spring Security
* JWT authentication
* BCrypt password hashing
* Backend role-based authorization
* HttpOnly cookies
* Input validation
* Global exception handling
* HTTPS
* Environment variables for database credentials
* Secure payment integration

---

# Future Improvements

The following features can be added in future versions:

* Admin Dashboard
* Spring Security with JWT
* Password encryption
* Doctor availability management
* Email notifications
* SMS notifications
* Online payment gateway
* Prescription management
* PDF medical reports
* File upload for medical documents
* Doctor ratings and reviews
* Real-time notifications
* WebSocket integration
* Redis caching
* Kafka event-driven architecture
* CI/CD pipeline
* Kubernetes deployment
* Cloud deployment

---

# Learning Outcomes

Through this project, the following technologies and concepts were implemented:

* Java
* Spring Boot
* REST API development
* Spring Data JPA
* Hibernate
* MySQL
* SQL
* React
* Vite
* React Router
* CRUD operations
* Frontend-backend integration
* API testing using Postman
* Docker
* Docker networking
* Database integration
* Appointment workflow management
* State management in React

---

# Author

## Uma Maheswar

B.Tech Information Technology
Vishnu Institute of Technology

GitHub:

koyaumamaheswar14-cmd

---

# License

This project is developed for educational and project development purposes.

```
```
