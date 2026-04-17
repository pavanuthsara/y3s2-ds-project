package com.se73.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @Column(columnDefinition = "UUID")
    private UUID id = UUID.randomUUID();
    
    @Column(nullable = false)
    private String recipientEmail;
    
    @Column(nullable = false)
    private String recipientPhone;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String emailBody;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel;
    
    private String transactionId;
    
    private String patientId;
    
    private String doctorId;
    
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;
    
    private LocalDateTime sentAt;
    
    private String errorMessage;
    
    private Integer retryCount = 0;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = NotificationStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum NotificationType {
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        APPOINTMENT_REMINDER,
        APPOINTMENT_CONFIRMED,
        APPOINTMENT_CANCELLED,
        PRESCRIPTION_READY,
        DOCTOR_AVAILABLE,
        GENERAL_NOTIFICATION
    }
    
    public enum NotificationStatus {
        PENDING,
        SENT,
        FAILED,
        RETRYING,
        DELIVERED,
        BOUNCED
    }
    
    public enum Channel {
        EMAIL,
        SMS,
        PUSH_NOTIFICATION,
        IN_APP
    }
}
