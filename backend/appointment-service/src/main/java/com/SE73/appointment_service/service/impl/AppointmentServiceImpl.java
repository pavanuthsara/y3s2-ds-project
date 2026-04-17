package com.SE73.appointment_service.service.impl;

import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;
import com.SE73.appointment_service.enums.AppointmentMode;
import com.SE73.appointment_service.enums.AppointmentStatus;
import com.SE73.appointment_service.exception.AppointmentNotFoundException;
import com.SE73.appointment_service.exception.InvalidAppointmentStatusException;
import com.SE73.appointment_service.exception.SlotAlreadyBookedException;
import com.SE73.appointment_service.model.Appointment;
import com.SE73.appointment_service.repository.AppointmentRepository;
import com.SE73.appointment_service.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of {@link AppointmentService} containing the core business logic
 * for appointment management in the healthcare platform.
 */
@Service
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    /** Valid status values that can be set via the status update endpoint */
    private static final List<String> VALID_UPDATE_STATUSES = Arrays.asList(
            AppointmentStatus.CONFIRMED.name(),
            AppointmentStatus.CANCELLED.name(),
            AppointmentStatus.COMPLETED.name()
    );

    private final AppointmentRepository appointmentRepository;

    // Constructor injection (no field injection)
    public AppointmentServiceImpl(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // ---------------------------------------------------------------
    // Create
    // ---------------------------------------------------------------

    /**
     * Creates a new appointment.
     * Validates that the requested slot has not already been booked before persisting.
     *
     * @param request the booking request DTO
     * @return the created appointment response
     * @throws SlotAlreadyBookedException if the slotId is already associated with an appointment
     */
    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        logger.info("Creating appointment for patient '{}' with slot '{}'",
                request.getPatientId(), request.getSlotId());

        // Prevent double-booking: check if slot is already taken
        if (appointmentRepository.existsBySlotId(request.getSlotId())) {
            logger.warn("Slot '{}' is already booked", request.getSlotId());
            throw new SlotAlreadyBookedException(
                    "Slot " + request.getSlotId() + " is already booked. Please choose a different slot."
            );
        }

        // Validate and parse appointmentMode
        AppointmentMode mode = parseAppointmentMode(request.getAppointmentMode());

        // Build and populate the Appointment entity
        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorUsername(request.getDoctorUsername());
        appointment.setSlotId(request.getSlotId());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setAppointmentMode(mode);
        appointment.setHospital(request.getHospital());
        appointment.setNotes(request.getNotes());
        // Status and paymentStatus default to PENDING (set in entity field defaults)

        Appointment saved = appointmentRepository.save(appointment);
        logger.info("Appointment created with ID '{}'", saved.getAppointmentId());

        return mapToResponse(saved);
    }

    // ---------------------------------------------------------------
    // Read
    // ---------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        logger.debug("Fetching appointment with ID '{}'", id);
        Appointment appointment = findOrThrow(id);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPatientId(String patientId) {
        logger.debug("Fetching appointments for patient '{}'", patientId);
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDoctorUsername(String doctorUsername) {
        logger.debug("Fetching appointments for doctor '{}'", doctorUsername);
        return appointmentRepository.findByDoctorUsername(doctorUsername)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        logger.debug("Fetching all appointments");
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Update
    // ---------------------------------------------------------------

    /**
     * Updates the status (and optionally notes) of an existing appointment.
     *
     * @param id      the appointment UUID
     * @param request the status update request
     * @return the updated appointment response
     * @throws AppointmentNotFoundException      if the appointment does not exist
     * @throws InvalidAppointmentStatusException if the requested status is not a valid update value
     */
    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(UUID id, AppointmentStatusUpdateRequest request) {
        logger.info("Updating status of appointment '{}' to '{}'", id, request.getStatus());

        Appointment appointment = findOrThrow(id);

        // Validate that the new status is an allowed transition value
        String newStatusStr = request.getStatus().toUpperCase();
        if (!VALID_UPDATE_STATUSES.contains(newStatusStr)) {
            throw new InvalidAppointmentStatusException(
                    "Invalid status value: '" + request.getStatus() +
                    "'. Valid values are: " + String.join(", ", VALID_UPDATE_STATUSES)
            );
        }

        AppointmentStatus newStatus = AppointmentStatus.valueOf(newStatusStr);
        appointment.setStatus(newStatus);

        // Update notes if provided
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            appointment.setNotes(request.getNotes());
        }

        Appointment updated = appointmentRepository.save(appointment);
        logger.info("Appointment '{}' status updated to '{}'", id, newStatus);

        return mapToResponse(updated);
    }

    /**
     * Cancels an existing appointment by setting its status to CANCELLED.
     *
     * @param id the appointment UUID
     * @return the cancelled appointment response
     * @throws AppointmentNotFoundException if the appointment does not exist
     */
    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(UUID id) {
        logger.info("Cancelling appointment '{}'", id);

        Appointment appointment = findOrThrow(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment cancelled = appointmentRepository.save(appointment);
        logger.info("Appointment '{}' has been cancelled", id);

        return mapToResponse(cancelled);
    }

    // ---------------------------------------------------------------
    // Private Helpers
    // ---------------------------------------------------------------

    /**
     * Looks up an appointment by ID; throws {@link AppointmentNotFoundException} if absent.
     */
    private Appointment findOrThrow(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with ID: " + id
                ));
    }

    /**
     * Parses an appointment mode string, throwing a meaningful error if invalid.
     */
    private AppointmentMode parseAppointmentMode(String mode) {
        try {
            return AppointmentMode.valueOf(mode.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidAppointmentStatusException(
                    "Invalid appointment mode: '" + mode + "'. Valid values are: VIRTUAL, PHYSICAL"
            );
        }
    }

    /**
     * Maps an {@link Appointment} entity to an {@link AppointmentResponse} DTO.
     */
    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentId(appointment.getAppointmentId());
        response.setPatientId(appointment.getPatientId());
        response.setDoctorUsername(appointment.getDoctorUsername());
        response.setSlotId(appointment.getSlotId());
        response.setAppointmentDateTime(appointment.getAppointmentDateTime());
        response.setAppointmentMode(appointment.getAppointmentMode() != null
                ? appointment.getAppointmentMode().name() : null);
        response.setHospital(appointment.getHospital());
        response.setStatus(appointment.getStatus() != null
                ? appointment.getStatus().name() : null);
        response.setPrice(appointment.getPrice());
        response.setPaymentStatus(appointment.getPaymentStatus() != null
                ? appointment.getPaymentStatus().name() : null);
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        return response;
    }
}

