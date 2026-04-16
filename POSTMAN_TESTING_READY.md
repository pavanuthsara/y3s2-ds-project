# 🚀 Payment Service - Ready for Testing on Postman

## ✅ Services Status

- ✅ **Auth Service** - http://localhost:8081
- ✅ **API Gateway** - http://localhost:8080  
- ✅ **Payment Service** - http://localhost:8086
- ✅ **Payment PostgreSQL** - localhost:5433

---

## 🔑 Postman Setup (Copy & Paste)

### Create New Environment: `Healthcare Payment`

**Click** Environments → **Create Environment** → Add these variables:

```
base_url                http://localhost:8080
payment_base            http://localhost:8086
auth_token              (leave empty - will auto-fill after login)
transaction_id          (leave empty - will auto-fill)
appointment_id          550e8400-e29b-41d4-a716-446655440000
patient_id              patient-doctor-001
```

**Click Save**

---

## 📋 Postman Requests (Copy Each Section)

### Request 1️⃣: Health Check
```
GET http://localhost:8086/api/payments/health
```

**Expected:** 
```json
{"status": "Payment Service is running"}
```

---

### Request 2️⃣: Verify Auth Service
```
GET http://localhost:8080/actuator/health
```

---

### Request 3️⃣: Register User (ONE-TIME ONLY)
```
POST http://localhost:8080/api/auth/register
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

**Expected:** `201 Created` (or `400` if already exists - that's fine!)

---

### Request 4️⃣: Login & Capture Token ⭐ IMPORTANT
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "doctor_postman_1",
  "password": "SecurePass123!"
}
```

**Paste in Tests Tab:**
```javascript
pm.test("Login successful", function() {
    pm.response.to.have.status(200);
});

pm.test("Save token", function() {
    const body = pm.response.json();
    pm.expect(body).to.have.property("token");
    pm.environment.set("auth_token", body.token);
    console.log("Token saved: " + body.token.substring(0, 20) + "...");
});
```

**⭐ After running this, check your Environment Variables - `auth_token` should be filled!**

---

### Request 5️⃣: Initiate Payment ⭐ CREATE TRANSACTION
```
POST http://localhost:8086/api/payments/initiate
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

**Paste in Tests Tab:**
```javascript
pm.test("Payment initiated successfully", function() {
    pm.response.to.have.status(201);
});

pm.test("Response has all required fields", function() {
    const body = pm.response.json();
    pm.expect(body).to.have.property("transactionId");
    pm.expect(body).to.have.property("clientSecret");
    pm.expect(body).to.have.property("status");
    pm.expect(body.status).to.eql("PENDING");
});

pm.test("Save transaction details", function() {
    const body = pm.response.json();
    pm.environment.set("transaction_id", body.transactionId);
    console.log("Transaction ID: " + body.transactionId);
});
```

**✅ After running, `transaction_id` will be auto-saved!**

---

### Request 6️⃣: Get Transaction Details
```
GET http://localhost:8086/api/payments/transaction/{{transaction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected:** Full transaction object with PENDING status

---

### Request 7️⃣: Get Patient History
```
GET http://localhost:8086/api/payments/patient/{{patient_id}}/history
Authorization: Bearer {{auth_token}}
```

**Expected:** Array of patient's transactions

---

### Request 8️⃣: Test Error - Missing Auth
```
POST http://localhost:8086/api/payments/initiate
Content-Type: application/json

{
  "appointmentId": "{{appointment_id}}",
  "amount": 5000.00,
  "currency": "LKR",
  "patientId": "{{patient_id}}"
}
```

**Expected:** `401 Unauthorized`

---

### Request 9️⃣: Test Error - Invalid Amount
```
POST http://localhost:8086/api/payments/initiate
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "appointmentId": "{{appointment_id}}",
  "amount": 0,
  "currency": "LKR",
  "patientId": "{{patient_id}}"
}
```

**Expected:** `400 Bad Request` with validation error

---

## 🎯 Recommended Testing Order

Run these in order:

1. Health Check (verify service)
2. Register User (create account)
3. Login (get JWT token)
4. Initiate Payment (create transaction)
5. Get Transaction Details (verify it was created)
6. Get Patient History (see all transactions)
7. Test Error Cases (verify error handling)

---

## ✅ Successful Response Examples

### Login Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "doctor_postman_1",
  "role": "DOCTOR"
}
```

### Payment Initiation Response:
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
  "createdAt": "2026-04-16T14:00:00"
}
```

### Transaction History Response:
```json
[
  {
    "transactionId": "550e8400-e29b-41d4-a716-446655440111",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 5000.00,
    "status": "PENDING",
    "paymentGateway": "STRIPE",
    "paidAt": null,
    "createdAt": "2026-04-16T14:00:00"
  }
]
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused :8086` | Service not running. See logs: `tail /tmp/payment-service.log` |
| `401 Unauthorized` | Login token expired or not set. Re-run Login request |
| `Transaction not found` | Use correct UUID format for transaction_id |
| `Database connection error` | Verify payment-postgres is running: `docker ps \| grep payment` |
| `Amount must be greater than 0` | Use amount > 0 (e.g., 5000.00) |

---

## 📊 Service Architecture

```
┌─────────────┐
│ Postman     │
└──────┬──────┘
       │ (HTTP Request)
       │
       ├──────────────┐
       │              │
   ┌───▼───────┐  ┌──▼──────────┐
   │API Gateway│  │Auth Service │
   │ :8080     │  │ :8081       │
   └───┬───────┘  └─────────────┘
       │ (JWT Validation)
       │
   ┌───▼──────────────┐
   │ Payment Service  │
   │ :8086            │
   └───┬──────────────┘
       │ (JDBC)
       │
   ┌───▼───────────┐
   │ PostgreSQL    │
   │ :5433         │
   └───────────────┘
```

---

## 🔒 Security Notes

- ✅ JWT tokens expire after 24 hours
- ✅ All payment endpoints require Bearer token
- ✅ Stripe API keys are test keys only
- ✅ Webhooks require signature verification
- ✅ No credit card data stored (handled by Stripe)

---

## 📝 API Documentation

Full docs at: `/docs/PAYMENT_SERVICE_TESTING_GUIDE.md`
