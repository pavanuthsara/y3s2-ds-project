# API Gateway & Auth Service Implementation

## Overview
This document describes the implementation of the **API Gateway** and **Auth Service** for the healthcare platform. These are core components of the microservices architecture.

---

## Architecture

### 1. Auth Service (Port: 8081)
The Auth Service handles all authentication and user management operations. It manages user registration, login, and JWT token generation.

**Key Features:**
- User registration with role assignment (PATIENT, DOCTOR, ADMIN)
- User login with JWT token generation
- Token validation
- User profile retrieval

### 2. API Gateway (Port: 8080)
The API Gateway is the single entry point for all client requests. It routes requests to appropriate microservices and enforces JWT authentication.

**Key Features:**
- Request routing to microservices
- JWT token validation
- CORS handling
- Health checks

---

## Project Structure

### Auth Service
```
auth-service/
├── src/main/java/com/se73/auth_service/
│   ├── model/
│   │   ├── User.java              # User entity with role-based access
│   │   └── UserRole.java          # Enum: PATIENT, DOCTOR, ADMIN
│   ├── repository/
│   │   └── UserRepository.java    # Database queries for User
│   ├── security/
│   │   └── JwtTokenProvider.java  # JWT token generation & validation
│   ├── service/
│   │   └── UserService.java       # Business logic for user operations
│   ├── dto/
│   │   ├── RegisterRequest.java   # Registration payload
│   │   ├── LoginRequest.java      # Login payload
│   │   └── AuthResponse.java      # Token response
│   ├── controller/
│   │   └── AuthController.java    # REST endpoints
│   ├── config/
│   │   └── SecurityConfig.java    # Spring Security configuration
│   └── AuthServiceApplication.java
├── resources/
│   └── application.properties     # Database & JWT configuration
└── pom.xml
```

### API Gateway
```
api-gateway/
├── src/main/java/com/se73/api_gateway/
│   ├── security/
│   │   └── JwtTokenProvider.java  # JWT token validation
│   ├── filter/
│   │   └── JwtAuthenticationFilter.java  # Authentication filter
│   ├── config/
│   │   ├── GatewayConfig.java     # Route configuration
│   │   └── SecurityConfig.java    # Spring Security configuration
│   └── ApiGatewayApplication.java
├── resources/
│   └── application.properties     # Server & JWT configuration
└── pom.xml
```

---

## API Endpoints

### Auth Service (http://localhost:8081)

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"  // or DOCTOR, ADMIN
}

Response:
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

#### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

#### 3. Validate Token
```
GET /api/auth/validate
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "username": "john_doe"
}
```

#### 4. Get User Info
```
GET /api/auth/user/{username}
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"
}
```

---

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL 12+
- Git

### Database Setup

1. Create PostgreSQL database for Auth Service:
```sql
CREATE DATABASE auth_service_db;
```

2. Update credentials in `auth-service/src/main/resources/application.properties`:
```properties
spring.datasource.username=<your_postgres_user>
spring.datasource.password=<your_postgres_password>
```

### Build and Run

#### Build Auth Service
```bash
cd backend/auth-service
mvn clean install
```

#### Run Auth Service
```bash
mvn spring-boot:run
```
Auth Service runs on: http://localhost:8081

#### Build API Gateway
```bash
cd backend/api-gateway
mvn clean install
```

#### Run API Gateway
```bash
mvn spring-boot:run
```
API Gateway runs on: http://localhost:8080

---

## Gateway Routes

The API Gateway routes requests to the following microservices:

| Route | Service | Port | Status |
|-------|---------|------|--------|
| `/api/auth/**` | Auth Service | 8081 | ✅ Implemented |
| `/api/patients/**` | Patient Service | 8082 | 🔄 To be implemented |
| `/api/doctors/**` | Doctor Service | 8083 | 🔄 To be implemented |
| `/api/appointments/**` | Appointment Service | 8084 | 🔄 To be implemented |
| `/api/payments/**` | Payment Service | 8085 | 🔄 To be implemented |
| `/api/notifications/**` | Notification Service | 8086 | 🔄 To be implemented |

---

## JWT Token Authentication Flow

```
1. Client sends credentials to Auth Service
   POST /api/auth/login
   
2. Auth Service validates credentials
   └─ If valid: generates JWT token
   └─ If invalid: returns 401 Unauthorized
   
3. Client uses token for subsequent requests
   Authorization: Bearer <token>
   
4. API Gateway validates token
   └─ If valid: forwards request to target service
   └─ If invalid: returns 401 Unauthorized
   
5. Microservice processes request with authenticated user context
```

---

## Security Features

### Auth Service
- ✅ Password encryption (BCrypt)
- ✅ JWT token generation (24-hour expiration)
- ✅ User role-based access (PATIENT, DOCTOR, ADMIN)
- ✅ Input validation
- ✅ CORS support

### API Gateway
- ✅ JWT token validation
- ✅ Request routing
- ✅ CORS handling
- ✅ Unauthenticated endpoint exclusions

---

## Configuration

### JWT Secret
Default: `mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789`

⚠️ **IMPORTANT**: Change this in production!

Update in both services:
- `auth-service/src/main/resources/application.properties`
- `api-gateway/src/main/resources/application.properties`

```properties
app.jwt.secret=<your-secure-secret-key>
```

### JWT Expiration
Default: 86400000 ms (24 hours)

Update in Auth Service:
```properties
app.jwt.expiration=86400000
```

---

## Testing

### Using cURL

#### Register a user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

#### Use token for authenticated request
```bash
TOKEN="<token_from_login_response>"
curl -X GET http://localhost:8080/api/auth/user/john_doe \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

1. **Patient Service** - User profile, medical records, appointment booking
2. **Doctor Service** - Profile management, availability scheduling
3. **Appointment Service** - Booking, status tracking, notifications
4. **Payment Service** - Transaction processing, invoice generation
5. **Notification Service** - SMS/Email alerts
6. **Video Consultation Service** - Real-time video streaming (Agora/Jitsi)

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Database Connection Error
- Ensure PostgreSQL is running
- Verify database credentials in properties files
- Check database name is correct

### JWT Token Invalid
- Ensure token is not expired (24-hour default)
- Check JWT secret matches between Auth Service and API Gateway
- Verify token format: `Bearer <token>`

---

## Contributing
- Follow REST API best practices
- Add comprehensive error handling
- Include unit tests for new features
- Update documentation with changes

