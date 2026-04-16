package com.se73.payment_service.service;

import com.se73.payment_service.dto.PaymentInitiateRequest;
import com.se73.payment_service.dto.PaymentResponse;
import com.se73.payment_service.entity.PaymentTransaction;
import com.se73.payment_service.exception.PaymentException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentUpdateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class StripePaymentService {

    public PaymentIntent createPaymentIntent(PaymentInitiateRequest request, PaymentTransaction transaction)
            throws StripeException {

        // Convert amount to cents (Stripe works with cents)
        long amountInCents = request.getAmount()
                .multiply(new BigDecimal(100))
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(request.getCurrency().toLowerCase())
                .setDescription(request.getDescription() + " - Appointment: " + request.getAppointmentId())
                .putMetadata("appointmentId", request.getAppointmentId().toString())
                .putMetadata("patientId", request.getPatientId())
                .putMetadata("transactionId", transaction.getId().toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    public PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId)
            throws StripeException {

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

        if (paymentMethodId != null && !paymentMethodId.isEmpty()) {
            PaymentIntentUpdateParams.Builder builder = PaymentIntentUpdateParams.builder()
                    .setPaymentMethod(paymentMethodId);

            intent.update(builder.build());
        }

        return intent;
    }

    public void refundPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if ("succeeded".equals(intent.getStatus())) {
            intent.cancel();
            log.info("Refund initiated for payment intent: {}", paymentIntentId);
        } else {
            throw new PaymentException("Cannot refund payment with status: " + intent.getStatus());
        }
    }
}
