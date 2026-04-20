# Healthcare Platform - Telemedicine System

A cloud-native, scalable telemedicine platform that enables patients to book appointments, attend video consultations, and receive AI-powered health suggestions. Built with microservices architecture using Spring Boot and React.

## 🎯 Project Overview

This healthcare platform provides a comprehensive digital health solution featuring:

- **Patient Management**: Registration, profile management, and medical history tracking
- **Doctor Management**: Availability scheduling, appointment management, and digital prescriptions
- **Appointment System**: Real-time appointment booking, modification, and status tracking
- **Telemedicine**: Secure video consultations with integrated video conferencing
- **Payments**: Integrated payment gateway for consultation fees
- **Notifications**: SMS and email notifications for appointments and confirmations
- **AI Symptom Checker**: AI-powered preliminary health assessments
- **Admin Dashboard**: Platform monitoring and user management

## ✨ Key Features

### For Patients

- Browse and search doctors by specialty
- Book, modify, and cancel appointments
- Attend secure video consultations
- Upload and manage medical reports
- View medical history and prescriptions
- Make secure payments
- Receive appointment notifications
- AI-powered symptom analysis

### For Doctors

- Manage profile and availability schedules
- Accept/reject appointment requests
- Conduct telemedicine sessions
- Issue digital prescriptions
- View patient medical records
- Manage consultation fees

### For Admins

- User account management
- Doctor registration verification
- Platform monitoring
- Financial transaction oversight
- System health monitoring

## 🛠️ Technology Stack

### Backend

- **Framework**: Spring Boot 3.x
- **Architecture**: Microservices with API Gateway
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **Container**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **API Documentation**: OpenAPI/Swagger

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Router, Axios
- **Payment**: Stripe.js
- **Video**: Agora RTC SDK

### Services

- **Video Conferencing**: Agora
- **Payment Gateway**: Stripe (Sandbox)
- **Notifications**: Email & SMS services
- **AI/ML**: Symptom checker service

## 📁 Project Structure

```
healthcare-platform/
├── backend/                          # Backend microservices
│   ├── api-gateway/                 # API Gateway (Port 8080)
│   ├── auth-service/                # Authentication Service (Port 8081)
│   ├── patient-service/             # Patient Management
│   ├── doctor-service/              # Doctor Management
│   ├── appointment-service/         # Appointment Management
│   ├── telemedicine-service/        # Video Consultation
│   ├── payment-service/             # Payment Processing
│   ├── notification-service/        # Email & SMS Notifications
│   ├── ai-symptom-checker-service/ # AI Symptom Analysis
│   ├── docker-compose.yml           # Multi-container orchestration
│   └── API_Documentation.md         # API reference
│
├── frontend/                         # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── features/                # Feature modules (payments, etc.)
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Dependencies
│   └── vite.config.js               # Vite configuration
│
├── db/                              # Database initialization
│   └── init/
│       └── 01-create-databases.sql  # Database setup scripts
│
├── k8s/                             # Kubernetes manifests
│   └── k8s.md                       # K8s deployment guide
│
├── docs/                            # Documentation
│   ├── project-requirements.md      # Functional requirements
│   ├── QUICK_START.md               # Quick start guide
│   ├── IMPLEMENTATION_GUIDE.md      # Implementation details
│   └── ...                          # Additional guides
│
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- **Java 17+** - Backend runtime
- **Maven 3.9+** - Build tool
- **Node.js 18+** & **pnpm** - Frontend runtime
- **Docker & Docker Compose** - Containerization
- **PostgreSQL 15+** - Database (or use Docker)

### 1️⃣ Clone & Setup Database

```bash
# Navigate to backend directory
cd backend

# Start all services with Docker Compose
docker-compose up -d --build
```

This command:

- Spins up PostgreSQL database
- Creates necessary databases
- Starts all microservices
- Initializes the API Gateway

**Database Details**:

- Host: `localhost:5432`
- Username: `postgres`
- Password: `postgres`
- Default Database: `auth_service_db`

### 2️⃣ Verify Backend Services

```bash
# Check API Gateway health
curl http://localhost:8080/actuator/health

# Check Auth Service health
curl http://localhost:8081/actuator/health
```

**Service Ports:**
| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 8080 | `http://localhost:8080/actuator/health` |
| Auth Service | 8081 | `http://localhost:8081/actuator/health` |
| Patient Service | 8082 | `http://localhost:8082/actuator/health` |
| Doctor Service | 8083 | `http://localhost:8083/actuator/health` |
| Appointment Service | 8084 | `http://localhost:8084/actuator/health` |
| Payment Service | 8085 | `http://localhost:8085/actuator/health` |
| Telemedicine Service | 8086 | `http://localhost:8086/actuator/health` |
| Notification Service | 8087 | `http://localhost:8087/actuator/health` |
| AI Symptom Checker | 8088 | `http://localhost:8088/actuator/health` |
| PostgreSQL | 5432 | - |

### 3️⃣ Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Frontend runs on: `http://localhost:5173`

### 4️⃣ Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_patient",
    "email": "john@hospital.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_patient",
    "password": "SecurePass123!"
  }'
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /validate` - Validate JWT token
- `GET /user/{id}` - Get user details

### Patient Service (`/api/patients`)

- `GET /` - Get all patients
- `POST /` - Create patient profile
- `GET /{id}` - Get patient details
- `PUT /{id}` - Update patient profile
- `GET /{id}/medical-history` - Get medical history
- `POST /{id}/documents` - Upload medical documents

### Doctor Service (`/api/doctors`)

- `GET /` - Get all doctors
- `POST /` - Register doctor
- `GET /{id}` - Get doctor details
- `PUT /{id}` - Update doctor profile
- `GET /{id}/availability` - Get availability schedule
- `POST /{id}/availability` - Set availability

### Appointment Service (`/api/appointments`)

- `GET /` - Get all appointments
- `POST /` - Book appointment
- `GET /{id}` - Get appointment details
- `PUT /{id}` - Modify appointment
- `DELETE /{id}` - Cancel appointment
- `PUT /{id}/status` - Update appointment status

### Payment Service (`/api/payments`)

- `POST /initiate` - Initiate payment
- `POST /confirm` - Confirm payment
- `GET /transaction/{id}` - Get transaction details
- `GET /patient/{id}/history` - Get payment history
- `POST /refund/{id}` - Refund transaction

### Telemedicine Service (`/api/telemedicine`)

- `POST /session` - Create video session
- `GET /session/{id}` - Get session details
- `PUT /session/{id}/end` - End video session
- `POST /session/{id}/recording` - Get recording link

### Notification Service (`/api/notifications`)

- `POST /send-email` - Send email notification
- `POST /send-sms` - Send SMS notification
- `GET /templates` - Get notification templates

### AI Symptom Checker (`/api/ai-symptom`)

- `POST /analyze` - Analyze symptoms
- `GET /specialties` - Get recommended specialties
- `GET /history/{id}` - Get analysis history

See [API Documentation](backend/API_Documentation.md) for detailed endpoint specifications.

## 📋 Backend Services Setup

### Manual Service Startup (Alternative to Docker Compose)

```bash
# Terminal 1: Auth Service
cd backend/auth-service
mvn spring-boot:run

# Terminal 2: Patient Service
cd backend/patient-service
mvn spring-boot:run

# Terminal 3: Doctor Service
cd backend/doctor-service
mvn spring-boot:run

# Terminal 4: Appointment Service
cd backend/appointment-service
mvn spring-boot:run

# Terminal 5: API Gateway
cd backend/api-gateway
mvn spring-boot:run
```

### Build Backend Services

```bash
# Build all services
cd backend
mvn clean package

# Build specific service
cd backend/auth-service
mvn clean package
```

## 🎨 Frontend Features

### Pages & Components

- **Authentication**: Login, Register, Password Reset
- **Patient Dashboard**: Appointments, Medical Records, Prescriptions
- **Doctor Browser**: Search, Filter by specialty
- **Appointment Booking**: Date/time selection, confirmation
- **Telemedicine**: Video consultation interface
- **Payment**: Secure payment processing with Stripe
- **Notification**: Appointment reminders and confirmations
- **Admin Panel**: User management, transaction monitoring

### Environment Configuration

Create `.env.local` in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
VITE_AGORA_APP_ID=your_agora_app_id
```

## 🧪 Testing

### Using Postman

Import the included Postman collection:

- [Postman Collection](postman_collection.json)

**Quick Test Workflow:**

1. Register user
2. Login and get JWT token
3. Use token in `Authorization: Bearer <token>` header
4. Test service endpoints

### Using cURL

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.token')

# Use token in requests
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

### Payment Testing

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

See [Payment Testing Guide](docs/PAYMENT_SERVICE_TESTING_GUIDE.md) for detailed instructions.

## 🐳 Docker & Containerization

### Build Docker Images

```bash
# Build all services
cd backend
docker-compose build

# Build specific service
docker build -t healthcare/auth-service:latest auth-service/
```

### Run with Docker Compose

```bash
# Start all services (detached mode)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Container Images

- `postgres:15-alpine` - PostgreSQL database
- `healthcare/auth-service:latest` - Auth Service
- `healthcare/api-gateway:latest` - API Gateway
- `healthcare/patient-service:latest` - Patient Service
- `healthcare/doctor-service:latest` - Doctor Service
- `healthcare/appointment-service:latest` - Appointment Service
- `healthcare/payment-service:latest` - Payment Service
- `healthcare/telemedicine-service:latest` - Telemedicine Service
- `healthcare/notification-service:latest` - Notification Service
- `healthcare/ai-symptom-checker:latest` - AI Symptom Checker

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (kubectl configured)
- Container registry access
- ConfigMaps for secrets

### Deploy to Kubernetes

```bash
# Navigate to k8s directory
cd k8s

# Apply manifests
kubectl apply -f .

# Verify deployment
kubectl get pods
kubectl get services

# Check logs
kubectl logs <pod-name>

# Port forward
kubectl port-forward service/api-gateway 8080:8080
```

See [Kubernetes Guide](k8s/k8s.md) for detailed deployment instructions.

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: All API endpoints require JWT authentication
- **Role-Based Access Control**: PATIENT, DOCTOR, ADMIN roles
- **Token Expiration**: 24 hours (configurable)
- **Password Encryption**: Bcrypt hashing
- **CORS**: Configured for frontend domain

### Best Practices

- Store sensitive data in environment variables
- Use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting
- Validate all inputs
- Use parameterized database queries

### Environment Variables

Create `.env` file in backend root:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/auth_service_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_EXPIRATION=86400000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate

# Email Service
EMAIL_FROM=no-reply@healthcare.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_app_password
```

## 📊 Database Schema

The database includes tables for:

- **Users**: User accounts with roles
- **Patients**: Patient profiles and medical records
- **Doctors**: Doctor profiles and specialties
- **Appointments**: Appointment bookings and status
- **Payments**: Transaction records
- **Notifications**: Notification logs
- **AvailabilitySchedule**: Doctor availability slots

See database bootstrap script: [db/init/01-create-databases.sql](db/init/01-create-databases.sql)
Service schemas are managed with Flyway migrations under each backend service's `src/main/resources/db/migration/` directory.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Docker Compose Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check database credentials
psql -U postgres -d auth_service_db -h localhost
```

### Frontend Build Issues

```bash
# Clear node modules and cache
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

### Service Health Checks

```bash
# Check all services
for port in 8080 8081 8082 8083 8084 8085 8086 8087 8088; do
  echo "Port $port:"
  curl -s http://localhost:$port/actuator/health | jq .
done
```

## 📚 Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [API Documentation](backend/API_Documentation.md)
- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
- [Project Requirements](docs/project-requirements.md)
- [Payment Service Guide](docs/PAYMENT_SERVICE_TESTING_GUIDE.md)
- [Doctor Availability Guide](docs/DOCTOR_AVAILABILITY_POSTMAN_TEST_GUIDE.md)
- [AI Symptom Checker Guide](docs/AI_SYMPTOM_CHECKER_TESTING_GUIDE.md)
- [Kubernetes Deployment](k8s/k8s.md)

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production ready
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Guidelines

- Use descriptive commit messages
- Reference issue numbers when applicable
- Follow conventional commits format

### Code Style

- Backend: Google Java Style Guide
- Frontend: ESLint configuration provided
- Run linters before committing

## 🎓 Architecture Patterns

### Microservices Pattern

- Independent service deployment
- Database per service
- API communication via REST
- Service discovery via API Gateway

### API Gateway Pattern

- Single entry point for all clients
- Request routing to appropriate service
- Authentication & authorization
- Rate limiting and logging

### Circuit Breaker Pattern

- Prevent cascading failures
- Automatic retry logic
- Fallback mechanisms

## 🚦 Continuous Integration/Deployment

### Build Pipeline

- Unit tests
- Integration tests
- Code coverage analysis
- Security scanning
- Docker image build
- Push to registry

### Deployment Pipeline

- Dev environment
- Staging environment
- Production environment
- Health checks post-deployment

## 📈 Performance Optimization

- Database indexing on frequently queried columns
- Connection pooling configuration
- Caching strategies
- API response pagination
- Frontend lazy loading

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit pull request
6. Code review and approval

## 📄 License

This project is developed as part of Year 3 Semester 2 coursework.

## 👥 Team

Developed as a group project with the following modules:

- Authentication & API Gateway
- Patient Management
- Doctor Management
- Appointment Booking
- Telemedicine Integration
- Payment Processing
- Notification System
- AI Symptom Checker

## 💬 Support & Contact

For issues, questions, or support:

1. Check existing documentation
2. Review troubleshooting section
3. Check logs for error details
4. Contact project maintainers

## 📝 Version History

- **v1.0.0** - Initial release
  - Core microservices
  - Authentication system
  - Appointment management
  - Payment integration
  - Telemedicine support
  - AI symptom checker
  - React frontend

---

**Last Updated**: April 2025  
**Status**: Active Development
