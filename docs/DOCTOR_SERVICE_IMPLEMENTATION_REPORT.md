# Doctor Service Implementation Report

## Purpose

This report summarizes:

- what is currently implemented in `doctor-service`
- what the project documents expect `doctor-service` to provide
- the remaining implementation work needed to bring the service closer to the documented scope

## Current Status

The current `doctor-service` is a narrow availability-management service.

Implemented areas:

- doctor availability slot entity and persistence
- add, replace, list, and delete availability slots
- basic request validation for slot overlaps and time ranges
- service builds successfully with Maven

Current implemented API surface:

- `GET /api/doctors/availability`
- `PUT /api/doctors/availability`
- `POST /api/doctors/availability/slots`
- `DELETE /api/doctors/availability/slots/{slotId}`

Current stored data:

- doctor identifier as `doctorUsername`
- day of week
- start time
- end time
- active flag

## What The Project Docs Expect

According to the project docs, `doctor-service` is expected to support much more than availability.

From `docs/project-requirements.md`:

- manage doctor profile
- manage availability schedules
- accept or reject appointment requests
- issue digital prescriptions
- view patient-uploaded reports

From `docs/project-workload-distribution.md`, expected service scope includes:

- doctor profile CRUD
- specialty, qualifications, and bio management
- appointment request accept/reject flow
- prescription creation and retrieval
- patient medical report access

Documented target endpoints include:

- `GET /api/doctors`
- `GET /api/doctors/{id}/profile`
- `PUT /api/doctors/{id}/profile`
- `DELETE /api/doctors/{id}`
- `GET /api/doctors/{id}/availability`
- `PUT /api/doctors/{id}/availability`
- `POST /api/doctors/{id}/availability/slots`
- `DELETE /api/doctors/{id}/availability/slots/{slotId}`
- `GET /api/doctors/{id}/appointments`
- `PUT /api/appointments/{id}/accept`
- `PUT /api/appointments/{id}/reject`
- `POST /api/prescriptions`
- `GET /api/prescriptions/{id}`
- `GET /api/doctors/{id}/patients/{patientId}/reports`

From `docs/project-setup-plan.md`, the planned backend data model includes:

- `doctors` table
- `availability_slots` table
- `prescriptions` table

## Gap Analysis

### 1. Doctor Profile Management Is Missing

Not implemented:

- doctor profile entity
- doctor repository for profile data
- doctor profile service layer
- doctor profile CRUD endpoints

Missing profile fields from the planned schema:

- first name
- last name
- specialty
- qualifications
- bio
- phone number
- profile photo
- consultation fee
- verification state
- rating
- created/updated timestamps

Impact:

- no doctor list for patient browsing
- no doctor detail/profile API
- no specialization-based search support
- no consultation fee source for appointment pricing

### 2. Availability API Shape Does Not Match The Planned Contract

Current availability endpoints are based on the authenticated doctor context:

- `/api/doctors/availability`

Planned docs expect path-based doctor APIs:

- `/api/doctors/{id}/availability`
- `/api/doctors/{id}/availability/slots`

Impact:

- the implemented API is usable for self-management
- but it does not match the documented external contract
- downstream services and frontend work may be built against the wrong paths

### 3. Appointment Management For Doctors Is Missing

Not implemented:

- `GET /api/doctors/{id}/appointments`
- appointment accept flow
- appointment reject flow

This functionality likely depends on `appointment-service`, but there is currently no integration in `doctor-service`.

Impact:

- doctors cannot review pending booking requests
- doctors cannot accept or reject appointments
- doctor dashboard features from the docs cannot be completed

### 4. Prescription Functionality Is Missing

Not implemented:

- prescription entity/model
- prescription repository
- prescription service
- prescription controller
- `POST /api/prescriptions`
- `GET /api/prescriptions/{id}`

Impact:

- doctors cannot issue digital prescriptions
- patients cannot retrieve prescriptions through the planned flows
- clinical output from consultations is absent

### 5. Patient Report Access Is Missing

Not implemented:

- doctor access to patient-uploaded reports
- endpoint `GET /api/doctors/{id}/patients/{patientId}/reports`
- authorization rule to verify doctor access to a patient's records

This almost certainly requires integration with `patient-service` or a report-storage component.

Impact:

- doctors cannot review uploaded patient documents
- consultation workflow is incomplete

### 6. Cross-Service Contract Support Is Missing

The current repo already shows a contract mismatch.

`appointment-service` expects doctor-related endpoints like:

- `GET /doctors/{id}`
- `GET /doctors/{id}/slots/{slotId}`

But current `doctor-service` only exposes availability endpoints under:

- `/api/doctors/availability`

Impact:

- even if `appointment-service` compiled cleanly, these calls would not match the current doctor-service API
- doctor-service needs explicit public APIs for doctor data and slot lookup if other services depend on them

### 7. Security And Authorization Are Incomplete

Current controller behavior depends on:

- `X-User-Id`
- `X-User-Role`

and checks only whether the caller is a doctor.

Missing security work:

- gateway-authenticated flow clearly documented end to end
- consistent JWT-based identity propagation
- access rules for doctor profile management
- access rules for prescription issuance
- access rules for patient report access

Impact:

- current implementation is acceptable for basic availability ownership checks
- but not enough for broader doctor-service responsibilities

### 8. Documentation And Testing Are Incomplete

Missing:

- API documentation for the full doctor-service scope
- tests for profile, availability, appointment actions, prescriptions, and authorization

Current tests are minimal and there is no full service-level verification of the documented doctor APIs.

## Recommended Implementation Work

### Priority 1: Stabilize The Service Contract

Implement or decide the official API contract for:

- doctor profile retrieval
- doctor profile update
- doctor availability by doctor id
- slot lookup by id

This should be done before integrating deeply with appointment-service or frontend doctor browsing.

### Priority 2: Add Doctor Profile Module

Add:

- `Doctor` entity
- repository
- service
- response/request DTOs
- CRUD/profile endpoints

Minimum useful fields:

- id
- firstName
- lastName
- specialty
- qualifications
- bio
- phoneNumber
- consultationFee
- isVerified

### Priority 3: Align Availability APIs

Either:

- keep self-service endpoints and update all docs and consumers

or:

- add documented path-based endpoints under `/api/doctors/{id}/availability`

Also add slot lookup if appointment-service needs it.

### Priority 4: Define Appointment Integration

Design and implement how doctor-service interacts with appointment-service for:

- viewing doctor appointments
- accepting appointments
- rejecting appointments

This may belong in appointment-service instead, but the ownership must be made explicit.

### Priority 5: Add Prescription Support

Implement:

- prescription schema/model
- prescription create/read endpoints
- validation rules
- doctor ownership checks

### Priority 6: Add Patient Report Access

Implement integration for:

- fetching patient report metadata
- enforcing doctor access checks
- returning patient-facing medical documents safely

This likely requires:

- patient-service endpoint support
- shared authorization conventions
- file storage integration if reports are externally stored

### Priority 7: Add Tests And Docs

Add:

- controller tests
- service tests
- integration tests for persistence and authorization
- OpenAPI/Swagger docs for doctor-service APIs

## Suggested Final Scope Checklist

- [ ] Doctor profile entity and schema
- [ ] Doctor profile CRUD APIs
- [ ] Doctor listing/search APIs
- [ ] Availability APIs aligned with project contract
- [ ] Slot lookup API for downstream consumers
- [ ] Doctor appointment view API
- [ ] Appointment accept/reject flow
- [ ] Prescription create/read APIs
- [ ] Patient report access API
- [ ] Cross-service contract alignment with appointment-service
- [ ] Role-based authorization hardening
- [ ] OpenAPI/Swagger documentation
- [ ] Unit and integration tests

## Bottom Line

The current `doctor-service` is not yet a full doctor management service.

It currently implements only one slice of the planned scope:

- availability management

The major remaining implementation areas are:

- doctor profile management
- appointment decision workflow
- prescriptions
- patient report access
- inter-service contract alignment
- stronger security and test coverage
