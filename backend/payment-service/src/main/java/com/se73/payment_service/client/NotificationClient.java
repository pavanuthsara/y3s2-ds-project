package com.se73.payment_service.client;

import com.se73.payment_service.entity.PaymentTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Fire-and-forget client that posts a payment-confirmed event to the notification service.
 * A failure here must never roll back the payment.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8088/api/notifications}")
    private String notificationServiceUrl;

    @Async
    public void sendPaymentConfirmed(PaymentTransaction tx, String bearerToken) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("transactionId", tx.getId() != null ? tx.getId().toString() : null);
            body.put("patientId", tx.getPatientId());
            body.put("appointmentId", tx.getAppointmentId() != null ? tx.getAppointmentId().toString() : null);
            body.put("amount", tx.getAmount() != null ? tx.getAmount() : BigDecimal.ZERO);
            body.put("currency", tx.getCurrency());
            body.put("paymentGateway", tx.getPaymentGateway() != null ? tx.getPaymentGateway().name() : "STRIPE");
            body.put("patientEmail", tx.getPatientEmail());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (bearerToken != null && !bearerToken.isBlank()) {
                headers.set("Authorization", bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken);
            }

            restTemplate.postForEntity(
                    notificationServiceUrl + "/payment-confirmed",
                    new HttpEntity<>(body, headers),
                    String.class
            );
            log.info("payment-confirmed notification dispatched for transaction {}", tx.getId());
        } catch (Exception e) {
            log.warn("Failed to dispatch payment-confirmed notification for transaction {}: {}",
                    tx.getId(), e.getMessage());
        }
    }
}
