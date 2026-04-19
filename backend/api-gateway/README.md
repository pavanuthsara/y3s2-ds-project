# API Gateway Service

The API Gateway is the central entry point for the SE73 Microservices project. It acts as a reverse proxy, routing incoming requests from the frontend or external clients to the appropriate backend microservices.

## Responsibilities

- **Request Routing**: Proxies requests to various microservices (Auth, Patient, Doctor, Appointment, etc.).
- **Authentication & Security**: Validates JWT tokens for protected routes.
- **Header Transformation**: Extracts user information (username/ID and roles) from the JWT and injects them as `X-User-Id` and `X-User-Role` headers for downstream services.
- **CORS Management**: Centralized Cross-Origin Resource Sharing configuration.
- **Multipart Support**: Configured to handle large file uploads (up to 50MB), primarily for patient medical reports.

## Tech Stack

- **Framework**: Spring Boot 3.x
- **Security**: Spring Security
- **JWT**: `io.jsonwebtoken` (jjwt)
- **Communication**: `RestTemplate` for manual proxying

## Exposed APIs

The Gateway exposes the following base paths, which are proxied to their respective services:

| Path | Service | Description |
|------|---------|-------------|
| `/api/auth/**` | Auth Service | Login, registration, token validation, and user info. |
| `/api/patients/**` | Patient Service | Patient profile management and medical records. |
| `/api/doctors/**` | Doctor Service | Doctor profile management and search. |
| `/api/doctors/availability/**` | Doctor Service | Management of doctor availability slots. |
| `/api/appointments/**` | Appointment Service | Appointment booking and status tracking. |
| `/api/telemedicine/**` | Telemedicine Service | Virtual consultation management. |
| `/api/symptoms/**` | AI Symptom Service | AI-powered symptom analysis. |
| `/api/prescriptions/**` | Doctor Service* | Creation and retrieval of medical prescriptions. |

*\* Note: Prescription logic is often co-located or related to the Doctor service.*

## Key Features

### JWT Authentication Filter
The gateway implements a `JwtAuthenticationFilter` that intercepts requests (except for public routes like login/register) to:
1. Verify the presence and format of the `Authorization: Bearer <token>` header.
2. Validate the JWT signature and expiration.
3. Extract the `subject` (username) and `authorities` (role).
4. Wrap the request to include `X-User-Id` and `X-User-Role` headers.

### Public Routes
The following routes are configured to bypass mandatory JWT validation:
- `/api/auth/login`
- `/api/auth/register`
- `/health`
- `/actuator/**`

## Known Issues & Limitations

The current implementation has several areas for improvement:

1. **Manual Proxy Architecture**: The gateway uses a manual controller-based proxying approach with `RestTemplate` instead of a specialized solution like **Spring Cloud Gateway**. This leads to significant code redundancy and potential for errors when adding new routes.
2. **Hardcoded URLs**: Some controllers contain hardcoded service URLs (e.g., `http://auth-service:8081`) which complicates deployment across different environments (Dev vs. Docker vs. K8s).
3. **Fragile URL Resolution**: The `PrescriptionProxyController` derives its target URL using string replacement on the Doctor service URL, which is error-prone.
4. **Inconsistent Routing Implementation**:
    - `AppointmentProxyController` uses a generic `/**` mapping.
    - `PatientProxyController`, `SymptomProxyController`, and others manually define every proxied endpoint.
    - Some controllers (like `PatientProxyController`) explicitly require the `Authorization` header in each method, while others extract it from the request context or rely on the `JwtAuthenticationFilter`.
5. **Authorization Passthrough Issues**: 
    - In `SymptomProxyController`, the `Authorization` header is not correctly passed to the downstream service in some methods.
    - `HeaderModifyingRequestWrapper` only overrides `getHeader()`, missing `getHeaders()` or `getHeaderNames()`.
6. **Security Configuration Discrepancy**: `SecurityConfig` is set to `permitAll()` because security is manually handled by `JwtAuthenticationFilter`, which can be confusing for developers familiar with standard Spring Security patterns.
7. **Inconsistent Data Types**: Some controllers use `Long` for IDs while others use `String` or `UUID`, reflecting inconsistencies in the downstream microservices.

## Getting Started

### Prerequisites
- JDK 17 or higher
- Maven 3.6+

### Configuration
Update `src/main/resources/application.properties` or set environment variables for service URLs:
- `AUTH_SERVICE_BASE_URL`
- `PATIENT_SERVICE_BASE_URL`
- `DOCTOR_SERVICE_BASE_URL`
- `APPOINTMENT_SERVICE_BASE_URL`
- ...

### Running the application
```bash
./mvnw spring-boot:run
```
The gateway will start on port `8080` by default.
