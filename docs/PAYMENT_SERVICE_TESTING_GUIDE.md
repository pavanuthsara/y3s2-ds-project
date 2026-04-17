# Payment Service Testing Guide

## Prerequisites

- Payment Service running on http://localhost:8086
- Stripe test account with API keys
- Postman installed

## Environment Setup in Postman

Create a Postman environment named `Healthcare Payment`:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:8080` |
| `payment_base` | `http://localhost:8086` |
| `stripe_key` | sk_test_your_key |
| `auth_token` | (empty, will be set during testing) |
| `transaction_id` | (empty, will be set during testing) |
| `payment_intent_id` | (empty, will be set during testing) |

## 1. Authentication

### Login and Save Token
**Request:**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "doctor_postman_1",
  "password": "SecurePass123!"
}
```

**Tests Tab:**
```javascript
pm.test("Login successful", function() {
    pm.response.to.have.status(200);
});

pm.test("Save token", function() {
    const body = pm.response.json();
    pm.environment.set("auth_token", body.token);
});
```

## 2. Initiate Payment

**Request:**
```
POST {{base_url}}/api/payments/initiate
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50.00,
  "currency": "LKR",
  "patientId": "patient-123",
  "description": "Consultation Fee"
}
```

**Tests Tab:**
```javascript
pm.test("Payment initiation successful", function() {
    pm.response.to.have.status(201);
});

pm.test("Response has client secret", function() {
    const body = pm.response.json();
    pm.expect(body).to.have.property("clientSecret");
    pm.expect(body).to.have.property("transactionId");
    pm.environment.set("transaction_id", body.transactionId);
    pm.environment.set("payment_intent_id", body.clientSecret.split("_")[0]);
});
```

## 3. Confirm Payment

**Request:**
```
POST {{base_url}}/api/payments/confirm
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "paymentIntentId": "{{payment_intent_id}}"
}
```

**Expected Response:**
```json
{
  "transactionId": "550e8400...",
  "appointmentId": "550e8400...",
  "patientId": "patient-123",
  "amount": 50.00,
  "currency": "LKR",
  "status": "SUCCESS",
  "paymentGateway": "STRIPE",
  "paidAt": "2026-04-16T10:30:00",
  "createdAt": "2026-04-16T10:25:00"
}
```

## 4. Get Transaction Details

**Request:**
```
GET {{base_url}}/api/payments/transaction/{{transaction_id}}
Authorization: Bearer {{auth_token}}
```

## 5. Get Patient Transaction History

**Request:**
```
GET {{base_url}}/api/payments/patient/patient-123/history
Authorization: Bearer {{auth_token}}
```

## 6. Process Refund

**Request:**
```
POST {{base_url}}/api/payments/refund/{{transaction_id}}
Authorization: Bearer {{auth_token}}
```

## 7. Get All Transactions (Admin)

**Request:**
```
GET {{base_url}}/api/payments/admin/all
Authorization: Bearer {{admin_token}}
```

## Testing Error Cases

### Missing Authorization Header
```
POST {{base_url}}/api/payments/initiate
Content-Type: application/json

{
  "appointmentId": "550e8400...",
  "amount": 50.00,
  "currency": "LKR",
  "patientId": "patient-123"
}
```

**Expected:** 401 Unauthorized

### Invalid Amount
```
POST {{base_url}}/api/payments/initiate
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "appointmentId": "550e8400...",
  "amount": 0,
  "currency": "LKR",
  "patientId": "patient-123"
}
```

**Expected:** 400 Bad Request - "Amount must be greater than 0"

### Transaction Not Found
```
GET {{base_url}}/api/payments/transaction/invalid-uuid
Authorization: Bearer {{auth_token}}
```

**Expected:** 404 Not Found

## Real Payment Testing with Stripe

### Test Card Numbers

| Card Type | Number | CVC | Expiry |
|-----------|--------|-----|--------|
| Visa | 4242 4242 4242 4242 | Any | Any future date |
| Visa (Decline) | 4000 0000 0000 0002 | Any | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any | Any future date |

### 3D Secure Test
- Card: 4000 0025 0000 3155
- Any future expiry date
- Any 3-digit CVC

## Webhook Testing

### Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events to your webhook
stripe listen --forward-to localhost:8086/webhooks/stripe
```

### Simulate Event
```bash
stripe trigger payment_intent.succeeded
```

## Common Issues

### 401 Unauthorized
- Verify auth_token is set in environment
- Token might have expired (24 hours)
- Login again to get fresh token

### Invalid Stripe Keys
- Ensure STRIPE_SECRET_KEY starts with `sk_test_`
- Ensure STRIPE_WEBHOOK_SECRET starts with `whsec_test_`
- Get keys from Stripe dashboard

### Database Connection Error
- Verify payment-postgres is running
- Check DB credentials in docker-compose.yml
- Ensure port 5433 is accessible

### Payment Intent Not Found
- Ensure appointment was properly created first
- Check appointment ID format (should be UUID)
- Verify appointment exists in appointment service
