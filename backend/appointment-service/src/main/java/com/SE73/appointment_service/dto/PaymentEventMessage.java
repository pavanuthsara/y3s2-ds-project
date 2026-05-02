package com.SE73.appointment_service.dto;

import java.util.UUID;

public class PaymentEventMessage {
    private UUID appointmentId;
    private String paymentStatus;

    public PaymentEventMessage() {
    }

    public PaymentEventMessage(UUID appointmentId, String paymentStatus) {
        this.appointmentId = appointmentId;
        this.paymentStatus = paymentStatus;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(UUID appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
