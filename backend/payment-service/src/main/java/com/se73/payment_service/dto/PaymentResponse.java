package com.se73.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID transactionId;

    private UUID appointmentId;

    private String patientId;

    private BigDecimal amount;

    private String currency;

    private String status;

    private String paymentGateway;

    private String clientSecret;

    private String redirectUrl;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}
