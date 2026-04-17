package com.se73.notification_service.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    
    private String id;
    
    private String recipientEmail;
    
    private String recipientPhone;
    
    private String subject;
    
    private String type;
    
    private String status;
    
    private String channel;
    
    private String transactionId;
    
    private String patientId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime sentAt;
    
    private String errorMessage;
    
    private Integer retryCount;
}
