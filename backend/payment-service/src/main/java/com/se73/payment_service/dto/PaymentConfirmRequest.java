package com.se73.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    private String paymentMethodId;

    private String doctorName;
    private String appointmentMode;
    private String hospital;
    private String appointmentDateTime;
}
