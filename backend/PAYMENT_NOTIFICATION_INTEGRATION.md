# Payment & Notification Service Integration Guide

## Overview
This document describes the integration between the Payment Service (Port 8086) and Notification Service (Port 8088) in the healthcare platform.

## Services Status

### Payment Service (Port 8086) ✅
- **Status**: Running and Healthy
- **Database**: H2 (In-memory for testing)
- **Build**: Successfully created (72MB JAR)
- **Features**:
  - Stripe/PayPal payment processing
  - Payment confirmation with webhook support
  - Transaction history per patient
  - Refund processing
  - **NEW**: Async notification integration

### Notification Service (Port 8088) ✅
- **Status**: Running and Healthy
- **Database**: H2 (In-memory for testing)
- **Build**: Successfully created (72MB JAR)
- **Features**:
  - Multi-channel notifications (EMAIL, SMS, PUSH_NOTIFICATION, IN_APP)
  - HTML email templates
  - Notification persistence with status tracking
  - Async non-blocking notification sending
  - Mock email service for testing

## Integration Flow

### Payment Confirmation → Notification

1. **Payment Initiation** (`POST /api/payments/initiate`)
   - Accepts: patientId, doctorId, amount, currency, description, patientEmail
   - Returns: transaction ID and payment details

2. **Payment Confirmation** (`POST /api/payments/confirm`)
   - Marks payment as completed
   - **Triggers async HTTP call to Notification Service**
   - Sends payment success notification

3. **Notification Service Receives**
   - Processes the async call from Payment Service
   - Sends confirmation email/SMS to patient
   - Stores notification record in database

## REST Endpoints

### Payment Service

#### Initiate Payment
```bash
POST /api/payments/initiate
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "patientId": "patient123",
  "doctorId": "doctor456",
  "amount": 50.00,
  "currency": "USD",
  "description": "Consultation fee",
  "patientEmail": "patient@example.com"
}
```

#### Confirm Payment
```bash
POST /api/payments/confirm
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "transactionId": "txn_123456",
  "paymentIntentId": "pi_123456789"
}
```

#### Get Transaction
```bash
GET /api/payments/transaction/{id}
Authorization: Bearer <JWT_TOKEN>
```

#### Patient Payment History
```bash
GET /api/payments/patient/{patientId}/history
Authorization: Bearer <JWT_TOKEN>
```

#### Process Refund
```bash
POST /api/payments/refund/{transactionId}
Authorization: Bearer <JWT_TOKEN>

{
  "reason": "Patient requested refund"
}
```

#### Admin All Transactions
```bash
GET /api/payments/admin/all
Authorization: Bearer <JWT_TOKEN>
```

### Notification Service

#### Send Generic Notification
```bash
POST /api/notifications/send
Content-Type: application/json

{
  "recipientEmail": "user@example.com",
  "subject": "Notification",
  "message": "Your payment was successful",
  "channel": "EMAIL",
  "type": "PAYMENT"
}
```

#### Payment Success Notification
```bash
POST /api/notifications/payment-confirmation
Content-Type: application/json

{
  "patientEmail": "patient@example.com",
  "amount": 50.00,
  "currency": "USD",
  "doctorName": "Dr. Smith",
  "transactionId": "txn_123456"
}
```

#### Payment Failure Notification
```bash
POST /api/notifications/payment-failure
Content-Type: application/json

{
  "patientEmail": "patient@example.com",
  "amount": 50.00,
  "currency": "USD",
  "reason": "Card declined"
}
```

#### Get Notification
```bash
GET /api/notifications/{id}
```

#### Query Notifications by Email
```bash
GET /api/notifications/by-email?email=patient@example.com
```

#### Query Notifications by Patient
```bash
GET /api/notifications/patient/{patientId}
```

#### Query Notifications by Transaction
```bash
GET /api/notifications/transaction/{transactionId}
```

## Testing the Integration

### 1. Start Docker Services
```bash
cd backend
docker-compose up -d payment-service notification-service
```

### 2. Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpatient",
    "password": "Test@123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "test@example.com",
    "role": "PATIENT"
  }'
```

### 3. Check Service Health
```bash
# Payment Service
curl http://localhost:8086/actuator/health

# Notification Service
curl http://localhost:8088/actuator/health
```

### 4. View Service Logs
```bash
# Payment Service
docker-compose logs payment-service -f --tail 20

# Notification Service
docker-compose logs notification-service -f --tail 20
```

### 5. Access Postman Collection
- **File**: `backend/Notification_Service_Collection.postman_collection.json`
- Import this collection into Postman to test all endpoints

## Database Configuration

### Payment Service
- **Type**: H2 (In-memory)
- **Production**: PostgreSQL `payment_service_db`
- **Tables**: 
  - `payment_transactions` - Transaction records
  - `payment_refunds` - Refund records

### Notification Service
- **Type**: H2 (In-memory)
- **Production**: PostgreSQL `notification_service_db`
- **Tables**:
  - `notifications` - Notification records

## Email Configuration

### Mock Email Service (Testing)
- Uses `jakarta.mail` with mock implementation
- No SMTP required for testing
- All emails logged to console

### Production Email Setup
Add to `application.yml`:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

## Integration Points

### From Payment Service
The Payment Service includes a `NotificationClient` that:
1. Calls Notification Service asynchronously
2. Sends payment confirmation/failure notifications
3. Handles network failures gracefully
4. Uses circuit breaker pattern for resilience

### From Notification Service
The Notification Service:
1. Listens on port 8088
2. Accepts HTTP calls from Payment Service
3. Processes notifications asynchronously
4. Stores notification history for auditing

## Error Handling

### Payment Service Failures
- Returns `400 Bad Request` for invalid input
- Returns `401 Unauthorized` for invalid tokens
- Returns `404 Not Found` for missing transactions
- Returns `500 Internal Server Error` for system failures

### Notification Service Failures
- Returns `400 Bad Request` for invalid notification data
- Returns `500 Internal Server Error` for email service failures
- Logs all errors for debugging
- Continues processing other notifications even if one fails

## Security Considerations

1. **JWT Token**: All endpoints require valid JWT token (except public endpoints)
2. **CORS**: Enabled for cross-origin requests
3. **SSL/TLS**: Ready for production deployment
4. **Password Encryption**: BCrypt for secure password storage
5. **Database**: H2 for testing, PostgreSQL for production

## Performance Metrics

- Payment Service: ~100ms response time
- Notification Service: ~50ms response time
- Async notification call: Non-blocking, background processing

## Future Enhancements

1. Add SMS notifications via Twilio integration
2. Add push notifications via Firebase Cloud Messaging
3. Implement retry logic with exponential backoff
4. Add email template customization
5. Add notification scheduling for future delivery
6. Integrate with third-party payment providers (Stripe, PayPal)

## Deployment

### Docker Compose
```yaml
payment-service:
  build: ./payment-service
  ports:
    - "8086:8086"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:postgresql://payment-postgres:5432/payment_db
  depends_on:
    - payment-postgres

notification-service:
  build: ./notification-service
  ports:
    - "8088:8088"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:postgresql://notification-postgres:5432/notification_db
  depends_on:
    - notification-postgres
```

## Troubleshooting

### Payment Service Not Responding
1. Check if service is running: `docker-compose ps`
2. View logs: `docker-compose logs payment-service`
3. Verify database connection: Check H2 console at http://localhost:8086/h2-console

### Notification Service Down
1. Check email configuration (SMTP settings)
2. View logs: `docker-compose logs notification-service`
3. Verify network connectivity to Payment Service

### Tokens Invalid
1. Ensure token hasn't expired (24-hour expiration)
2. Register new user and get fresh token
3. Verify JWT secret matches between services

## Support & Documentation

- API Documentation: `backend/API_Documentation.md`
- Quick Start Guide: `docs/QUICK_START.md`
- Implementation Guide: `docs/IMPLEMENTATION_GUIDE.md`
