# 🧪 Patient Service — Postman Testing Guide

> This guide shows you exactly what to test and what responses to expect from the Patient Service API using Postman.

---

## 📋 Prerequisites

Before testing, make sure:
- ✅ **Auth Service** is running on `http://localhost:8081`
- ✅ **Patient Service** is running on `http://localhost:8082`
- ✅ **PostgreSQL** is running (for both services)
- ✅ **Postman** is installed

---

## 🔑 Step 1: Get JWT Token (REQUIRED FIRST)

All Patient Service endpoints require a valid JWT token from Auth Service.

### **1a. Register a New Patient User**

**Request:**
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "john_patient",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"
}
```

**Expected Response (201 CREATED):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huX3BhdGllbnQiLCJpYXQiOjE2NjY4NDAwNzksImV4cCI6MTY2Njk0MDc5fQ.example",
  "username": "john_patient",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

**⚠️ IMPORTANT:** Copy the `token` value. You'll use this in all Patient Service requests.

---

### **1b. Or Login (If User Already Exists)**

**Request:**
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "john_patient",
  "password": "SecurePass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john_patient",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

---

## 🎯 Step 2: Test Patient Service Endpoints (3 Total)

### **Endpoint 1: Create Patient Profile**

**Request:**
```
POST http://localhost:8082/api/patients
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN_HERE>

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94701234567",
  "address": "123 Main Street, Colombo 7",
  "dateOfBirth": "1995-05-15"
}
```

**In Postman:**
1. Set Method to **POST**
2. URL: `http://localhost:8082/api/patients`
3. Headers tab → Add:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiJ9...` (your token)
4. Body tab → Select **raw** → **JSON**
5. Paste the JSON above
6. Click **Send**

**Expected Response (201 CREATED):**
```json
{
  "id": 1,
  "username": "john_patient",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94701234567",
  "address": "123 Main Street, Colombo 7",
  "dateOfBirth": "1995-05-15"
}
```

✅ **What to Check:**
- [ ] Status code is `201 CREATED`
- [ ] Response includes all your fields
- [ ] `id` is assigned (e.g., 1, 2, 3...)
- [ ] `username` matches your auth user

---

### **Endpoint 2: Get Your Profile**

**Request:**
```
GET http://localhost:8082/api/patients/me
Authorization: Bearer <YOUR_JWT_TOKEN_HERE>
```

**In Postman:**
1. Set Method to **GET**
2. URL: `http://localhost:8082/api/patients/me`
3. Headers tab → Add Authorization header (same as above)
4. Click **Send**

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_patient",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94701234567",
  "address": "123 Main Street, Colombo 7",
  "dateOfBirth": "1995-05-15"
}
```

✅ **What to Check:**
- [ ] Status code is `200 OK`
- [ ] Returns the same data you created
- [ ] All fields are present

---

### **Endpoint 3: Update Your Profile**

**Request:**
```
PUT http://localhost:8082/api/patients/me
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN_HERE>

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+94709876543",
  "address": "456 New Avenue, Kandy",
  "dateOfBirth": "1995-05-15"
}
```

**In Postman:**
1. Set Method to **PUT**
2. URL: `http://localhost:8082/api/patients/me`
3. Headers tab → Add Authorization header
4. Body tab → Select **raw** → **JSON**
5. Paste the JSON above (with updated values)
6. Click **Send**

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_patient",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+94709876543",
  "address": "456 New Avenue, Kandy",
  "dateOfBirth": "1995-05-15"
}
```

✅ **What to Check:**
- [ ] Status code is `200 OK`
- [ ] Fields are updated (lastName = Smith, phone updated, etc.)
- [ ] Other fields remain unchanged

---

## ❌ Test Error Scenarios

### **Test 1: Missing Authorization Header**

**Request:**
```
GET http://localhost:8082/api/patients/me
(No Authorization header)
```

**Expected Response (401 UNAUTHORIZED):**
```json
{
  "message": "Invalid token format"
}
```

---

### **Test 2: Invalid JWT Token**

**Request:**
```
GET http://localhost:8082/api/patients/me
Authorization: Bearer invalid.token.here
```

**Expected Response (401 UNAUTHORIZED):**
```json
{
  "message": "Invalid token"
}
```

---

### **Test 3: Create Profile Without Required Fields**

**Request:**
```
POST http://localhost:8082/api/patients
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "firstName": "",
  "lastName": ""
}
```

**Expected Response (400 BAD REQUEST):**
```json
{
  "message": "First name is required"
}
```

---

### **Test 4: Create Profile When Already Exists**

**Request:**
```
POST http://localhost:8082/api/patients
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "firstName": "Another",
  "lastName": "User",
  "phone": "+94701234567",
  "address": "New Address",
  "dateOfBirth": "1990-01-01"
}
```

**Expected Response (400 BAD REQUEST):**
```json
{
  "message": "Patient profile already exists"
}
```

---

## 📊 Testing Checklist

Use this checklist to verify all tests pass:

### **Happy Path Tests (Should Pass)**
- [ ] Register user via Auth Service → Get JWT token
- [ ] Create patient profile → Status 201, profile created
- [ ] Get patient profile → Status 200, correct data returned
- [ ] Update patient profile → Status 200, fields updated
- [ ] Get updated profile → Status 200, updates persisted

### **Error Path Tests (Should Fail Gracefully)**
- [ ] Get profile without token → Status 401
- [ ] Get profile with invalid token → Status 401
- [ ] Create profile with missing fields → Status 400
- [ ] Create profile when already exists → Status 400

### **Data Integrity Tests**
- [ ] Profile ID persists across requests
- [ ] Username cannot be changed (read-only)
- [ ] Phone number format accepts various formats
- [ ] Date of birth stores correctly
- [ ] Multiple users can have different profiles

---

## 📝 Postman Collection Variables (Optional)

To avoid copying/pasting tokens, set up Postman collection variables:

**In Postman:**
1. Click your **Collection** name
2. Go to **Variables** tab
3. Add these variables:

| Variable | Initial Value | Example |
|----------|--------------|---------|
| `base_url_auth` | - | `http://localhost:8081` |
| `base_url_patient` | - | `http://localhost:8082` |
| `jwt_token` | - | (leave empty, fill after login) |
| `username` | - | `john_patient` |
| `password` | - | `SecurePass123!` |

Then use in requests:
```
POST {{base_url_auth}}/api/auth/login
Authorization: Bearer {{jwt_token}}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection refused on 8082** | Patient service not running. Run: `mvn spring-boot:run` in `backend/patient-service` |
| **401 Unauthorized** | JWT token expired or invalid. Get a new token from Auth Service |
| **400 Bad Request** | Check JSON formatting. Use Postman's JSON validator |
| **500 Internal Server Error** | Check service logs. Database might not be running |
| **CORS error** | Service has CORS enabled. Should work from Postman |

---

## ✅ Success Criteria

Patient Service is **working correctly** when:
1. ✅ Can register user via Auth Service
2. ✅ Can create patient profile with valid JWT
3. ✅ Can retrieve patient profile
4. ✅ Can update patient profile
5. ✅ All unauthorized requests return 401
6. ✅ All invalid requests return 400
7. ✅ Data persists across requests

---

**Ready to test? Start with Step 1 and work through each endpoint!**
