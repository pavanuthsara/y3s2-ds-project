# Payment Service - Postman Testing Quick Start

## Step 1: Start the Services

Before testing, make sure the services are running:

```bash
cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project/backend

# Start all services (Auth, API Gateway, Payment)
docker-compose up -d

# Check if services are running
docker-compose ps
```

Expected running services:
- ✅ auth-postgres (port 5432)
- ✅ auth-service (port 8081)
- ✅ api-gateway (port 8080)
- ✅ payment-postgres (port 5433)
- ✅ payment-service (port 8086)

Verify health:
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8086/api/payments/health
```

---

## Step 2: Postman Environment Setup

### Create New Environment
1. Click **"Environments"** button (left sidebar)
2. Click **"+"** to create new environment
3. Name: `Healthcare Payment`
4. Add variables:

```
base_url              http://localhost:8080
auth_base             http://localhost:8081
payment_base          http://localhost:8086
auth_token            (leave empty)
transaction_id        (leave empty)
payment_intent_id     (leave empty)
appointment_id        550e8400-e29b-41d4-a716-446655440000
patient_id            patient-doctor-001
```

5. Click **"Save"**

---

## Step 3: Complete Testing Sequence

### ⭐ Test 1: Health Check

**Request:**
```
GET {{payment_base}}/api/payments/health
```

**Expected Response (200 OK):**
```json
{
  "status": "Payment Service is running",
  "timestamp": 1713274800000
}
```

---

### ⭐ Test 2: Register User (One-Time)

**Request:**
```
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "username": "doctor_postman_1",
  "email": "doctor_postman_1@hospital.com",
  "password": "SecurePass123!",
  "firstName": "Postman",
  "lastName": "Doctor",
  "role": "DOCTOR"
}
```

**Expected Response (201 Created or 400 if exists):**
```json
{
  "id": "user-uuid",
  "username": "doctor_postman_1",
  "email": "doctor_postman_1@hospital.com",
  "role": "DOCTOR"
}
```

---

### ⭐ Test 3: Login (Save JWT Token)

**Request:**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "doctor_postman_1",
  "password": "SecurePass123!"
}
```

**Tests Tab (Paste this):**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("token");
});

pm.test("Save auth_token to environment", function () {
    const jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
});
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "doctor_postman_1",
  "role": "DOCTOR"
}
```

✅ **After this request, verify `auth_token` is saved** (check Environment Variables)

---

### ⭐ Test 4: Initiate Payment

**Request:**
```
POST {{payment_base}}/api/payments/initiate
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "appointmentId": "{{appointment_id}}",
  "amount": 5000.00,
  "currency": "LKR",
  "patientId": "{{patient_id}}",
  "description": "Online Consultation Fee"
}
```

**Tests Tab:**
```javascript
pm.test("Status is 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("transactionId");
    pm.expect(jsonData).to.have.property("clientSecret");
    pm.expect(jsonData).to.have.property("paymentGateway");
});

pm.test("Save transaction details", function () {
    const jsonData = pm.response.json();
    pm.environment.set("transaction_id", jsonData.transactionId);
    pm.environment.set("payment_intent_id", jsonData.clientSecret.substring(0, jsonData.clientSecret.indexOf("_")));
});
```

**Expected Response (201 Created):**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440111",
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-doctor-001",
  "amount": 5000.00,
  "currency": "LKR",
  "status": "PENDING",
  "paymentGateway": "STRIPE",
  "clientSecret": "pi_1234567890_secret_xyz",
  "paidAt": null,
  "createdAt": "2026-04-16T10:30:00"
}
```

✅ **After this request, check Environment Variables for `transaction_id`**

---

### ⭐ Test 5: Get Transaction Details

**Request:**
```
GET {{payment_base}}/api/payments/transaction/{{transaction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440111",
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-doctor-001",
  "amount": 5000.00,
  "currency": "LKR",
  "status": "PENDING",
  "paymentGateway": "STRIPE",
  "createdAt": "2026-04-16T10:30:00"
}
```

---

### ⭐ Test 6: Get Patient Transaction History

**Request:**
```
GET {{payment_base}}/api/payments/patient/{{patient_id}}/history
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "transactionId": "550e8400-e29b-41d4-a716-446655440111",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 5000.00,
    "status": "PENDING",
    "paymentGateway": "STRIPE",
    "paidAt": null,
    "createdAt": "2026-04-16T10:30:00"
  }
]
```

---

## Step 4: Error Testing

### ❌ Test: Missing Authorization Header

**Request:**
```
POST {{payment_base}}/api/payments/initiate
Content-Type: application/json

{
  "appointmentId": "{{appointment_id}}",
  "amount": 5000.00,
  "currency": "LKR",
  "patientId": "{{patient_id}}"
}
```

**Expected Error (401 Unauthorized)**

---

### ❌ Test: Invalid Amount

**Request:**
```
POST {{payment_base}}/api/payments/initiate
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "appointmentId": "{{appointment_id}}",
  "amount": 0,
  "currency": "LKR",
  "patientId": "{{patient_id}}"
}
```

**Expected Error (400 Bad Request):**
```json
{
  "amount": "Amount must be greater than 0"
}
```

---

### ❌ Test: Transaction Not Found

**Request:**
```
GET {{payment_base}}/api/payments/transaction/invalid-uuid
Authorization: Bearer {{auth_token}}
```

**Expected Error (404 Not Found):**
```json
{
  "error": "Transaction not found with ID: invalid-uuid"
}
```

---

## Complete Postman Collection JSON

Import this as a collection in Postman:

```json
{
  "info": {
    "name": "Payment Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Health Check",
      "request": {
        "method": "GET",
        "url": "{{payment_base}}/api/payments/health"
      }
    },
    {
      "name": "2. Register User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"username\": \"doctor_postman_1\", \"email\": \"doctor_postman_1@hospital.com\", \"password\": \"SecurePass123!\", \"firstName\": \"Postman\", \"lastName\": \"Doctor\", \"role\": \"DOCTOR\"}"
        }
      }
    },
    {
      "name": "3. Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\": \"doctor_postman_1\", \"password\": \"SecurePass123!\"}"
        }
      }
    },
    {
      "name": "4. Initiate Payment",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{auth_token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{payment_base}}/api/payments/initiate",
        "body": {
          "mode": "raw",
          "raw": "{\"appointmentId\": \"{{appointment_id}}\", \"amount\": 5000.00, \"currency\": \"LKR\", \"patientId\": \"{{patient_id}}\", \"description\": \"Consultation Fee\"}"
        }
      }
    },
    {
      "name": "5. Get Transaction",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{auth_token}}"}],
        "url": "{{payment_base}}/api/payments/transaction/{{transaction_id}}"
      }
    },
    {
      "name": "6. Get Patient History",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{auth_token}}"}],
        "url": "{{payment_base}}/api/payments/patient/{{patient_id}}/history"
      }
    }
  ]
}
```

---

## Execution Order

1. ✅ Health Check
2. ✅ Register User
3. ✅ Login (saves token)
4. ✅ Initiate Payment (saves transaction_id)
5. ✅ Get Transaction Details
6. ✅ Get Patient History

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Login first to get token |
| Connection refused (8086) | Start payment service: `docker-compose up -d payment-service` |
| Payment initiation fails | Ensure auth_token is valid and not expired |
| Transaction not found | Use correct transaction_id from initiate payment response |
| Invalid appointment_id | Use valid UUID format: `550e8400-e29b-41d4-a716-446655440000` |

---

## Next: Real Stripe Integration

To test with real Stripe payment flow:

1. Get Stripe test API keys from https://dashboard.stripe.com/test/apikeys
2. Update `docker-compose.yml`:
   ```yaml
   STRIPE_SECRET_KEY: sk_test_YOUR_SECRET_KEY
   STRIPE_WEBHOOK_SECRET: whsec_test_YOUR_WEBHOOK_SECRET
   ```
3. Recreate container: `docker-compose up -d --build payment-service`
4. Use Stripe test card: `4242 4242 4242 4242`
