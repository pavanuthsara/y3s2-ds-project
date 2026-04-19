# Payment Service Testing Guide

## Quick Status Check
```bash
# Check if services are running
lsof -i :8081 | grep java  # Auth Service
lsof -i :8080 | grep java  # API Gateway  
lsof -i :8086 | grep java  # Payment Service
```

## Step 1: Get Authentication Token
**Request:**
```
Method: POST
URL: http://localhost:8080/api/auth/login
Body (JSON):
{
  "email": "patient@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "patient-123",
    "email": "patient@test.com",
    "role": "PATIENT"
  }
}
```

**Save this token** - you'll need it for all payment requests!

---

## Step 2: Initiate Payment
**Request:**
```
Method: POST
URL: http://localhost:8086/api/payments/initiate
Headers:
  Authorization: Bearer <your-token-from-step-1>
  Content-Type: application/json
Body (JSON):
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-123",
  "amount": 5000.00,
  "currency": "LKR",
  "description": "Consultation Fee"
}
```

**Expected Response:**
```json
{
  "transactionId": "uuid-here",
  "status": "PENDING",
  "amount": 5000.00,
  "currency": "LKR",
  "clientSecret": "pi_test_...",
  "redirectUrl": "https://checkout.stripe.com/pay/pi_test_..."
}
```

**Save the transactionId and clientSecret** for next step!

---

## Step 3: Confirm Payment (Simulated)
**Request:**
```
Method: POST
URL: http://localhost:8086/api/payments/confirm
Headers:
  Authorization: Bearer <your-token>
  Content-Type: application/json
Body (JSON):
{
  "transactionId": "<transactionId-from-step-2>",
  "paymentMethodId": "pm_test_visa"
}
```

**Expected Response:**
```json
{
  "transactionId": "uuid",
  "status": "SUCCESS",
  "amount": 5000.00,
  "paidAt": "2024-04-16T10:30:00Z",
  "message": "Payment confirmed successfully"
}
```

---

## Step 4: Get Transaction Details
**Request:**
```
Method: GET
URL: http://localhost:8086/api/payments/transaction/<transactionId>
Headers:
  Authorization: Bearer <your-token>
```

**Expected Response:**
```json
{
  "transactionId": "uuid",
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-123",
  "amount": 5000.00,
  "currency": "LKR",
  "status": "SUCCESS",
  "paymentGateway": "STRIPE",
  "gatewayPaymentId": "pi_test_...",
  "paidAt": "2024-04-16T10:30:00Z",
  "createdAt": "2024-04-16T10:29:00Z"
}
```

---

## Step 5: Get Payment History
**Request:**
```
Method: GET
URL: http://localhost:8086/api/payments/patient/patient-123/history
Headers:
  Authorization: Bearer <your-token>
```

**Expected Response:**
```json
[
  {
    "transactionId": "uuid1",
    "appointmentId": "550e8400-...",
    "amount": 5000.00,
    "status": "SUCCESS",
    "paidAt": "2024-04-16T10:30:00Z"
  },
  {
    "transactionId": "uuid2",
    "appointmentId": "550e8400-...",
    "amount": 2500.00,
    "status": "PENDING",
    "paidAt": null
  }
]
```

---

## Step 6: Refund Payment
**Request:**
```
Method: POST
URL: http://localhost:8086/api/payments/refund/<transactionId>
Headers:
  Authorization: Bearer <your-token>
```

**Expected Response:**
```json
{
  "transactionId": "uuid",
  "status": "REFUNDED",
  "amount": 5000.00,
  "refundedAt": "2024-04-16T10:31:00Z",
  "message": "Payment refunded successfully"
}
```

---

## Health Check
**Request:**
```
Method: GET
URL: http://localhost:8086/api/payments/health
```

**Expected Response:**
```json
{
  "status": "Payment service is running!"
}
```

---

## Troubleshooting

### Services Not Running?
```bash
# Start services in order
cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project

# 1. Start database
docker-compose up -d payment-postgres

# 2. Start Auth Service
cd backend/auth-service
./mvnw spring-boot:run &

# 3. Start API Gateway
cd ../api-gateway
./mvnw spring-boot:run &

# 4. Start Payment Service
cd ../payment-service
java -jar target/payment-service-0.0.1-SNAPSHOT.jar &
```

### Authentication Failed?
- Token expired? Get a new one from Step 1
- Wrong endpoint? Use `http://localhost:8080/api/auth/login` (through API Gateway)
- Authorization header missing? Include `Authorization: Bearer <token>`

### Payment Request Failed?
- Check payment service logs: `tail -50 /tmp/payment-service.log`
- Verify appointmentId format (must be UUID)
- Ensure JWT token is still valid
- Check database connection: `docker ps` (payment-postgres running?)

