# 🏥 Cloud-Native Healthcare Platform — Project Workload Division

> **Project:** Telemedicine Platform (similar to Channeling.lk / oDoc / mHealth)
> **Architecture:** Microservices | Docker & Kubernetes | React Frontend
> **Team Size:** 4 Members

---

## 👥 Team Overview

### 🤝 Collaborative Foundation (All 4 Members)
> Infrastructure setup, API Gateway, and Authentication/Authorization are **shared responsibilities** completed together as a team before individual work begins.

### 👤 Individual Assignments

| Member | Role Focus | Primary Responsibilities |
|--------|------------|--------------------------|
| **Member 1** | Patient Service & Frontend | Patient Management, Medical Reports, Patient React UI |
| **Member 2** | Doctor Service & Frontend | Doctor Management, Availability, Prescriptions, Doctor React UI |
| **Member 3** | Appointment & Telemedicine | Appointment Booking/Tracking, Video Consultation Integration |
| **Member 4** | Support Services & Admin | Payment, Notification, AI Symptom Checker, Admin Panel |

---

## 🤝 Collaborative Part — All Members (Foundation Phase)

> Complete this together **before** splitting into individual tasks. This ensures a shared understanding of the codebase and a stable base for all services.

### 1. Infrastructure & DevOps (Docker & Kubernetes)
- Write `Dockerfile` for each microservice (each member writes their own)
- Create shared `docker-compose.yml` for local development
- Write Kubernetes manifests (Deployments, Services, Ingress, ConfigMaps, Secrets)
- Set up a CI/CD pipeline (GitHub Actions / GitLab CI)
- Configure environment variable management and secrets
- Set up a container registry (Docker Hub / ECR)
- Set up service discovery and inter-service communication (REST / message broker)

### 2. API Gateway
- Set up and configure a centralized API Gateway (e.g., Kong, NGINX, or AWS API Gateway)
- Route requests to all microservices
- Implement rate limiting, request logging, and load balancing
- Configure CORS policies and shared middleware

### 3. Authentication & Authorization Service
- Implement JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC) for three roles: **Patient**, **Doctor**, **Admin**
- Shared login and registration flow
- Token refresh and revocation logic
- Password hashing with bcrypt
- Secure every microservice endpoint using the shared Auth service

### Collaborative Deliverables
- [ ] Monorepo / multi-repo project structure agreed upon
- [ ] API Gateway fully configured and routing to all services
- [ ] Auth Service with JWT + RBAC (3 roles)
- [ ] `docker-compose.yml` running all services locally
- [ ] Kubernetes base manifests
- [ ] CI/CD pipeline skeleton
- [ ] Shared API documentation structure (Swagger/OpenAPI)

---

## 🧑‍💻 Member 1 — Patient Management Service & Patient Frontend

### 1. Patient Management Service
- Patient profile creation and management (CRUD)
- Upload medical reports and documents (integrate file storage: AWS S3 or MinIO)
- View medical history and past prescriptions
- Patient-specific data access secured by Auth service roles

**API Endpoints:**
```
GET    /api/patients/{id}/profile
PUT    /api/patients/{id}/profile
DELETE /api/patients/{id}
POST   /api/patients/{id}/reports
GET    /api/patients/{id}/reports
GET    /api/patients/{id}/reports/{reportId}
DELETE /api/patients/{id}/reports/{reportId}
GET    /api/patients/{id}/history
GET    /api/patients/{id}/prescriptions
```

### 2. Frontend — Patient Portal (React.js)
- Patient registration and login pages (integrates with shared Auth)
- Patient dashboard (upcoming appointments, quick stats)
- Doctor browsing and search UI (filter by specialty, availability, rating)
- Appointment booking flow (calendar, time slot picker)
- Medical report upload and management interface
- View prescriptions issued by doctors
- View past consultation history
- AI Symptom Checker widget (integrates with Member 4's service)
- Responsive layout for mobile and desktop

### Deliverables
- [ ] Patient Management Service (REST API)
- [ ] File upload integration (S3 / MinIO)
- [ ] Patient-facing React.js UI (all patient pages)
- [ ] Database schema for patient records and reports
- [ ] Unit and integration tests
- [ ] Swagger documentation for all Patient APIs

---

## 🧑‍💻 Member 2 — Doctor Management Service & Doctor Frontend

### 1. Doctor Management Service
- Doctor profile creation and management (CRUD)
- Specialty, qualifications, and bio management
- Availability schedule management (set/update time slots and working hours)
- Accept or reject appointment requests
- Issue digital prescriptions to patients
- View patient-uploaded medical reports and history

**API Endpoints:**
```
GET    /api/doctors
GET    /api/doctors/{id}/profile
PUT    /api/doctors/{id}/profile
DELETE /api/doctors/{id}
GET    /api/doctors/{id}/availability
PUT    /api/doctors/{id}/availability
POST   /api/doctors/{id}/availability/slots
DELETE /api/doctors/{id}/availability/slots/{slotId}
GET    /api/doctors/{id}/appointments
PUT    /api/appointments/{id}/accept
PUT    /api/appointments/{id}/reject
POST   /api/prescriptions
GET    /api/prescriptions/{id}
GET    /api/doctors/{id}/patients/{patientId}/reports
```

### 2. Frontend — Doctor Portal (React.js)
- Doctor registration and login (integrates with shared Auth)
- Doctor dashboard (pending requests, today's schedule)
- Availability management UI (weekly calendar editor)
- Appointment request accept/reject interface
- Patient record viewer (uploaded reports, history)
- Digital prescription issuance form
- Consultation history log
- Responsive layout for mobile and desktop

### Deliverables
- [ ] Doctor Management Service (REST API)
- [ ] Availability scheduling logic
- [ ] Digital prescription module
- [ ] Doctor-facing React.js UI (all doctor pages)
- [ ] Database schema for doctor records, slots, and prescriptions
- [ ] Unit and integration tests
- [ ] Swagger documentation for all Doctor APIs

---

## 🧑‍💻 Member 3 — Appointment Service & Telemedicine Service

### 1. Appointment Service
- Search doctors by specialty, name, availability, and date
- Book, modify, and cancel appointments
- Real-time appointment status tracking
- Send appointment events to Notification Service (Member 4) via message queue
- Appointment history for both patients and doctors

**API Endpoints:**
```
GET    /api/appointments/search?specialty=&date=&doctorId=
POST   /api/appointments/book
GET    /api/appointments/{id}
PUT    /api/appointments/{id}/modify
DELETE /api/appointments/{id}/cancel
GET    /api/appointments/{id}/status
GET    /api/appointments/patient/{patientId}
GET    /api/appointments/doctor/{doctorId}
```

### 2. Telemedicine Service (Video Session Integration)
- Integrate a third-party video API: **Agora**, **Twilio Video**, or **Jitsi Meet**
- Generate secure, time-limited session tokens per consultation
- Create and manage video rooms (start, join, end)
- Link each video session to a confirmed appointment
- Handle session state (waiting, active, completed)
- Log session duration and completion status

**API Endpoints:**
```
POST   /api/telemedicine/session/create
GET    /api/telemedicine/session/{sessionId}/token
PUT    /api/telemedicine/session/{sessionId}/start
PUT    /api/telemedicine/session/{sessionId}/end
GET    /api/telemedicine/session/{sessionId}/status
GET    /api/telemedicine/session/appointment/{appointmentId}
```

### 3. Frontend — Shared Video Consultation UI Component (React.js)
- In-browser video call interface (reused by both Patient and Doctor portals)
- Session join/leave controls, mute/camera toggle
- Waiting room screen before session starts
- Post-consultation summary screen

### Deliverables
- [ ] Appointment Service (REST API)
- [ ] Telemedicine Service with third-party video API integration
- [ ] Video session token management
- [ ] Shared React video consultation UI component
- [ ] Database schema for appointments and sessions
- [ ] Unit and integration tests
- [ ] Swagger documentation for Appointment and Telemedicine APIs

---

## 🧑‍💻 Member 4 — Payment, Notification, AI Symptom Checker & Admin Panel

### 1. Payment Service
- Integrate a payment gateway: **PayHere** / **Dialog Genie** / **FriMi** (LK) or **Stripe** / **PayPal** (sandbox)
- Handle payment initiation for consultation fees
- Payment confirmation and status via webhooks
- Refund handling for cancelled appointments
- Transaction history accessible by patients and admin

**API Endpoints:**
```
POST   /api/payments/initiate
POST   /api/payments/confirm
GET    /api/payments/transaction/{id}
GET    /api/payments/patient/{patientId}/history
POST   /api/payments/refund/{transactionId}
GET    /api/payments/admin/all
```

### 2. Notification Service
- Trigger SMS and email notifications for:
  - Appointment booking confirmation
  - Appointment reminder (24 hours before)
  - Consultation completion
  - Prescription issued
  - Payment receipt
- Integrate third-party SMS: **Dialog API**, **Twilio SMS**, or **Vonage**
- Integrate email service: **SendGrid**, **AWS SES**, or **Mailgun**
- Consume events asynchronously from the message queue

**API Endpoints:**
```
POST   /api/notifications/send-email
POST   /api/notifications/send-sms
GET    /api/notifications/patient/{patientId}/history
GET    /api/notifications/doctor/{doctorId}/history
```

### 3. AI Symptom Checker Service
- Allow patients to input symptoms and receive preliminary health suggestions
- Integrate AI/ML API: **OpenAI GPT**, **Google Gemini**, or **Hugging Face**
- Return a recommended doctor specialty based on symptoms
- Include a medical disclaimer on all responses

**API Endpoints:**
```
POST   /api/ai/symptom-check
  Body:     { "symptoms": ["fever", "cough", "fatigue"] }
  Response: { "suggestions": "...", "recommended_specialty": "General Physician", "disclaimer": "..." }
```

### 4. Admin Panel (React.js)
- Admin login with elevated privileges (integrates with shared Auth)
- Manage all patient and doctor accounts (view, suspend, delete)
- Verify and approve new doctor registrations
- View all appointments, transactions, and platform activity
- Financial dashboard (revenue, refunds, transaction volume)
- System health overview (service statuses)

### Deliverables
- [ ] Payment Service with gateway integration
- [ ] Notification Service (SMS + Email, async)
- [ ] AI Symptom Checker Service
- [ ] Admin React.js Panel (all admin pages)
- [ ] Database schema for payments, notifications, and AI logs
- [ ] Unit and integration tests
- [ ] Swagger documentation for all Support Service APIs

---

## 📋 Shared Individual Responsibilities

Each member is responsible for the following on their own services:

| Task | Details |
|------|---------|
| **Database Schema** | Design and maintain schema for their own microservice (PostgreSQL / MongoDB) |
| **API Documentation** | Document all APIs with Swagger / OpenAPI 3.0 |
| **Unit Testing** | Write tests for their own services (Jest / JUnit / PyTest) |
| **Dockerfile** | Write and maintain the Dockerfile for their own service |
| **Code Review** | Review pull requests from at least one other team member |
| **Sprint Participation** | Attend standups and keep task board (Jira / Trello / GitHub Projects) updated |

---

## 🏗️ System Architecture Summary

```
                    ┌──────────────────────────────────────┐
                    │             React Frontend            │
                    │  Patient UI  |  Doctor UI  |  Admin   │
                    │  (Member 1)  |  (Member 2) | (Member4)│
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────▼───────────────────┐
                    │         API Gateway  (Shared)         │
                    └──┬──────────┬──────────┬──────────┬──┘
                       │          │          │          │
             ┌─────────▼─┐  ┌─────▼─────┐ ┌─▼────────┐ ┌▼───────────┐
             │  Patient  │  │  Doctor   │ │Appointment│ │  Payment   │
             │  Service  │  │  Service  │ │& Telemedi-│ │Notification│
             │ (Member 1)│  │ (Member 2)│ │  cine     │ │AI Checker  │
             └───────────┘  └───────────┘ │ (Member 3)│ │ (Member 4) │
                                          └───────────┘ └────────────┘
                    ┌──────────────────────────────────────┐
                    │       Auth Service  (Shared)          │
                    │  JWT + RBAC: Patient / Doctor / Admin │
                    └──────────────────────────────────────┘
```

---

## 📅 Suggested Timeline (8 Weeks)

| Week | Phase | Focus |
|------|-------|-------|
| **Week 1** | 🤝 Collaborative | Project setup, repo structure, DB schema planning, tech stack agreement |
| **Week 2** | 🤝 Collaborative | Auth service, API Gateway, Docker Compose, Kubernetes base manifests |
| **Week 3** | 👤 Individual | Patient service, Doctor service core APIs |
| **Week 4** | 👤 Individual | Appointment service, Telemedicine video integration |
| **Week 5** | 👤 Individual | Payment gateway, Notification service, AI Symptom Checker |
| **Week 6** | 👤 Individual | All React frontends (Patient, Doctor, Admin portals) |
| **Week 7** | 🤝 Collaborative | Full Kubernetes deployment, CI/CD pipeline, integration testing |
| **Week 8** | 🤝 Collaborative | Bug fixes, API documentation review, security audit, final demo |

---

## 🛠️ Suggested Technology Stack

| Layer | Technology Options |
|-------|--------------------|
| **Frontend** | React.js, Axios, React Router, Tailwind CSS |
| **Backend** | Node.js (Express) / Spring Boot / Django / FastAPI |
| **Database** | PostgreSQL (relational) + MongoDB (documents/reports) |
| **Auth** | JWT + bcrypt + Spring Security / Passport.js |
| **Video** | Agora SDK / Twilio Video / Jitsi Meet |
| **Payment** | PayHere / Stripe / PayPal (sandbox) |
| **SMS/Email** | Twilio / SendGrid / AWS SES |
| **AI/ML** | OpenAI API / Hugging Face / Google Gemini |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (K8s) |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Message Queue** | RabbitMQ / Apache Kafka |
| **File Storage** | AWS S3 / MinIO |
| **CI/CD** | GitHub Actions / GitLab CI |

---

*Infrastructure, API Gateway, and Authentication are collaborative — built together as a team.*
*The remaining platform is divided equally, with each member owning ~25% of the individual workload.*