package com.SE73.appointment_service.controller;

import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;
import com.SE73.appointment_service.service.AppointmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing appointments in the healthcare platform.
 * Exposes CRUD endpoints under the {@code /api/appointments} base path.
 */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentService appointmentService;

    // Constructor injection
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // ---------------------------------------------------------------
    // POST /api/appointments
    // ---------------------------------------------------------------

    /**
     * Books a new appointment.
     *
     * @param request validated appointment booking request
     * @return 201 CREATED with the new appointment details
     */
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        logger.info("POST /api/appointments - booking appointment for patient '{}'", request.getPatientId());
        AppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ---------------------------------------------------------------
    // GET /api/appointments/{appointmentId}
    // ---------------------------------------------------------------

    /**
     * Retrieves a single appointment by ID.
     *
     * @param appointmentId the appointment UUID
     * @return 200 OK with appointment details, or 404 if not found
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable UUID appointmentId) {
        logger.info("GET /api/appointments/{}", appointmentId);
        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------------
    // GET /api/appointments/patient/{patientId}
    // ---------------------------------------------------------------

    /**
     * Retrieves all appointments for a specific patient.
     *
     * @param patientId the patient identifier
     * @return 200 OK with list of appointments
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatientId(
            @PathVariable String patientId) {
        logger.info("GET /api/appointments/patient/{}", patientId);
        List<AppointmentResponse> responses = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(responses);
    }

    // ---------------------------------------------------------------
    // GET /api/appointments/doctor/{doctorUsername}
    // ---------------------------------------------------------------

    /**
     * Retrieves all appointments for a specific doctor.
     *
     * @param doctorUsername the doctor's username
     * @return 200 OK with list of appointments
     */
    @GetMapping("/doctor/{doctorUsername}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctorUsername(
            @PathVariable String doctorUsername) {
        logger.info("GET /api/appointments/doctor/{}", doctorUsername);
        List<AppointmentResponse> responses = appointmentService.getAppointmentsByDoctorUsername(doctorUsername);
        return ResponseEntity.ok(responses);
    }

    // ---------------------------------------------------------------
    // GET /api/appointments
    // ---------------------------------------------------------------

    /**
     * Retrieves all appointments in the system.
     *
     * @return 200 OK with list of all appointments
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        logger.info("GET /api/appointments - fetching all appointments");
        List<AppointmentResponse> responses = appointmentService.getAllAppointments();
        return ResponseEntity.ok(responses);
    }

    // ---------------------------------------------------------------
    // PUT /api/appointments/{appointmentId}/status
    // ---------------------------------------------------------------

    /**
     * Updates the status of an existing appointment.
     * Valid status transitions: CONFIRMED, CANCELLED, COMPLETED.
     *
     * @param appointmentId the appointment UUID
     * @param request       the validated status update request
     * @return 200 OK with the updated appointment
     */
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        logger.info("PUT /api/appointments/{}/status - new status '{}'", appointmentId, request.getStatus());
        AppointmentResponse response = appointmentService.updateAppointmentStatus(appointmentId, request);
        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------------
    // DELETE /api/appointments/{appointmentId}
    // ---------------------------------------------------------------

    /**
     * Cancels an appointment (soft-delete by status change to CANCELLED).
     *
     * @param appointmentId the appointment UUID
     * @return 204 NO CONTENT on success
     */
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID appointmentId) {
        logger.info("DELETE /api/appointments/{} - cancelling appointment", appointmentId);
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.noContent().build();
    }
}

