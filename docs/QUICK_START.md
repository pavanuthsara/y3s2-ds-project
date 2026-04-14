# Quick Start Guide - Testing API Gateway & Auth Service

## Additional Guide
- For doctor availability scheduling tests in Postman, see `docs/DOCTOR_AVAILABILITY_POSTMAN_TEST_GUIDE.md`.

## Prerequisites
- PostgreSQL running on localhost:5432
- Java 17+ installed
- Maven 3.9+ installed

## Step 1: Setup Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE auth_service_db;
\q
```

## Step 2: Start Auth Service

```bash
cd backend/auth-service
mvn spring-boot:run
```

Wait for: `Started AuthServiceApplication in X seconds`

## Step 3: Start API Gateway (new terminal)

```bash
cd backend/api-gateway
mvn spring-boot:run
```

Wait for: `Started ApiGatewayApplication in X seconds`

---

## Testing the Services

### Test 1: Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_smith",
    "email": "alice@hospital.com",
    "password": "SecurePass123!",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": "PATIENT"
  }'
```

**Expected Response (200 Created):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "username": "alice_smith",
  "email": "alice@hospital.com",
  "role": "PATIENT"
}
```

### Test 2: Login User

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_smith",
    "password": "SecurePass123!"
  }'
```

**Save the token for next tests!**

### Test 3: Get User Info (Authenticated)

```bash
# Replace TOKEN with actual token from login
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X GET http://localhost:8080/api/auth/user/alice_smith \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "username": "alice_smith",
  "email": "alice@hospital.com",
  "firstName": "Alice",
  "lastName": "Smith",
  "role": "PATIENT"
}
```

### Test 4: Validate Token

```bash
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X GET http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "valid": true,
  "username": "alice_smith"
}
```

### Test 5: Invalid Credentials

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_smith",
    "password": "WrongPassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

### Test 6: Missing Authorization Header

```bash
# No token provided
curl -X GET http://localhost:8080/api/auth/user/alice_smith
```

**Expected Response (401 Unauthorized)**

---

## Test Data for Reference

### Patient Account
```json
{
  "username": "patient_001",
  "email": "patient@healthcare.com",
  "password": "Patient@123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"
}
```

### Doctor Account
```json
{
  "username": "doctor_001",
  "email": "dr.smith@healthcare.com",
  "password": "Doctor@123",
  "firstName": "Smith",
  "lastName": "Johnson",
  "role": "DOCTOR"
}
```

### Admin Account
```json
{
  "username": "admin_001",
  "email": "admin@healthcare.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

---

## Verify Services Are Running

### Check Auth Service (Port 8081)
```bash
curl -X GET http://localhost:8081/actuator/health
```

### Check API Gateway (Port 8080)
```bash
curl -X GET http://localhost:8080/actuator/health
```

Both should return: `{"status":"UP"}`

---

## Common Issues & Solutions

### 1. "Connection refused on port 8080"
- Make sure API Gateway is running
- Check for port conflicts: `lsof -i :8080`

### 2. "Database connection error"
- Ensure PostgreSQL is running
- Verify database exists: `psql -U postgres -l | grep auth_service_db`
- Check credentials in `application.properties`

### 3. "Token validation failed"
- Check JWT secret matches in both services
- Ensure token hasn't expired (24-hour default)
- Verify token format: `Bearer <token>`

### 4. "Username already exists"
- Use a unique username for each test
- Or check database: `SELECT * FROM users WHERE username='...'`

---

## Performance Testing (Optional)

### Register 100 Users
```bash
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"user_${i}\",
      \"email\": \"user${i}@test.com\",
      \"password\": \"pass${i}\",
      \"firstName\": \"Test\",
      \"lastName\": \"User${i}\",
      \"role\": \"PATIENT\"
    }" \
    -s -o /dev/null &
done
wait
echo "100 users registered"
```

---

## Database Inspection

View all registered users:
```bash
psql -U postgres -d auth_service_db -c "SELECT id, username, email, role FROM users;"
```

---

## Next Steps

After verifying both services work:
1. Review the implementation guide: `docs/IMPLEMENTATION_GUIDE.md`
2. Start building other microservices (Patient, Doctor, Appointment)
3. Connect them through the API Gateway
4. Add comprehensive error handling and logging

