package com.se73.payment_service.controller;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
@Slf4j
public class WebhookController {

    @Value("${stripe.webhook-secret}")
    private String stripeWebhookSecret;

    /**
     * Stripe webhook endpoint for payment events
     * POST /webhooks/stripe
     */
    @PostMapping("/stripe")
    public ResponseEntity<?> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        try {
            log.info("Received Stripe webhook event");

            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, signature, stripeWebhookSecret);

            // Handle different event types
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;
                case "charge.refunded":
                    handleRefund(event);
                    break;
                default:
                    log.info("Unhandled event type: {}", event.getType());
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (paymentIntent != null) {
            log.info("Payment succeeded: {}", paymentIntent.getId());
            // Here you would update the transaction status in the database
            // and trigger notification to the patient
        }
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (paymentIntent != null) {
            log.warn("Payment failed: {}", paymentIntent.getId());
            // Update transaction status and notify patient
        }
    }

    private void handleRefund(Event event) {
        log.info("Refund processed: {}", event.getId());
        // Update transaction status to REFUNDED
    }
}
