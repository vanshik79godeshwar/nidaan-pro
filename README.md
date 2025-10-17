<div align="center">

<img src="https://www.google.com/search?q=https://i.imgur.com/your-banner-image.png" alt="Nidaan Pro Banner" width="800"/>

Nidaan Pro: An AI-Powered Distributed Telemedicine Platform

A comprehensive, distributed telemedicine platform designed to bridge the gap between patients and doctors. Built on a robust microservices architecture, it offers a seamless and feature-rich experience for online consultations, from appointment booking and AI-driven pre-consultation to secure video calls and real-time communication.

<p align="center">
<img alt="Java" src="https://www.google.com/search?q=https://img.shields.io/badge/Java-21-blue.svg%3Fstyle%3Dfor-the-badge%26logo%3Dopenjdk%26logoColor%3Dwhite">
<img alt="Spring Boot" src="https://www.google.com/search?q=https://img.shields.io/badge/Spring_Boot-3-success.svg%3Fstyle%3Dfor-the-badge%26logo%3Dspring%26logoColor%3Dwhite">
<img alt="Next.js" src="https://www.google.com/search?q=https://img.shields.io/badge/Next.js-15-black.svg%3Fstyle%3Dfor-the-badge%26logo%3Dnext.js%26logoColor%3Dwhite">
<img alt="React" src="https://www.google.com/search?q=https://img.shields.io/badge/React-18-blue.svg%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3Dwhite">
<img alt="Docker" src="https://www.google.com/search?q=https://img.shields.io/badge/Docker-gray.svg%3Fstyle%3Dfor-the-badge%26logo%3Ddocker%26logoColor%3Dwhite">
<img alt="PostgreSQL" src="https://www.google.com/search?q=https://img.shields.io/badge/PostgreSQL-blue.svg%3Fstyle%3Dfor-the-badge%26logo%3Dpostgresql%26logoColor%3Dwhite">
</p>

</div>

✨ Core Features

🔐 User Authentication & Authorization: Secure, role-based (Patient/Doctor) authentication using JWT, with OTP-based registration and password reset.

👤 Comprehensive Profile Management: Dedicated profile management for both doctors and patients, including specializations, experience, and personal details.

📅 Appointment Booking System: An intuitive system for patients to find doctors, view their availability, and book appointments seamlessly.

🤖 AI-Powered Pre-consultation: An intelligent pre-consultation flow that gathers preliminary information from patients using AI-generated dynamic questions, saving valuable time during the consultation.

📡 Real-time Communication:

Chat Service: Real-time, one-on-one chat between doctors and patients.

Video Consultations: Secure, high-quality video calls for a face-to-face consultation experience.

🚑 Emergency Connect: A critical feature that connects patients with the first available doctor in case of an emergency.

💳 Payment Integration: Seamless payment processing for appointments and emergency consultations, powered by Razorpay.

🔔 Real-time Notifications: Instant in-app and email notifications for appointments, messages, and other important events.

⭐ Doctor Reviews and Ratings: A feedback system for patients to rate and review their consultation experience.

🏛️ System Architecture

Nidaan Pro is built on a microservices architecture, with each service designed to handle a specific business capability. This ensures scalability, resilience, and maintainability.

Service Discovery: Netflix Eureka is used for service registration and discovery, allowing services to locate and communicate with each other dynamically.

API Gateway: A single entry point for all client requests, handled by Spring Cloud Gateway. It's responsible for routing, authentication, and cross-cutting concerns.

Asynchronous Communication: RabbitMQ is used for asynchronous communication between services, ensuring loose coupling and improved fault tolerance.

<details>
<summary>Click to view Microservices Overview</summary>

Service

Description

service-registry

The Eureka server that manages the registration and discovery of all microservices.

api-gateway

The single entry point for all incoming requests. It routes traffic to the appropriate service and handles JWT-based authentication.

auth-service

Manages user authentication, registration with OTP verification, login, and password reset functionalities.

user-profile-service

Handles the creation and management of detailed profiles for both patients and doctors, including specialities, availability, and reviews.

consultation-service

The core service that orchestrates appointments, pre-consultation reports, emergency requests, and video call integration.

notification-service

Responsible for sending real-time in-app notifications (via WebSockets) and email notifications for various events.

chat-service

A real-time chat service that enables one-on-one communication between patients and doctors using STOMP over WebSockets.

payment-service

Integrates with Razorpay to manage payments for appointments and other services.

</details>

💻 Tech Stack

<details>
<summary>Click to view the full Technology Stack</summary>

Backend

Java 21 & Spring Boot 3

Spring Cloud (Gateway, Eureka)

Spring Data JPA (Hibernate)

PostgreSQL

RabbitMQ (for asynchronous communication)

WebSocket (STOMP) (for real-time chat and notifications)

Maven (for dependency management)

Docker (for containerization)

Frontend

Next.js 15 & React 18

TypeScript

Tailwind CSS

Axios

Socket.IO / STOMP.js

DevOps & Third-party Services

Git & GitHub

Razorpay (for payments)

SendGrid (for emails)

Google Gemini AI (for AI-powered pre-consultation)

</details>

🚀 Getting Started

To get the project up and running locally, you'll need to have Java, Node.js, and Docker installed.

Environment Variables

To run this project, you will need to add the following environment variables to your .env file (or application-secrets.properties in the Spring Boot projects).

# Database Configuration
SPRING_DATASOURCE_URL=your_database_url
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Security
JWT_SECRET=your_jwt_secret

# Third-Party APIs
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SENDGRID_API_KEY=your_sendgrid_api_key
GEMINI_API_KEY=your_gemini_api_key
HMS_MANAGEMENT_TOKEN=your_hms_management_token


📖 API Endpoints

<details>
<summary>Click to expand the full API Documentation</summary>

Auth Service (:8080)

Method

Endpoint

Description

<code style="color:green;font-weight:bold">POST</code>

/api/auth/register/request-otp

Request an OTP for registration

<code style="color:green;font-weight:bold">POST</code>

/api/auth/register/verify

Verify OTP and register a user

<code style="color:green;font-weight:bold">POST</code>

/api/auth/login

Log in a user

<code style="color:green;font-weight:bold">POST</code>

/api/auth/forgot-password

Request a password reset token

<code style="color:green;font-weight:bold">POST</code>

/api/auth/reset-password

Reset a user's password

<code style="color:green;font-weight:bold">POST</code>

/api/users/details

Get details for a list of users

User Profile Service (:8081)

Method

Endpoint

Description

<code style="color:green;font-weight:bold">POST</code>

/api/profiles/doctor

Create or update a doctor's profile

<code style="color:green;font-weight:bold">POST</code>

/api/profiles/patient

Create or update a patient's profile

<code style="color:blue;font-weight:bold">GET</code>

/api/profiles/{userId}

Get a user's profile by their ID

<code style="color:blue;font-weight:bold">GET</code>

/api/specialities

Get a list of all medical specialities

<code style="color:green;font-weight:bold">POST</code>

/api/specialities

Create a new medical speciality

<code style="color:blue;font-weight:bold">GET</code>

/api/doctors

Get a list of all doctors

<code style="color:green;font-weight:bold">POST</code>

/api/doctors/{doctorId}/slots

Add a new availability slot for a doctor

<code style="color:blue;font-weight:bold">GET</code>

/api/doctors/{doctorId}/slots

Get a doctor's available slots

<code style="color:green;font-weight:bold">POST</code>

/api/reviews

Submit a review for a doctor

<code style="color:blue;font-weight:bold">GET</code>

/api/reviews/doctor/{doctorId}

Get all reviews for a doctor

Consultation Service (:8082)

Method

Endpoint

Description

<code style="color:green;font-weight:bold">POST</code>

/api/consultations/book

Book a new appointment

<code style="color:blue;font-weight:bold">GET</code>

/api/consultations/patient/{patientId}

Get all appointments for a patient

<code style="color:blue;font-weight:bold">GET</code>

/api/consultations/doctor/{doctorId}

Get all appointments for a doctor

<code style="color:green;font-weight:bold">POST</code>

/api/consultations/reports

Submit a pre-consultation report

<code style="color:blue;font-weight:bold">GET</code>

/api/consultations/reports/appointment/{appointmentId}

Get a pre-consultation report

<code style="color:blue;font-weight:bold">GET</code>

/api/consultations/chat-partners/{userId}

Get a list of users the user can chat with

<code style="color:green;font-weight:bold">POST</code>

/api/consultations/emergency/initiate

Initiate an emergency consultation

<code style="color:blue;font-weight:bold">GET</code>

/api/consultations/emergency/pending

Get pending emergency requests

<code style="color:green;font-weight:bold">POST</code>

/api/consultations/emergency/{requestId}/accept

Accept an emergency request

Notification Service (:8083)

Method

Endpoint

Description

<code style="color:blue;font-weight:bold">GET</code>

/api/notifications/{userId}

Get all notifications for a user

<code style="color:green;font-weight:bold">POST</code>

/api/notifications/{userId}/mark-as-read

Mark all notifications as read

Chat Service (:8084)

Method

Endpoint

Description

<code style="color:purple;font-weight:bold">WebSocket</code>

/chat

Send a real-time chat message

<code style="color:blue;font-weight:bold">GET</code>

/api/chat/history

Get chat history between two users

Payment Service (:8085)

Method

Endpoint

Description

<code style="color:green;font-weight:bold">POST</code>

/api/payments/create-order

Creates a new payment order

<code style="color:green;font-weight:bold">POST</code>

/api/payments/webhook

Handles payment status updates

API Gateway (:9000)

Method

Endpoint

Description

<code style="color:green;font-weight:bold">POST</code>

/api/ai/dynamic-questions

Generates dynamic follow-up questions

</details>

📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
