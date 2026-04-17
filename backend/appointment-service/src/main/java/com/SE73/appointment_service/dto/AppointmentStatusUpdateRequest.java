package com.SE73.appointment_service.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating the status of an existing appointment.
 * Doctors or admins can use this to CONFIRM, CANCEL, or COMPLETE appointments.
 */
public class AppointmentStatusUpdateRequest {

    /**
     * New status for the appointment.
     * Valid values: CONFIRMED, CANCELLED, COMPLETED
     */
    @NotNull(message = "Status is required")
    private String status;

    /** Optional notes from the doctor to attach to this update */
    private String notes;

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public AppointmentStatusUpdateRequest() {
    }

    public AppointmentStatusUpdateRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
