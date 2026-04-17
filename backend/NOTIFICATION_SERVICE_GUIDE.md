# Notification Service Implementation Guide

## Overview
The Notification Service is a microservice designed to send notifications after payment completion. It runs on **port 8088** and integrates seamlessly with the Payment Service.

## Architecture

### Service Layers

#### 1. **Entity Layer** (`Notification.java`)
- UUID primary key
- Enumerations:
  - **NotificationType**: PAYMENT_SUCCESS, PAYMENT_FAILED, APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, PRESCRIPTION_READY, DOCTOR_AVAILABLE, GENERAL_NOTIFICATION
  - **NotificationStatus**: PENDING, SENT, FAILED, RETRYING, DELIVERED, BOUNCED
  - **Channel**: EMAIL, SMS, PUSH_NOTIFICATION, IN_APP
- Fields: recipientEmail, recipientPhone, subject, message, emailBody, status, type, channel, retryCount
- Timestamps: createdAt, updatedAt, sentAt

#### 2. **Repository Layer** (`NotificationRepository.java`)
Query methods:
- `findByRecipientEmail(String)` - Get notifications by email
- `findByTransactionId(String)` - Link to payment transactions
- `findByPatientId(String)` - Patient notification history
- `findByStatus(NotificationStatus)` - Filter by status
- `findByChannel(Channel)` - Filter by channel
- `findByCreatedAtBetween(LocalDateTime, LocalDateTime)` - Date range queries

#### 3. **Service Layer**
- **EmailService.java**: Handles email sending with HTML templates and mock fallback
- **NotificationService.java**: Main business logic with 300+ lines including:
  - Multi-channel notification routing
  - Email templates for each notification type
  - Async notification sending
  - Query methods for notification history

#### 4. **API Layer** (`NotificationController.java`)

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/send` | Send generic notification |
| POST | `/api/notifications/payment-confirmation` | Send payment success |
| POST | `/api/notifications/payment-failure` | Send payment failure |
| POST | `/api/notifications/appointment-reminder` | Send appointment reminder |
| GET | `/api/notifications/{id}` | Get notification by ID |
| GET | `/api/notifications/by-email?email=...` | Get by email |
| GET | `/api/notifications/patient/{patientId}` | Get by patient |
| GET | `/api/notifications/transaction/{transactionId}` | Get by transaction |
| GET | `/api/notifications/health` | Health check |

## Integration with Payment Service

### Flow
1. **Payment Confirmation** → Payment Service processes payment
2. **Async Call** → Payment Service calls NotificationClient in separate thread
3. **HTTP POST** → NotificationClient sends HTTP request to Notification Service
4. **Notification Sent** → Notification Service queues and sends notification
5. **Storage** → Notification persisted to database with status

### Code Example (Payment Service)
```java
// In PaymentService.java
private void sendPaymentSuccessNotificationAsync(PaymentTransaction transaction) {
    new Thread(() -> {
        try {
            Thread.sleep(500); // Wait for transaction commit
            String patientEmail = transaction.getPatientEmail() != null 
                ? transaction.getPatientEmail() 
                : "patient@example.com";
            notificationClient.sendPaymentSuccessNotification(
                patientEmail,
                transaction.getId().toString(),
                transaction.getPatientId(),
                transaction.getAmount()
            );
        } catch (Exception e) {
            log.error("Error sending success notification", e);
        }
    }).start();
}
```

## Configuration

### Database
- **Development**: H2 in-memory (auto-created)
- **Production**: PostgreSQL (configure via environment variables)

### Email Configuration
Set these environment variables for real email sending:
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Default Configuration (application.yml)
```yaml
server:
  port: 8088
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
  datasource:
    url: jdbc:h2:mem:notification_test_db
```

## Docker Deployment

### Build
```bash
cd backend/notification-service
./mvnw clean package -DskipTests
```

### Run with Docker Compose
```bash
cd backend
docker-compose up -d notification-service payment-service
```

### Service Discovery
- In docker-compose network: `http://notification-service:8088`
- From host machine: `http://localhost:8088`

## Testing

### 1. Health Check
```bash
curl http://localhost:8088/api/notifications/health
```

### 2. Send Test Notification
```bash
curl -X POST http://localhost:8088/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "patient@example.com",
    "subject": "Test Notification",
    "message": "This is a test.",
    "type": "GENERAL_NOTIFICATION",
    "channel": "EMAIL",
    "patientId": "patient-123"
  }'
```

### 3. Send Payment Confirmation
```bash
curl -X POST "http://localhost:8088/api/notifications/payment-confirmation?recipientEmail=patient@example.com&transactionId=550e8400-e29b-41d4-a716-446655440001&patientId=patient-001&amount=5000"
```

### 4. Query Notifications
```bash
# By email
curl http://localhost:8088/api/notifications/by-email?email=patient@example.com

# By patient
curl http://localhost:8088/api/notifications/patient/patient-001

# By transaction
curl http://localhost:8088/api/notifications/transaction/550e8400-e29b-41d4-a716-446655440001
```

## Postman Collection
Import `Notification_Service_Collection.postman_collection.json` for ready-to-use test requests.

## Email Templates
Notification Service includes pre-built HTML email templates for:
- ✅ Payment Success
- ✅ Payment Failure
- ✅ Appointment Reminder
- ✅ Appointment Confirmed
- ✅ Appointment Cancelled
- ✅ Prescription Ready

## Future Enhancements

### SMS Notifications
- Requires: Twilio or AWS SNS account
- Location: `NotificationService.sendSmsNotification()`
- Status: Interface defined, implementation pending

### Push Notifications
- Requires: Firebase Cloud Messaging or OneSignal
- Location: `NotificationService.sendPushNotification()`
- Status: Interface defined, implementation pending

## File Structure
```
notification-service/
├── src/main/java/com/se73/notification_service/
│   ├── NotificationServiceApplication.java
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── NotificationController.java
│   ├── dto/
│   │   ├── SendNotificationRequest.java
│   │   └── NotificationResponse.java
│   ├── entity/
│   │   └── Notification.java
│   ├── repository/
│   │   └── NotificationRepository.java
│   └── service/
│       ├── NotificationService.java
│       └── EmailService.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml
```

## Technologies Used
- **Spring Boot 4.0.4** - Core framework
- **Spring Security 7.0.6** - Authentication
- **Spring Data JPA** - Database persistence
- **Spring Mail** - Email sending
- **H2 Database** - In-memory testing
- **PostgreSQL 16** - Production database
- **Java 21 LTS** - Runtime
- **Maven 3.11.0** - Build tool

## Build Status
- ✅ Notification Service: **BUILD SUCCESS** (15.104s)
- ✅ Payment Service (with integration): **BUILD SUCCESS** (10.258s)
- ✅ Docker: Ready for deployment
- ✅ Integration: Async notification sending configured

## Git Branch
- **Branch**: `origin/kaveesha/notification`
- **Commit**: `bfc50e6`
- **Changes**: 44 files, 2075 insertions

## Support
For issues or enhancements, refer to the code comments or create an issue in the repository.
