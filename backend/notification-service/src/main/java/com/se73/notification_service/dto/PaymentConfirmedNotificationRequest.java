package com.se73.notification_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmedNotificationRequest {

    @NotBlank(message = "transactionId is required")
    private String transactionId;

    @NotBlank(message = "patientId is required")
    private String patientId;

    @NotBlank(message = "appointmentId is required")
    private String appointmentId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private BigDecimal amount;

    private String currency;

    private String paymentGateway;

    /** Optional — if provided, notification-service will use this and skip patient-service lookup. */
    private String patientEmail;

    /** Optional — if provided, used for SMS channel. */
    private String patientPhone;

    /** Optional — display name for email templating. */
    private String patientName;
}
