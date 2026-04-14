# API Documentation

This document provides documentation for the APIs of the healthcare platform.

## Authentication Service

The Authentication Service is responsible for user authentication, registration, and management.

**Base URL:** `http://localhost:8080/api/auth` (via API Gateway) or `http://localhost:8081/api/auth` (direct)

---

### 1. Register User

Registers a new user in the system.

- **URL:** `/register`
- **Method:** `POST`
- **Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "USER"
}
```

- **Success Response (201 CREATED):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuZXd1c2VyIiwiaWF0IjoxNjE2Njg0MDc5LCJleHAiOjE2MTY3NzA0Nzl9.example-token",
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "USER"
}
```

- **Error Response (400 BAD REQUEST):**

```json
{
  "message": "Username is already taken!"
}
```

---

### 2. Login User

Authenticates a user and returns a JWT token.

- **URL:** `/login`
- **Method:** `POST`
- **Request Body:**

```json
{
  "username": "testuser",
  "password": "password"
}
```

- **Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTYxNjY4NDA3OSLCJleHAiOjE2MTY3NzA0Nzl9.example-token",
  "username": "testuser",
  "email": "testuser@example.com",
  "role": "USER"
}
```

- **Error Response (401 UNAUTHORIZED):**

```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Validate Token

Validates a JWT token.

- **URL:** `/validate`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <jwt-token>`

- **Success Response (200 OK):**

```json
{
  "valid": true,
  "username": "testuser"
}
```

- **Error Response (401 UNAUTHORIZED):**

```json
{
  "valid": false,
  "username": null
}
```

---

### 4. Get User Details

Retrieves the details of a user.

- **URL:** `/user/{username}`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <jwt-token>`
- **URL Parameters:**
  - `username=[string]` (the username of the user)

- **Success Response (200 OK):**

```json
{
  "id": "605eec1a-3b1d-4b8f-8b1e-3e3e3e3e3e3e",
  "username": "testuser",
  "email": "testuser@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "USER"
}
```

- **Error Response (404 NOT FOUND):**

```json
{
  "message": "User not found"
}
```
