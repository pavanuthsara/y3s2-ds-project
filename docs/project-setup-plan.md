# 🏥 Healthcare Platform — Project Setup Plan

> **Tech Stack:** React.js (Frontend) + Spring Boot (Backend Microservices)
> **Architecture:** Microservices | Docker & Kubernetes | PostgreSQL + MongoDB

---

## 📁 1. Repository Structure

We recommend a **monorepo** approach — all services and the frontend live in one repository. This simplifies CI/CD, cross-service navigation, and shared config management.

```
healthcare-platform/
│
├── README.md
├── docker-compose.yml                  # Run all services locally
├── .env.example                        # Shared environment variable template
├── .gitignore
│
├── k8s/                                # Kubernetes manifests (Shared - All Members)
│   ├── namespace.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── api-gateway/
│   ├── auth-service/
│   ├── patient-service/
│   ├── doctor-service/
│   ├── appointment-service/
│   ├── telemedicine-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── ai-service/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Build & test on pull request
│       └── cd.yml                      # Deploy on merge to main
│
│
├── backend/
│   │
│   ├── api-gateway/                    # 🤝 Shared — Spring Cloud Gateway
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/gateway/
│   │   │       ├── GatewayApplication.java
│   │   │       ├── config/
│   │   │       │   ├── GatewayConfig.java
│   │   │       │   └── SecurityConfig.java
│   │   │       └── filter/
│   │   │           └── AuthFilter.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── auth-service/                   # 🤝 Shared — JWT + RBAC
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/auth/
│   │   │       ├── AuthApplication.java
│   │   │       ├── controller/
│   │   │       │   └── AuthController.java
│   │   │       ├── service/
│   │   │       │   ├── AuthService.java
│   │   │       │   └── JwtService.java
│   │   │       ├── model/
│   │   │       │   ├── User.java
│   │   │       │   └── Role.java (enum: PATIENT, DOCTOR, ADMIN)
│   │   │       ├── repository/
│   │   │       │   └── UserRepository.java
│   │   │       ├── dto/
│   │   │       │   ├── LoginRequest.java
│   │   │       │   ├── RegisterRequest.java
│   │   │       │   └── AuthResponse.java
│   │   │       └── config/
│   │   │           └── SecurityConfig.java
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── patient-service/                # 👤 Member 1
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/patient/
│   │   │       ├── PatientApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── doctor-service/                 # 👤 Member 2
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/doctor/
│   │   │       ├── DoctorApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── appointment-service/            # 👤 Member 3
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/appointment/
│   │   │       ├── AppointmentApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── telemedicine-service/           # 👤 Member 3
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/telemedicine/
│   │   │       ├── TelemedicineApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── payment-service/                # 👤 Member 4
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/payment/
│   │   │       ├── PaymentApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── notification-service/           # 👤 Member 4
│   │   ├── src/main/java/
│   │   │   └── com/healthcare/notification/
│   │   │       ├── NotificationApplication.java
│   │   │       ├── consumer/           # Kafka/RabbitMQ listeners
│   │   │       ├── service/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── dto/
│   │   │       └── config/
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   └── ai-service/                     # 👤 Member 4
│       ├── src/main/java/
│       │   └── com/healthcare/ai/
│       │       ├── AiApplication.java
│       │       ├── controller/
│       │       ├── service/
│       │       ├── dto/
│       │       └── config/
│       ├── src/main/resources/
│       │   └── application.yml
│       ├── Dockerfile
│       └── pom.xml
│
│
└── frontend/                           # React.js — split by portal
    ├── package.json
    ├── vite.config.js                  # (or CRA)
    ├── tailwind.config.js
    ├── .env.example
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── api/                        # Axios service calls per microservice
        │   ├── authApi.js
        │   ├── patientApi.js           # Member 1
        │   ├── doctorApi.js            # Member 2
        │   ├── appointmentApi.js       # Member 3
        │   ├── telemedicineApi.js      # Member 3
        │   ├── paymentApi.js           # Member 4
        │   └── aiApi.js               # Member 4
        │
        ├── components/                 # Shared reusable UI components
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── LoadingSpinner.jsx
        │   └── VideoRoom.jsx           # Member 3
        │
        ├── context/
        │   └── AuthContext.jsx         # Global auth state (JWT, role)
        │
        ├── hooks/
        │   ├── useAuth.js
        │   └── useAppointments.js
        │
        ├── pages/
        │   ├── auth/                   # 🤝 Shared
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   │
        │   ├── patient/                # 👤 Member 1
        │   │   ├── PatientDashboard.jsx
        │   │   ├── DoctorSearch.jsx
        │   │   ├── BookAppointment.jsx
        │   │   ├── MedicalReports.jsx
        │   │   ├── Prescriptions.jsx
        │   │   └── SymptomChecker.jsx
        │   │
        │   ├── doctor/                 # 👤 Member 2
        │   │   ├── DoctorDashboard.jsx
        │   │   ├── AvailabilityManager.jsx
        │   │   ├── AppointmentRequests.jsx
        │   │   ├── PatientRecords.jsx
        │   │   └── IssuePrescription.jsx
        │   │
        │   ├── consultation/           # 👤 Member 3
        │   │   ├── WaitingRoom.jsx
        │   │   └── VideoConsultation.jsx
        │   │
        │   └── admin/                  # 👤 Member 4
        │       ├── AdminDashboard.jsx
        │       ├── UserManagement.jsx
        │       ├── DoctorVerification.jsx
        │       └── Transactions.jsx
        │
        └── routes/
            └── AppRoutes.jsx           # React Router config with role guards
```

---

## 🛠️ 2. Tech Stack & Dependencies

### Backend — Spring Boot (per service)

| Dependency | Purpose |
|------------|---------|
| `spring-boot-starter-web` | REST API support |
| `spring-boot-starter-security` | Security config |
| `spring-boot-starter-data-jpa` | ORM with Hibernate |
| `spring-boot-starter-data-mongodb` | MongoDB support (reports, sessions) |
| `spring-boot-starter-validation` | Request validation |
| `spring-cloud-starter-gateway` | API Gateway routing |
| `spring-boot-starter-actuator` | Health check endpoints |
| `jjwt-api` / `jjwt-impl` | JWT creation and validation |
| `postgresql` | PostgreSQL JDBC driver |
| `spring-kafka` or `spring-amqp` | Message queue (Kafka or RabbitMQ) |
| `springdoc-openapi-starter-webmvc-ui` | Swagger UI auto-generation |
| `lombok` | Boilerplate reduction |
| `mapstruct` | DTO ↔ Entity mapping |
| `aws-java-sdk-s3` or `minio` | File storage (medical reports) |

**Java version:** Java 17+ | **Spring Boot version:** 3.x

### Frontend — React.js

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | Core framework |
| `react-router-dom` | Client-side routing + role guards |
| `axios` | HTTP client for API calls |
| `tailwindcss` | Utility-first CSS styling |
| `@tanstack/react-query` | Server state management & caching |
| `react-hook-form` | Form handling and validation |
| `zod` | Schema-based form validation |
| `zustand` | Lightweight global state (auth, user) |
| `agora-rtc-react` or `twilio-video` | Video consultation SDK |
| `react-calendar` / `react-datepicker` | Appointment date/time pickers |
| `react-toastify` | Toast notifications |
| `jwt-decode` | Decode JWT for role extraction |

**Node version:** 18+ | **Build tool:** Vite (recommended over CRA)

---

## 🗄️ 3. Database Schema

Each microservice owns its own database (Database-per-Service pattern).

---

### 🔐 Auth Service — PostgreSQL

**Table: `users`**
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
    is_active     BOOLEAN DEFAULT TRUE,
    is_verified   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);
```

**Table: `refresh_tokens`**
```sql
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

### 🧑‍⚕️ Patient Service — PostgreSQL + MongoDB

**Table: `patients` (PostgreSQL)**
```sql
CREATE TABLE patients (
    id             UUID PRIMARY KEY,              -- Same UUID as users.id in Auth DB
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    date_of_birth  DATE,
    gender         VARCHAR(10),
    phone_number   VARCHAR(20),
    address        TEXT,
    blood_group    VARCHAR(5),
    profile_photo  VARCHAR(500),                  -- S3/MinIO URL
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);
```

**Collection: `medical_reports` (MongoDB)**
```json
{
  "_id": "ObjectId",
  "patient_id": "UUID",
  "file_name": "blood_test_jan2025.pdf",
  "file_url": "https://s3.../reports/uuid/filename.pdf",
  "file_type": "application/pdf",
  "description": "Annual blood test",
  "uploaded_at": "ISODate",
  "tags": ["blood", "annual"]
}
```

**Collection: `medical_history` (MongoDB)**
```json
{
  "_id": "ObjectId",
  "patient_id": "UUID",
  "doctor_id": "UUID",
  "appointment_id": "UUID",
  "diagnosis": "Upper respiratory tract infection",
  "notes": "Doctor consultation notes...",
  "date": "ISODate"
}
```

---

### 👨‍⚕️ Doctor Service — PostgreSQL

**Table: `doctors`**
```sql
CREATE TABLE doctors (
    id                UUID PRIMARY KEY,            -- Same UUID as users.id in Auth DB
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    specialty         VARCHAR(100) NOT NULL,
    qualifications    TEXT,
    bio               TEXT,
    phone_number      VARCHAR(20),
    profile_photo     VARCHAR(500),               -- S3/MinIO URL
    consultation_fee  DECIMAL(10, 2),
    is_verified       BOOLEAN DEFAULT FALSE,
    rating            DECIMAL(3, 2) DEFAULT 0.0,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

**Table: `availability_slots`**
```sql
CREATE TABLE availability_slots (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id    UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week  VARCHAR(10) NOT NULL,            -- MONDAY, TUESDAY, etc.
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);
```

**Table: `prescriptions`**
```sql
CREATE TABLE prescriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL,
    patient_id      UUID NOT NULL,
    doctor_id       UUID NOT NULL,
    diagnosis       TEXT,
    notes           TEXT,
    issued_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name   VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration        VARCHAR(100),
    instructions    TEXT
);
```

---

### 📅 Appointment Service — PostgreSQL

**Table: `appointments`**
```sql
CREATE TABLE appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL,
    doctor_id       UUID NOT NULL,
    slot_id         UUID NOT NULL,
    appointment_date DATE NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED',
                                      'COMPLETED','NO_SHOW')),
    reason          TEXT,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

### 🎥 Telemedicine Service — PostgreSQL

**Table: `video_sessions`**
```sql
CREATE TABLE video_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID UNIQUE NOT NULL,
    room_name       VARCHAR(255) UNIQUE NOT NULL,
    provider        VARCHAR(50) NOT NULL,         -- AGORA, TWILIO, JITSI
    patient_token   TEXT,
    doctor_token    TEXT,
    status          VARCHAR(20) DEFAULT 'SCHEDULED'
                    CHECK (status IN ('SCHEDULED','WAITING','ACTIVE','COMPLETED')),
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,
    duration_mins   INT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

### 💳 Payment Service — PostgreSQL

**Table: `transactions`**
```sql
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID NOT NULL,
    patient_id          UUID NOT NULL,
    amount              DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(5) DEFAULT 'LKR',
    payment_gateway     VARCHAR(50) NOT NULL,     -- PAYHERE, STRIPE, PAYPAL
    gateway_order_id    VARCHAR(255),
    gateway_payment_id  VARCHAR(255),
    status              VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    paid_at             TIMESTAMP,
    refunded_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

### 🔔 Notification Service — MongoDB

**Collection: `notifications`**
```json
{
  "_id": "ObjectId",
  "recipient_id": "UUID",
  "recipient_type": "PATIENT | DOCTOR",
  "channel": "EMAIL | SMS",
  "type": "APPOINTMENT_CONFIRMED | REMINDER | PRESCRIPTION_ISSUED | PAYMENT_SUCCESS",
  "subject": "Appointment Confirmed",
  "message": "Your appointment with Dr. Silva on April 5th at 10:00 AM is confirmed.",
  "status": "SENT | FAILED | PENDING",
  "sent_at": "ISODate",
  "created_at": "ISODate"
}
```

---

### 🤖 AI Service — MongoDB

**Collection: `symptom_checks`**
```json
{
  "_id": "ObjectId",
  "patient_id": "UUID",
  "symptoms": ["fever", "cough", "fatigue"],
  "ai_response": "These symptoms may indicate a viral infection...",
  "recommended_specialty": "General Physician",
  "confidence_score": 0.87,
  "disclaimer": "This is not a medical diagnosis. Please consult a doctor.",
  "model_used": "gpt-4",
  "checked_at": "ISODate"
}
```

---

## ⚙️ 4. Project Setup Steps

### Step 1 — Repository & Tools Setup (Day 1, All Members)

```bash
# 1. Create GitHub organization and monorepo
git clone https://github.com/your-org/healthcare-platform
cd healthcare-platform

# 2. Create folder structure
mkdir -p backend/{api-gateway,auth-service,patient-service,doctor-service,\
appointment-service,telemedicine-service,payment-service,notification-service,ai-service}
mkdir -p frontend/src k8s .github/workflows

# 3. Initialize React frontend
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom tailwindcss @tanstack/react-query \
  react-hook-form zod zustand jwt-decode react-toastify

# 4. Initialize each Spring Boot service via Spring Initializr
# https://start.spring.io — select: Spring Web, Spring Security,
# Spring Data JPA, Spring Data MongoDB, Lombok, Validation, Actuator
```

### Step 2 — Spring Boot Service Base Structure (All Members)

Each service follows this standard internal package layout:

```
controller/   →  REST endpoints (@RestController)
service/      →  Business logic (@Service)
repository/   →  JPA/Mongo repositories (@Repository)
model/        →  JPA Entities or Mongo Documents
dto/          →  Request/Response objects
config/       →  Security, Swagger, Beans
exception/    →  Custom exceptions + GlobalExceptionHandler
```

### Step 3 — Shared `application.yml` Pattern

Each service has its own `application.yml`. Use this naming pattern:

```yaml
# backend/patient-service/src/main/resources/application.yml
spring:
  application:
    name: patient-service
  datasource:
    url: jdbc:postgresql://localhost:5432/patient_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  data:
    mongodb:
      uri: ${MONGO_URI}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

server:
  port: 8082             # Each service gets a unique port (see port map below)

jwt:
  secret: ${JWT_SECRET}

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
```

### Step 4 — Service Port Map

| Service | Port |
|---------|------|
| API Gateway | 8080 |
| Auth Service | 8081 |
| Patient Service | 8082 |
| Doctor Service | 8083 |
| Appointment Service | 8084 |
| Telemedicine Service | 8085 |
| Payment Service | 8086 |
| Notification Service | 8087 |
| AI Service | 8088 |
| React Frontend | 5173 |
| PostgreSQL | 5432 |
| MongoDB | 27017 |
| RabbitMQ / Kafka | 5672 / 9092 |

### Step 5 — Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  mongodb:
    image: mongo:6
    ports: ["27017:27017"]
    volumes:
      - mongo_data:/data/db

  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]

  api-gateway:
    build: ./backend/api-gateway
    ports: ["8080:8080"]
    depends_on: [auth-service]

  auth-service:
    build: ./backend/auth-service
    ports: ["8081:8081"]
    depends_on: [postgres]
    env_file: .env

  patient-service:
    build: ./backend/patient-service
    ports: ["8082:8082"]
    depends_on: [postgres, mongodb]
    env_file: .env

  doctor-service:
    build: ./backend/doctor-service
    ports: ["8083:8083"]
    depends_on: [postgres]
    env_file: .env

  appointment-service:
    build: ./backend/appointment-service
    ports: ["8084:8084"]
    depends_on: [postgres, rabbitmq]
    env_file: .env

  telemedicine-service:
    build: ./backend/telemedicine-service
    ports: ["8085:8085"]
    depends_on: [postgres]
    env_file: .env

  payment-service:
    build: ./backend/payment-service
    ports: ["8086:8086"]
    depends_on: [postgres]
    env_file: .env

  notification-service:
    build: ./backend/notification-service
    ports: ["8087:8087"]
    depends_on: [mongodb, rabbitmq]
    env_file: .env

  ai-service:
    build: ./backend/ai-service
    ports: ["8088:8088"]
    depends_on: [mongodb]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [api-gateway]

volumes:
  postgres_data:
  mongo_data:
```

### Step 6 — PostgreSQL Database Initialization Script

```sql
-- scripts/init-db.sql  (runs automatically in Docker)
CREATE DATABASE auth_db;
CREATE DATABASE patient_db;
CREATE DATABASE doctor_db;
CREATE DATABASE appointment_db;
CREATE DATABASE telemedicine_db;
CREATE DATABASE payment_db;
```

### Step 7 — Standard Dockerfile (per Spring Boot service)

```dockerfile
# backend/patient-service/Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Step 8 — `.env.example` (Shared Template)

```env
# Database
DB_USERNAME=admin
DB_PASSWORD=secret
MONGO_URI=mongodb://localhost:27017

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY_MS=3600000

# AWS S3 / MinIO
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
S3_BUCKET_NAME=healthcare-reports

# Video (choose one)
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=

# Payment
PAYHERE_MERCHANT_ID=
PAYHERE_SECRET=
STRIPE_SECRET_KEY=

# Email
SENDGRID_API_KEY=
MAIL_FROM=noreply@healthcare.lk

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI
OPENAI_API_KEY=
```

---

## 📋 5. Week 1–2 Collaborative Checklist

### Week 1 — Setup
- [ ] Create GitHub org, monorepo, branch protection rules (`main`, `develop`)
- [ ] Agree on Git workflow (feature branches → `develop` → `main`)
- [ ] Set up project management board (GitHub Projects / Jira)
- [ ] Initialize all Spring Boot services via Spring Initializr
- [ ] Initialize React frontend with Vite + Tailwind
- [ ] Create folder structure as per repo layout above
- [ ] Define and document all API contracts (request/response DTOs)
- [ ] Design and review all DB schemas together
- [ ] Create `docker-compose.yml` and verify all services start

### Week 2 — Auth & Gateway
- [ ] Implement `User` entity and `UserRepository` in Auth Service
- [ ] Implement `/auth/register` and `/auth/login` endpoints
- [ ] JWT token generation and validation (`JwtService`)
- [ ] Role-based `SecurityConfig` (PATIENT / DOCTOR / ADMIN)
- [ ] Implement `AuthFilter` in API Gateway to validate JWT on every request
- [ ] Configure API Gateway routing rules to all services
- [ ] Test auth flow end-to-end (register → login → access protected route)
- [ ] Build shared `AuthContext` in React with login/logout/role state
- [ ] Build `ProtectedRoute` component with role guards
- [ ] Create Login and Register pages in React
- [ ] Write basic unit tests for Auth Service
- [ ] Verify `docker-compose up` starts all containers cleanly

---

*This plan covers project setup for Weeks 1–2. Individual service development begins in Week 3.*