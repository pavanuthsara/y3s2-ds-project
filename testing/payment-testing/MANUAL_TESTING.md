# 🧪 Manual Payment Testing - Quick Start

## Current Status ✅
- Payment Service: Running on port 8086
- API Gateway: Running on port 8080  
- Auth Service: Running on port 8081
- PostgreSQL: Running on port 5433

---

## Option 1: Using cURL with Authorization Header

### Step 1: Get a Test Token
First, create a token using a simple format. For testing purposes:

```bash
# Generate a test JWT token manually or use:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXRpZW50LTEyMyIsImlhdCI6MTcxMzI2Mjc0OX0.test"

# Or get real token from auth service
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

### Step 2: Test Health Endpoint WITH Token
```bash
TOKEN="your-token-here"

curl -X GET http://localhost:8086/api/payments/health \
  -H "Authorization: Bearer $TOKEN"
```

### Step 3: Initiate a Payment
```bash
curl -X POST http://localhost:8086/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "patient-123",
    "amount": 5000.00,
    "currency": "LKR",
    "description": "Consultation Fee"
  }'
```

---

## Option 2: Using Postman (Recommended)

### Setup:
1. Open Postman
2. Create a new environment called "Healthcare Payment"
3. Add these variables:
   - `base_url` = `http://localhost:8080`
   - `payment_url` = `http://localhost:8086`
   - `auth_token` = `empty` (will be filled after login)
   - `transaction_id` = `empty`

### Test Requests:

#### 1. Login & Get Token
**Method:** POST  
**URL:** `{{base_url}}/api/auth/login`  
**Body (raw JSON):**
```json
{
  "email": "patient@test.com",
  "password": "password123"
}
```
**After Response:** Copy the `token` value and paste into `auth_token` environment variable

#### 2. Health Check
**Method:** GET  
**URL:** `{{payment_url}}/api/payments/health`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`

#### 3. Initiate Payment
**Method:** POST  
**URL:** `{{payment_url}}/api/payments/initiate`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-123",
  "amount": 5000.00,
  "currency": "LKR",
  "description": "Consultation Fee"
}
```
**After Response:** Save the `transactionId` from response

#### 4. Confirm Payment
**Method:** POST  
**URL:** `{{payment_url}}/api/payments/confirm`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440001",
  "paymentMethodId": "pm_test_visa"
}
```

#### 5. Get Transaction Details
**Method:** GET  
**URL:** `{{payment_url}}/api/payments/transaction/550e8400-e29b-41d4-a716-446655440001`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`

#### 6. Get Payment History
**Method:** GET  
**URL:** `{{payment_url}}/api/payments/patient/patient-123/history`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`

#### 7. Refund Payment
**Method:** POST  
**URL:** `{{payment_url}}/api/payments/refund/550e8400-e29b-41d4-a716-446655440001`  
**Headers:**
- `Authorization`: `Bearer {{auth_token}}`

---

## Expected Responses

### Health Check Success
```json
{
  "status": "Payment service is running!"
}
```

### Initiate Payment Success
```json
{
  "transactionId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "PENDING",
  "amount": 5000.00,
  "currency": "LKR",
  "clientSecret": "pi_test_...",
  "redirectUrl": "https://checkout.stripe.com/pay/..."
}
```

### Confirm Payment Success
```json
{
  "transactionId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "SUCCESS",
  "amount": 5000.00,
  "currency": "LKR",
  "gatewayPaymentId": "pi_test_...",
  "paidAt": "2026-04-16T14:15:00Z"
}
```

---

## Quick Troubleshooting

### Error: 403 Forbidden
- Missing or invalid JWT token
- Solution: Include `Authorization: Bearer <token>` header

### Error: 500 Internal Server Error
- Check service logs: `tail -50 /tmp/payment-service.log`
- Database might not be connected
- Solution: Restart payment service

### Error: Connection refused
- Service not running on port
- Solution: Run `./start-all-services.sh` in payment-testing folder

### Error: Token expired
- Get a fresh token by logging in again
- Solution: Repeat login step

---

## Database Queries (Optional)

To verify payments are being saved:

```bash
# Access PostgreSQL
docker exec -it payment-postgres psql -U postgres -d payment_service_db -c "SELECT * FROM payment_transactions LIMIT 5;"
```

---

## Files in This Folder
- `PAYMENT_TEST_GUIDE.md` - Detailed endpoint documentation
- `test-payment.sh` - Automated bash testing script
- `start-all-services.sh` - Start all services at once
- `MANUAL_TESTING.md` - This file
