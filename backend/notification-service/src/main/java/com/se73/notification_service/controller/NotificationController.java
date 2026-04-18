package com.se73.notification_service.controller;

import com.se73.notification_service.dto.NotificationResponse;
import com.se73.notification_service.dto.PaymentConfirmedNotificationRequest;
import com.se73.notification_service.entity.Notification;
import com.se73.notification_service.repository.NotificationRepository;
import com.se73.notification_service.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    /**
     * Receives a payment-confirmed event from payment-service.
     */
    @PostMapping("/payment-confirmed")
    public ResponseEntity<NotificationResponse> onPaymentConfirmed(
            @Valid @RequestBody PaymentConfirmedNotificationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        log.info("Received payment-confirmed notification request for transaction {}", request.getTransactionId());
        Notification n = notificationService.handlePaymentConfirmed(request, authorization);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(NotificationResponse.from(n));
    }

    /**
     * In-app list for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> listForUser(@PathVariable String userId) {
        List<NotificationResponse> items = notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@PathVariable String userId) {
        long count = notificationRepository.countByRecipientUserIdAndReadAtIsNull(userId);
        return ResponseEntity.ok(Map.of("unread", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setReadAt(LocalDateTime.now());
                    return ResponseEntity.ok(NotificationResponse.from(notificationRepository.save(n)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> get(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(n -> ResponseEntity.ok(NotificationResponse.from(n)))
                .orElse(ResponseEntity.notFound().build());
    }
}
