# Notification Service - Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Ports available: 8086, 8088, 5437

## Option 1: Run with Docker Compose (Recommended)

### Start Services
```bash
cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project/backend

# Start Payment and Notification services with their databases
docker-compose up -d payment-postgres payment-service notification-service
```

### Verify Services
```bash
# Check if services are running
docker-compose ps | grep -E 'payment|notification'

# Check notification service health
curl http://localhost:8088/api/notifications/health

# Check payment service health
curl http://localhost:8086/actuator/health
```

## Option 2: Run Locally with Java

### Start Notification Service
```bash
cd backend/notification-service
./mvnw spring-boot:run
```

### Start Payment Service (in another terminal)
```bash
cd backend/payment-service
./mvnw spring-boot:run
```

## Testing the Flow

### 1. Test Payment → Notification

#### Step 1: Initiate Payment
```bash
curl -X POST http://localhost:8086/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-001",
    "patientEmail": "patient@example.com",
    "amount": 5000,
    "currency": "USD",
    "reason": "Consultation Fee"
  }'
```

**Response:**
```json
{
  "clientSecret": "pi_xxxxxxx_secret_xxxxxxx",
  "publishableKey": "pk_test_xxxxxxx",
  "paymentIntentId": "pi_xxxxxxx"
}
```

#### Step 2: Confirm Payment
```bash
curl -X POST http://localhost:8086/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-001",
    "patientEmail": "patient@example.com",
    "paymentIntentId": "pi_xxxxxxx",
    "paymentMethodId": "pm_test_method"
  }'
```

**Expected Result:**
- ✅ Payment confirmed
- ✅ Notification Service called automatically
- ✅ Check logs for notification sending

#### Step 3: Query Notifications
```bash
# Get all notifications for patient
curl http://localhost:8088/api/notifications/by-email?email=patient@example.com

# Get notifications by transaction
curl http://localhost:8088/api/notifications/transaction/550e8400-e29b-41d4-a716-446655440001
```

### 2. Test Direct Notification Sending

#### Send Test Email
```bash
curl -X POST http://localhost:8088/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "patient@example.com",
    "subject": "Test Notification",
    "message": "This is a test notification",
    "type": "GENERAL_NOTIFICATION",
    "channel": "EMAIL",
    "patientId": "patient-001"
  }'
```

#### Send Payment Confirmation
```bash
curl -X POST "http://localhost:8088/api/notifications/payment-confirmation?recipientEmail=patient@example.com&transactionId=txn-001&patientId=patient-001&amount=5000"
```

#### Send Payment Failure
```bash
curl -X POST "http://localhost:8088/api/notifications/payment-failure?recipientEmail=patient@example.com&transactionId=txn-001&reason=Card+Declined"
```

### 3. View Notification History

#### By Email
```bash
curl http://localhost:8088/api/notifications/by-email?email=patient@example.com | jq
```

#### By Patient
```bash
curl http://localhost:8088/api/notifications/patient/patient-001 | jq
```

#### By Transaction
```bash
curl http://localhost:8088/api/notifications/transaction/txn-001 | jq
```

#### Get Specific Notification
```bash
curl http://localhost:8088/api/notifications/550e8400-e29b-41d4-a716-446655440011 | jq
```

## Using Postman Collection

1. Import `Notification_Service_Collection.postman_collection.json` into Postman
2. All endpoints are pre-configured with proper URLs and request bodies
3. Start with "Health Check" to verify service is running
4. Then run other tests in sequence

## Viewing Logs

### Docker Logs
```bash
# Notification Service logs
docker-compose logs -f notification-service

# Payment Service logs
docker-compose logs -f payment-service

# Follow both services
docker-compose logs -f payment-service notification-service
```

### Local Console Output
When running locally with `./mvnw spring-boot:run`, logs appear in terminal.

## Mock Email Mode (No SMTP Required)

By default, emails are logged to console (mock mode):
```
[INFO] Sending mock email to: patient@example.com
[INFO] Subject: Payment Confirmation
[INFO] Email template: <HTML content>
```

## Enable Real Email Sending

### Gmail Setup
1. Create App Password in Google Account Settings
2. Set environment variables:
```bash
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

3. Restart services with environment variables set

## Database Access

### H2 Console (Testing)
If H2 console is enabled, access at: `http://localhost:8088/h2-console`
- JDBC URL: `jdbc:h2:mem:notification_test_db`
- User: `sa`
- Password: (empty)

### PostgreSQL (Production)
```bash
# Connect to notification database
psql -h localhost -p 5437 -U postgres -d notification_service_db

# View notifications table
SELECT id, recipient_email, type, status, created_at FROM notification;
```

## Troubleshooting

### Service Won't Start
```bash
# Check if ports are already in use
lsof -i :8088  # Notification Service
lsof -i :8086  # Payment Service
lsof -i :5437  # Payment Database

# Kill process using port (if needed)
kill -9 <PID>
```

### Connection Refused
- Ensure docker-compose services are running: `docker-compose ps`
- Check if services have started (takes ~10-15 seconds)
- Verify port mappings: `docker-compose ps`

### Notification Not Received
1. Check notification service logs: `docker-compose logs notification-service`
2. Verify email address is correct
3. Check SMTP configuration if real emails enabled
4. Query notification database to see if stored: `curl .../by-email?email=...`

### Database Errors
- H2 auto-creates schema on first run
- PostgreSQL requires database to exist (created via docker-compose)
- Check `docker-compose logs` for database startup errors

## Performance Tips

1. **Async Sending**: Notifications sent in separate threads (non-blocking)
2. **Batch Operations**: Query notifications in date ranges for large datasets
3. **Indexing**: Database automatically indexes by email, patientId, transactionId
4. **Caching**: Consider Redis for frequently accessed notification lists (future enhancement)

## Next Steps

1. ✅ Services started and tested
2. ⏭️  Create pull request for code review
3. ⏭️  Set up CI/CD pipeline
4. ⏭️  Integrate with frontend
5. ⏭️  Configure real SMTP email service
6. ⏭️  Add SMS gateway integration
7. ⏭️  Add push notifications

---

**Questions?** Refer to [NOTIFICATION_SERVICE_GUIDE.md](./NOTIFICATION_SERVICE_GUIDE.md) for detailed documentation.
