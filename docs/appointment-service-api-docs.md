# Appointment Service API Documentation

Base URL: `http://localhost:8085/api/appointments`

This document details the REST endpoints available for the **Appointment Service**, which is responsible for managing healthcare appointments. All endpoints accept and return JSON payloads.

---

## 1. Book an Appointment
Creates a new appointment booking.

- **URL:** `/api/appointments`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "patientId": "P-98765",
  "doctorUsername": "dr_smith",
  "slotId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDateTime": "2026-04-18T10:00:00",
  "appointmentMode": "VIRTUAL",
  "hospital": "Telehealth Platform",
  "notes": "Patient experiencing mild headaches."
}
```
*Note: `appointmentMode` must be either `VIRTUAL` or `PHYSICAL`.*

### Success Response
- **Code:** 201 Created
- **Body:**
```json
{
  "appointmentId": "123e4567-e89b-12d3-a456-426614174000",
  "patientId": "P-98765",
  "doctorUsername": "dr_smith",
  "slotId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDateTime": "2026-04-18T10:00:00",
  "appointmentMode": "VIRTUAL",
  "hospital": "Telehealth Platform",
  "status": "PENDING",
  "price": null,
  "paymentStatus": "PENDING",
  "notes": "Patient experiencing mild headaches.",
  "createdAt": "2026-04-17T10:15:30.123",
  "updatedAt": "2026-04-17T10:15:30.123"
}
```

---

## 2. Get Appointment by ID
Retrieves details of a specific appointment.

- **URL:** `/api/appointments/{appointmentId}`
- **Method:** `GET`

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "appointmentId": "123e4567-e89b-12d3-a456-426614174000",
  "patientId": "P-98765",
  "doctorUsername": "dr_smith",
  "slotId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDateTime": "2026-04-18T10:00:00",
  "appointmentMode": "VIRTUAL",
  "hospital": "Telehealth Platform",
  "status": "CONFIRMED",
  "price": 50.00,
  "paymentStatus": "PAID",
  "notes": "Patient experiencing mild headaches.",
  "createdAt": "2026-04-17T10:15:30.123",
  "updatedAt": "2026-04-17T16:20:45.000"
}
```

---

## 3. Get Appointments by Patient ID
Retrieves all appointments belonging to a specific patient.

- **URL:** `/api/appointments/patient/{patientId}`
- **Method:** `GET`

### Success Response
- **Code:** 200 OK
- **Body:**
```json
[
  {
    "appointmentId": "123e4567-e89b-12d3-a456-426614174000",
    "patientId": "P-98765",
    "doctorUsername": "dr_smith",
    "slotId": "550e8400-e29b-41d4-a716-446655440000",
    "appointmentDateTime": "2026-04-18T10:00:00",
    "appointmentMode": "VIRTUAL",
    "hospital": "Telehealth Platform",
    "status": "PENDING",
    "price": null,
    "paymentStatus": "PENDING",
    "notes": "Patient experiencing mild headaches.",
    "createdAt": "2026-04-17T10:15:30.123",
    "updatedAt": "2026-04-17T10:15:30.123"
  }
]
```

---

## 4. Get Appointments by Doctor Username
Retrieves all appointments assigned to a specific doctor.

- **URL:** `/api/appointments/doctor/{doctorUsername}`
- **Method:** `GET`

### Success Response
- **Code:** 200 OK
- **Body:** (Returns an array list of Appointment objects, similar to the endpoint above)

---

## 5. Get All Appointments
Retrieves all appointments in the system.

- **URL:** `/api/appointments`
- **Method:** `GET`

### Success Response
- **Code:** 200 OK
- **Body:** (Returns an array list of Appointment objects)

---

## 6. Update Appointment Status
Updates the status of an existing appointment. Commonly used by doctors or admins to confirm, complete, or cancel appointments.

- **URL:** `/api/appointments/{appointmentId}/status`
- **Method:** `PUT`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "status": "CONFIRMED",
  "notes": "Doctor confirmed the time via internal portal."
}
```
*Note: `status` must be one of: `CONFIRMED`, `CANCELLED`, `COMPLETED`.*

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "appointmentId": "123e4567-e89b-12d3-a456-426614174000",
  "patientId": "P-98765",
  "doctorUsername": "dr_smith",
  "slotId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentDateTime": "2026-04-18T10:00:00",
  "appointmentMode": "VIRTUAL",
  "hospital": "Telehealth Platform",
  "status": "CONFIRMED",
  "price": null,
  "paymentStatus": "PENDING",
  "notes": "Doctor confirmed the time via internal portal.",
  "createdAt": "2026-04-17T10:15:30.123",
  "updatedAt": "2026-04-17T16:20:45.000"
}
```

---

## 7. Cancel Appointment
Soft-deletes the appointment by changing its status to `CANCELLED`.

- **URL:** `/api/appointments/{appointmentId}`
- **Method:** `DELETE`

### Success Response
- **Code:** 204 No Content
- **Body:** (Empty)

---

## Common Error Responses

### 404 Not Found
Returned when attempting to access or modify an appointment that does not exist.
```json
{
  "message": "Appointment not found with ID: 123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2026-04-17T10:20:00.000"
}
```

### 409 Conflict
Returned when attempting to book a slot that has already been booked.
```json
{
  "message": "Slot 550e8400-e29b-41d4-a716-446655440000 is already booked. Please choose a different slot.",
  "timestamp": "2026-04-17T10:20:00.000"
}
```

### 400 Bad Request
Returned for validation failures (missing fields) or invalid status transitions.
```json
{
  "message": "Validation failed: Patient ID is required; Appointment mode must not be blank",
  "timestamp": "2026-04-17T10:20:00.000"
}
```
