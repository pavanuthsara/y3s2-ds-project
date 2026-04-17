package com.se73.notification_service.controller;

import com.se73.notification_service.dto.SendNotificationRequest;
import com.se73.notification_service.dto.NotificationResponse;
import com.se73.notification_service.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Send a notification
     */
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        log.info("Received notification request for: {}", request.getRecipientEmail());
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Send payment confirmation notification
     */
    @PostMapping("/payment-confirmation")
    public ResponseEntity<NotificationResponse> sendPaymentConfirmation(
            @RequestParam String recipientEmail,
            @RequestParam String transactionId,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false, defaultValue = "100") Double amount) {
        
        log.info("Sending payment confirmation notification for transaction: {}", transactionId);
        
        SendNotificationRequest request = SendNotificationRequest.builder()
                .recipientEmail(recipientEmail)
                .subject("Payment Confirmation - Transaction " + transactionId)
                .message("Your payment has been processed successfully.")
                .type("PAYMENT_SUCCESS")
                .channel("EMAIL")
                .transactionId(transactionId)
                .patientId(patientId)
                .build();
        
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Send payment failure notification
     */
    @PostMapping("/payment-failure")
    public ResponseEntity<NotificationResponse> sendPaymentFailure(
            @RequestParam String recipientEmail,
            @RequestParam String transactionId,
            @RequestParam(required = false) String reason) {
        
        log.info("Sending payment failure notification for transaction: {}", transactionId);
        
        SendNotificationRequest request = SendNotificationRequest.builder()
                .recipientEmail(recipientEmail)
                .subject("Payment Failed - Transaction " + transactionId)
                .message("Your payment could not be processed. Reason: " + (reason != null ? reason : "Unknown"))
                .type("PAYMENT_FAILED")
                .channel("EMAIL")
                .transactionId(transactionId)
                .build();
        
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Send appointment reminder
     */
    @PostMapping("/appointment-reminder")
    public ResponseEntity<NotificationResponse> sendAppointmentReminder(
            @RequestParam String recipientEmail,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String doctorId) {
        
        log.info("Sending appointment reminder to: {}", recipientEmail);
        
        SendNotificationRequest request = SendNotificationRequest.builder()
                .recipientEmail(recipientEmail)
                .subject("Appointment Reminder")
                .message("This is a reminder about your upcoming appointment.")
                .type("APPOINTMENT_REMINDER")
                .channel("EMAIL")
                .patientId(patientId)
                .doctorId(doctorId)
                .build();
        
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get notification by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotification(@PathVariable UUID id) {
        log.info("Fetching notification: {}", id);
        NotificationResponse response = notificationService.getNotification(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get notifications by email
     */
    @GetMapping("/by-email")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByEmail(@RequestParam String email) {
        log.info("Fetching notifications for email: {}", email);
        List<NotificationResponse> responses = notificationService.getNotificationsByEmail(email);
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get notifications by patient ID
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByPatient(@PathVariable String patientId) {
        log.info("Fetching notifications for patient: {}", patientId);
        List<NotificationResponse> responses = notificationService.getNotificationsByPatient(patientId);
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get notifications by transaction ID
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByTransaction(@PathVariable String transactionId) {
        log.info("Fetching notifications for transaction: {}", transactionId);
        List<NotificationResponse> responses = notificationService.getNotificationsByTransaction(transactionId);
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Notification Service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
