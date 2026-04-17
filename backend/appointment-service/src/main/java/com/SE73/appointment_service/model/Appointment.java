package com.SE73.appointment_service.model;

import com.SE73.appointment_service.enums.AppointmentMode;
import com.SE73.appointment_service.enums.AppointmentStatus;
import com.SE73.appointment_service.enums.PaymentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA Entity representing an Appointment in the healthcare platform.
 * Stores all details about a patient-doctor appointment including mode,
 * status, payment information, and scheduling details.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "appointment_id", updatable = false, nullable = false)
    private UUID appointmentId;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "doctor_username", nullable = false)
    private String doctorUsername;

    @Column(name = "slot_id", nullable = false)
    private UUID slotId;

    @Column(name = "appointment_date_time", nullable = false)
    private LocalDateTime appointmentDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_mode", nullable = false)
    private AppointmentMode appointmentMode;

    /** Physical location for PHYSICAL mode appointments (optional) */
    @Column(name = "hospital")
    private String hospital;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    /** Auto-set on first persist */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Auto-set on every update */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** Optional notes from the doctor */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ---------------------------------------------------------------
    // Lifecycle Callbacks
    // ---------------------------------------------------------------

    /**
     * Sets createdAt and updatedAt timestamps before the entity is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Updates the updatedAt timestamp before each subsequent update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public Appointment() {
    }

    // ---------------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------------

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(UUID appointmentId) {
        this.appointmentId = appointmentId;
    }

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

    public AppointmentMode getAppointmentMode() {
        return appointmentMode;
    }

    public void setAppointmentMode(AppointmentMode appointmentMode) {
        this.appointmentMode = appointmentMode;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "appointmentId=" + appointmentId +
                ", patientId='" + patientId + '\'' +
                ", doctorUsername='" + doctorUsername + '\'' +
                ", slotId=" + slotId +
                ", appointmentDateTime=" + appointmentDateTime +
                ", appointmentMode=" + appointmentMode +
                ", status=" + status +
                ", paymentStatus=" + paymentStatus +
                '}';
    }
}
