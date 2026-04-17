package com.SE73.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for incoming appointment booking requests.
 * All required fields are validated using Bean Validation annotations.
 */
public class AppointmentRequest {

    @NotNull(message = "Patient ID is required")
    @NotBlank(message = "Patient ID must not be blank")
    private String patientId;

    @NotNull(message = "Doctor username is required")
    @NotBlank(message = "Doctor username must not be blank")
    private String doctorUsername;

    @NotNull(message = "Slot ID is required")
    private UUID slotId;

    @NotNull(message = "Appointment date and time is required")
    private LocalDateTime appointmentDateTime;

    /**
     * Appointment mode - must be one of: VIRTUAL, PHYSICAL
     */
    @NotNull(message = "Appointment mode is required")
    @NotBlank(message = "Appointment mode must not be blank")
    private String appointmentMode;

    /** Optional hospital/location for PHYSICAL appointments */
    private String hospital;

    /** Optional initial notes */
    private String notes;

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public AppointmentRequest() {
    }

    public AppointmentRequest(String patientId, String doctorUsername, UUID slotId,
                              LocalDateTime appointmentDateTime, String appointmentMode,
                              String hospital, String notes) {
        this.patientId = patientId;
        this.doctorUsername = doctorUsername;
        this.slotId = slotId;
        this.appointmentDateTime = appointmentDateTime;
        this.appointmentMode = appointmentMode;
        this.hospital = hospital;
        this.notes = notes;
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorUsername() {
        return doctorUsername;
    }

    public void setDoctorUsername(String doctorUsername) {
        this.doctorUsername = doctorUsername;
    }

    public UUID getSlotId() {
        return slotId;
    }

    public void setSlotId(UUID slotId) {
        this.slotId = slotId;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public String getAppointmentMode() {
        return appointmentMode;
    }

    public void setAppointmentMode(String appointmentMode) {
        this.appointmentMode = appointmentMode;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
