package com.SE73.appointment_service.service;

import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;

import java.util.List;
import java.util.UUID;

/**
 * Service interface defining the business operations for appointment management.
 */
public interface AppointmentService {

    /**
     * Creates a new appointment after validating that the slot is not already booked.
     *
     * @param request the appointment booking request
     * @return the created appointment as a response DTO
     */
    AppointmentResponse createAppointment(AppointmentRequest request);

    /**
     * Retrieves a single appointment by its unique identifier.
     *
     * @param id the appointment UUID
     * @return the appointment response DTO
     */
    AppointmentResponse getAppointmentById(UUID id);

    /**
     * Retrieves all appointments for a specific patient.
     *
     * @param patientId the patient identifier
     * @return list of appointment response DTOs
     */
    List<AppointmentResponse> getAppointmentsByPatientId(String patientId);

    /**
     * Retrieves all appointments assigned to a specific doctor.
     *
     * @param doctorUsername the doctor's username
     * @return list of appointment response DTOs
     */
    List<AppointmentResponse> getAppointmentsByDoctorUsername(String doctorUsername);

    /**
     * Updates the status of an existing appointment.
     *
     * @param id      the appointment UUID
     * @param request the status update request
     * @return the updated appointment response DTO
     */
    AppointmentResponse updateAppointmentStatus(UUID id, AppointmentStatusUpdateRequest request);

    /**
     * Cancels an appointment by setting its status to CANCELLED.
     *
     * @param id the appointment UUID
     * @return the cancelled appointment response DTO
     */
    AppointmentResponse cancelAppointment(UUID id);

    /**
     * Retrieves all appointments in the system.
     *
     * @return list of all appointment response DTOs
     */
    List<AppointmentResponse> getAllAppointments();
}

