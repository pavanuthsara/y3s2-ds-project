# Doctor Availability Scheduling - Postman Test Guide

This guide helps anyone test doctor availability scheduling end-to-end using Postman.

## What You Will Test

- Login and store JWT token
- Replace weekly availability slots
- Get current availability slots
- Add one new slot
- Delete an existing slot
- Validate key error/validation scenarios

## Prerequisites

- PostgreSQL running on localhost:5432
- Auth Service running on port 8081
- Doctor Service running on port 8083
- API Gateway running on port 8080
- Postman installed

Optional health checks:

- `GET http://localhost:8080/actuator/health`
- `GET http://localhost:8081/actuator/health`
- `GET http://localhost:8083/actuator/health`

## Why Use API Gateway URLs

Use `http://localhost:8080` for all requests in this guide.

- The gateway validates JWT and injects `X-User-Id` and `X-User-Role`.
- Doctor Service requires doctor context and role for availability operations.

## 1. Import Collection and Create Environment

1. Import `postman_collection.json`.
2. Create a Postman environment named `Local Healthcare`.
3. Add variables:

| Variable | Initial Value |
|---|---|
| `base_url` | `http://localhost:8080` |
| `auth_username` | `doctor_postman_1` |
| `auth_password` | `SecurePass123!` |
| `auth_token` | *(empty)* |
| `slot_id` | *(empty)* |

## 2. Register a Doctor User (One-Time)

Create request: `POST {{base_url}}/api/auth/register`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "username": "{{auth_username}}",
  "email": "doctor_postman_1@hospital.com",
  "password": "{{auth_password}}",
  "firstName": "Postman",
  "lastName": "Doctor",
  "role": "DOCTOR"
}
```

Expected:

- `201 Created` for first run
- `400 Bad Request` if username already exists

## 3. Login and Auto-Save JWT Token

Create request: `POST {{base_url}}/api/auth/login`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "username": "{{auth_username}}",
  "password": "{{auth_password}}"
}
```

Tests tab:

```javascript
pm.test("Login success", function () {
  pm.response.to.have.status(200);
});

pm.test("Save auth token", function () {
  const body = pm.response.json();
  pm.expect(body).to.have.property("token");
  pm.environment.set("auth_token", body.token);
});
```

## 4. Replace Weekly Availability (Primary Scheduling Flow)

Create request: `PUT {{base_url}}/api/doctors/availability`

Headers:

- `Authorization: Bearer {{auth_token}}`
- `Content-Type: application/json`

Body:

```json
{
  "slots": [
    { "dayOfWeek": "MONDAY", "startTime": "09:00:00", "endTime": "12:00:00", "active": true },
    { "dayOfWeek": "MONDAY", "startTime": "13:00:00", "endTime": "16:00:00", "active": true },
    { "dayOfWeek": "WEDNESDAY", "startTime": "10:00:00", "endTime": "14:00:00", "active": true }
  ]
}
```

Tests tab:

```javascript
pm.test("Replace availability success", function () {
  pm.response.to.have.status(200);
});

pm.test("Returns slot array", function () {
  const body = pm.response.json();
  pm.expect(body).to.be.an("array").that.is.not.empty;
});

pm.test("Each slot has required fields", function () {
  const body = pm.response.json();
  body.forEach(function (slot) {
    pm.expect(slot).to.have.property("id");
    pm.expect(slot).to.have.property("dayOfWeek");
    pm.expect(slot).to.have.property("startTime");
    pm.expect(slot).to.have.property("endTime");
    pm.expect(slot).to.have.property("active");
  });
});
```

## 5. Get Availability and Save One Slot ID

Create request: `GET {{base_url}}/api/doctors/availability`

Headers:

- `Authorization: Bearer {{auth_token}}`

Tests tab:

```javascript
pm.test("Get availability success", function () {
  pm.response.to.have.status(200);
});

pm.test("Store first slot id", function () {
  const body = pm.response.json();
  pm.expect(body).to.be.an("array");
  if (body.length > 0) {
    pm.environment.set("slot_id", body[0].id);
  }
});
```

## 6. Add One New Slot

Create request: `POST {{base_url}}/api/doctors/availability/slots`

Headers:

- `Authorization: Bearer {{auth_token}}`
- `Content-Type: application/json`

Body:

```json
{
  "dayOfWeek": "FRIDAY",
  "startTime": "08:30:00",
  "endTime": "11:30:00",
  "active": true
}
```

Expected:

- `201 Created`

## 7. Delete a Slot

Create request: `DELETE {{base_url}}/api/doctors/availability/slots/{{slot_id}}`

Headers:

- `Authorization: Bearer {{auth_token}}`

Expected:

- `204 No Content`

## 8. Negative Test Cases (Important)

### A. Overlapping Slot

Request:

- `POST {{base_url}}/api/doctors/availability/slots`

Body:

```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "11:00:00",
  "endTime": "14:00:00",
  "active": true
}
```

Expected:

- `400 Bad Request`
- Message like `Availability slot overlaps with an existing slot`

### B. Invalid Time Range

Body:

```json
{
  "dayOfWeek": "TUESDAY",
  "startTime": "15:00:00",
  "endTime": "14:00:00",
  "active": true
}
```

Expected:

- `400 Bad Request`
- Message like `Start time must be before end time`

### C. Missing Authorization Header

Request:

- Call any availability endpoint without `Authorization`

Expected:

- `401 Unauthorized`
- Message: `Authorization header missing`

### D. Non-Doctor User Token

Steps:

1. Login as a `PATIENT` user.
2. Call `GET {{base_url}}/api/doctors/availability` with that token.

Expected:

- Rejected because only doctors can manage availability.

## 9. Recommended Execution Order in Collection Runner

1. Register Doctor User
2. Login (save token)
3. Replace Availability
4. Get Availability (save slot id)
5. Add Slot
6. Get Availability
7. Delete Slot
8. Get Availability

## Troubleshooting

- If every availability request returns `401`, verify `auth_token` is set in your environment.
- If availability requests return doctor role errors, ensure the login user role is `DOCTOR`.
- If gateway works but doctor-service fails, verify doctor-service is running on port `8083`.
- If slot formats fail, use full `HH:mm:ss` time format and uppercase day names like `MONDAY`.
