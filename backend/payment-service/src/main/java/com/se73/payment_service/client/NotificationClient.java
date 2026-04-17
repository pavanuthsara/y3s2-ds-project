package com.se73.payment_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Component
public class NotificationClient {

    @Value("${notification.service.url:http://notification-service:8088}")
    private String notificationServiceUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public boolean sendPaymentSuccessNotification(String recipientEmail, String transactionId, String patientId, Double amount) {
        try {
            log.info("Sending payment success notification to: {}", recipientEmail);

            String payload = String.format("""
                    {
                      "recipientEmail": "%s",
                      "subject": "Payment Confirmation - Transaction %s",
                      "message": "Your payment of %.2f has been processed successfully.",
                      "type": "PAYMENT_SUCCESS",
                      "channel": "EMAIL",
                      "transactionId": "%s",
                      "patientId": "%s"
                    }
                    """, recipientEmail, transactionId, amount, transactionId, patientId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(notificationServiceUrl + "/send"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201 || response.statusCode() == 200) {
                log.info("Payment success notification sent successfully");
                return true;
            } else {
                log.warn("Failed to send notification, status code: {}", response.statusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("Error sending payment success notification: {}", e.getMessage(), e);
            return false; // Don't throw, payment is already successful
        }
    }

    public boolean sendPaymentFailureNotification(String recipientEmail, String transactionId, String reason) {
        try {
            log.info("Sending payment failure notification to: {}", recipientEmail);

            String payload = String.format("""
                    {
                      "recipientEmail": "%s",
                      "subject": "Payment Failed - Transaction %s",
                      "message": "Your payment could not be processed. Reason: %s",
                      "type": "PAYMENT_FAILED",
                      "channel": "EMAIL",
                      "transactionId": "%s"
                    }
                    """, recipientEmail, transactionId, reason, transactionId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(notificationServiceUrl + "/send"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 201 || response.statusCode() == 200) {
                log.info("Payment failure notification sent successfully");
                return true;
            } else {
                log.warn("Failed to send notification, status code: {}", response.statusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("Error sending payment failure notification: {}", e.getMessage(), e);
            return false;
        }
    }
}
