package com.se73.notification_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {
    
    @NotBlank
    @Email
    private String recipientEmail;
    
    private String recipientPhone;
    
    @NotBlank
    private String subject;
    
    @NotBlank
    private String message;
    
    private String emailBody;
    
    @NotBlank
    private String type; // PAYMENT_SUCCESS, PAYMENT_FAILED, etc.
    
    private String channel; // EMAIL, SMS, IN_APP
    
    private String transactionId;
    
    private String patientId;
    
    private String doctorId;
    
    private String metadata;
}
