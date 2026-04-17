package com.se73.notification_service.service;

import com.se73.notification_service.dto.SendNotificationRequest;
import com.se73.notification_service.dto.NotificationResponse;
import com.se73.notification_service.entity.Notification;
import com.se73.notification_service.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        log.info("Sending notification to: {} for transaction: {}", request.getRecipientEmail(), request.getTransactionId());
        
        try {
            // Determine notification channel
            Notification.Channel channel = determineChannel(request.getChannel());
            
            // Determine notification type
            Notification.NotificationType type = Notification.NotificationType.valueOf(request.getType());
            
            // Create notification entity
            Notification notification = Notification.builder()
                    .id(UUID.randomUUID())
                    .recipientEmail(request.getRecipientEmail())
                    .recipientPhone(request.getRecipientPhone())
                    .subject(request.getSubject())
                    .message(request.getMessage())
                    .emailBody(request.getEmailBody() != null ? request.getEmailBody() : generateEmailBody(request))
                    .type(type)
                    .channel(channel)
                    .transactionId(request.getTransactionId())
                    .patientId(request.getPatientId())
                    .doctorId(request.getDoctorId())
                    .status(Notification.NotificationStatus.PENDING)
                    .retryCount(0)
                    .build();
            
            // Send notification based on channel
            boolean sent = sendByChannel(notification, channel);
            
            if (sent) {
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus(Notification.NotificationStatus.FAILED);
                notification.setErrorMessage("Failed to send notification via " + channel);
            }
            
            // Save notification
            notification = notificationRepository.save(notification);
            
            return mapToResponse(notification);
            
        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send notification: " + e.getMessage());
        }
    }
    
    private boolean sendByChannel(Notification notification, Notification.Channel channel) {
        switch (channel) {
            case EMAIL:
                return sendEmailNotification(notification);
            case SMS:
                return sendSmsNotification(notification);
            case IN_APP:
                return saveInAppNotification(notification);
            case PUSH_NOTIFICATION:
                return sendPushNotification(notification);
            default:
                return false;
        }
    }
    
    private boolean sendEmailNotification(Notification notification) {
        log.info("Sending email notification to: {}", notification.getRecipientEmail());
        
        String emailBody = notification.getEmailBody() != null ? notification.getEmailBody() : buildDefaultEmailBody(notification);
        
        return emailService.sendEmail(
                notification.getRecipientEmail(),
                notification.getSubject(),
                emailBody
        );
    }
    
    private boolean sendSmsNotification(Notification notification) {
        log.info("Sending SMS notification to: {}", notification.getRecipientPhone());
        // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
        log.warn("SMS notifications not yet implemented");
        return false;
    }
    
    private boolean sendPushNotification(Notification notification) {
        log.info("Sending push notification");
        // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        log.warn("Push notifications not yet implemented");
        return false;
    }
    
    private boolean saveInAppNotification(Notification notification) {
        log.info("Saving in-app notification for user: {}", notification.getPatientId());
        return true;
    }
    
    private String buildDefaultEmailBody(Notification notification) {
        return switch (notification.getType()) {
            case PAYMENT_SUCCESS -> buildPaymentSuccessEmail(notification);
            case PAYMENT_FAILED -> buildPaymentFailedEmail(notification);
            case APPOINTMENT_REMINDER -> buildAppointmentReminderEmail(notification);
            case APPOINTMENT_CONFIRMED -> buildAppointmentConfirmedEmail(notification);
            case APPOINTMENT_CANCELLED -> buildAppointmentCancelledEmail(notification);
            default -> notification.getMessage();
        };
    }
    
    private String buildPaymentSuccessEmail(Notification notification) {
        return String.format("""
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; border: 1px solid #ddd; margin-top: 10px; }
                        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Payment Successful ✓</h2>
                        </div>
                        <div class="content">
                            <p>Dear Patient,</p>
                            <p>Your payment has been processed successfully!</p>
                            <p><strong>Transaction ID:</strong> %s</p>
                            <p>Thank you for choosing our healthcare services. Your appointment has been confirmed.</p>
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Healthcare Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, notification.getTransactionId());
    }
    
    private String buildPaymentFailedEmail(Notification notification) {
        return String.format("""
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f44336; color: white; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; border: 1px solid #ddd; margin-top: 10px; }
                        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Payment Failed ✗</h2>
                        </div>
                        <div class="content">
                            <p>Dear Patient,</p>
                            <p>Unfortunately, your payment could not be processed.</p>
                            <p><strong>Transaction ID:</strong> %s</p>
                            <p>Please try again or contact our support team for assistance.</p>
                            <p>We apologize for any inconvenience.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Healthcare Platform. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, notification.getTransactionId());
    }
    
    private String buildAppointmentReminderEmail(Notification notification) {
        return """
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2196F3; color: white; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; border: 1px solid #ddd; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Appointment Reminder</h2>
                        </div>
                        <div class="content">
                            <p>Dear Patient,</p>
                            <p>This is a reminder about your upcoming appointment.</p>
                            <p>Please ensure you arrive 10 minutes early.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }
    
    private String buildAppointmentConfirmedEmail(Notification notification) {
        return """
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; border: 1px solid #ddd; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Appointment Confirmed ✓</h2>
                        </div>
                        <div class="content">
                            <p>Dear Patient,</p>
                            <p>Your appointment has been confirmed.</p>
                            <p>You will receive further details shortly.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }
    
    private String buildAppointmentCancelledEmail(Notification notification) {
        return """
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ff9800; color: white; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; border: 1px solid #ddd; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Appointment Cancelled</h2>
                        </div>
                        <div class="content">
                            <p>Dear Patient,</p>
                            <p>Your appointment has been cancelled.</p>
                            <p>Please contact our support team if you have any questions.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }
    
    private String generateEmailBody(SendNotificationRequest request) {
        if (request.getEmailBody() != null && !request.getEmailBody().isBlank()) {
            return request.getEmailBody();
        }
        return buildDefaultEmailBody(Notification.builder()
                .type(Notification.NotificationType.valueOf(request.getType()))
                .transactionId(request.getTransactionId())
                .build());
    }
    
    private Notification.Channel determineChannel(String channel) {
        if (channel != null) {
            try {
                return Notification.Channel.valueOf(channel);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid channel: {}, defaulting to EMAIL", channel);
            }
        }
        return Notification.Channel.EMAIL;
    }
    
    public NotificationResponse getNotification(UUID id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        return notification.map(this::mapToResponse).orElse(null);
    }
    
    public List<NotificationResponse> getNotificationsByEmail(String email) {
        List<Notification> notifications = notificationRepository.findByRecipientEmail(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getNotificationsByPatient(String patientId) {
        List<Notification> notifications = notificationRepository.findByPatientId(patientId);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getNotificationsByTransaction(String transactionId) {
        List<Notification> notifications = notificationRepository.findByTransactionId(transactionId);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId().toString())
                .recipientEmail(notification.getRecipientEmail())
                .recipientPhone(notification.getRecipientPhone())
                .subject(notification.getSubject())
                .type(notification.getType().toString())
                .status(notification.getStatus().toString())
                .channel(notification.getChannel().toString())
                .transactionId(notification.getTransactionId())
                .patientId(notification.getPatientId())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .errorMessage(notification.getErrorMessage())
                .retryCount(notification.getRetryCount())
                .build();
    }
}
