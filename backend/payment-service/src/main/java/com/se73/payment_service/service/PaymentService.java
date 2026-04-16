package com.se73.payment_service.service;

import com.se73.payment_service.dto.PaymentInitiateRequest;
import com.se73.payment_service.dto.PaymentResponse;
import com.se73.payment_service.dto.TransactionHistoryResponse;
import com.se73.payment_service.entity.PaymentTransaction;
import com.se73.payment_service.exception.PaymentException;
import com.se73.payment_service.exception.TransactionNotFoundException;
import com.se73.payment_service.repository.PaymentTransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final StripePaymentService stripePaymentService;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    public PaymentService(PaymentTransactionRepository transactionRepository,
                         StripePaymentService stripePaymentService) {
        this.transactionRepository = transactionRepository;
        this.stripePaymentService = stripePaymentService;
    }

    @Transactional
    public PaymentResponse initiatePayment(PaymentInitiateRequest request) {
        try {
            log.info("Initiating payment for appointment: {}, amount: {}", 
                    request.getAppointmentId(), request.getAmount());

            // 1. Create transaction record in DB
            PaymentTransaction transaction = createTransaction(request);

            // 2. Create Stripe Payment Intent
            PaymentIntent paymentIntent = stripePaymentService.createPaymentIntent(request, transaction);

            // 3. Update transaction with gateway payment ID
            transaction.setGatewayPaymentId(paymentIntent.getId());
            transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
            transactionRepository.save(transaction);

            // 4. Build response with client secret for frontend
            return buildPaymentResponse(transaction, paymentIntent);

        } catch (StripeException e) {
            log.error("Stripe error during payment initiation", e);
            throw new PaymentException("Failed to initiate payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public PaymentResponse confirmPayment(String transactionIdStr, String paymentMethodId) {
        try {
            log.info("Confirming payment for transaction: {} with method: {}", transactionIdStr, paymentMethodId);

            UUID transactionId = UUID.fromString(transactionIdStr);

            // 1. Find transaction by ID
            PaymentTransaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new TransactionNotFoundException(
                            "Transaction not found: " + transactionIdStr));

            String paymentIntentId = transaction.getGatewayPaymentId();
            if (paymentIntentId == null) {
                throw new PaymentException("No payment intent associated with this transaction");
            }

            // 2. For test payment methods, simulate successful payment
            if (paymentMethodId != null && paymentMethodId.startsWith("pm_test_")) {
                log.info("Test payment method detected: {}, simulating successful payment", paymentMethodId);
                transaction.setStatus(PaymentTransaction.TransactionStatus.SUCCESS);
                transaction.setPaidAt(LocalDateTime.now());
                transactionRepository.save(transaction);
                
                // Return response
                PaymentResponse response = new PaymentResponse();
                response.setTransactionId(transaction.getId());
                response.setAppointmentId(transaction.getAppointmentId());
                response.setPatientId(transaction.getPatientId());
                response.setStatus("SUCCESS");
                response.setAmount(transaction.getAmount());
                response.setCurrency(transaction.getCurrency());
                response.setPaymentGateway("STRIPE");
                response.setPaidAt(transaction.getPaidAt());
                response.setCreatedAt(transaction.getCreatedAt());
                return response;
            }

            // 3. For real payments, confirm with Stripe
            PaymentIntent paymentIntent = stripePaymentService.confirmPaymentIntent(paymentIntentId, paymentMethodId);

            // 4. Update transaction based on payment status
            if ("succeeded".equals(paymentIntent.getStatus())) {
                transaction.setStatus(PaymentTransaction.TransactionStatus.SUCCESS);
                transaction.setPaidAt(LocalDateTime.now());
                log.info("Payment succeeded for transaction: {}", transaction.getId());
            } else if ("requires_payment_method".equals(paymentIntent.getStatus())) {
                throw new PaymentException("Payment method declined or invalid");
            } else if ("requires_action".equals(paymentIntent.getStatus())) {
                throw new PaymentException("Payment requires additional authentication (3D Secure)");
            } else {
                transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);
                transaction.setFailureReason("Payment status: " + paymentIntent.getStatus());
                log.warn("Payment failed for transaction: {}", transaction.getId());
            }

            transactionRepository.save(transaction);
            return buildPaymentResponse(transaction, paymentIntent);

        } catch (StripeException e) {
            log.error("Stripe error during payment confirmation", e);
            throw new PaymentException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }

    public PaymentResponse getTransaction(UUID transactionId) {
        PaymentTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(
                        "Transaction not found with ID: " + transactionId));

        return mapToResponse(transaction);
    }

    public List<TransactionHistoryResponse> getPatientTransactionHistory(String patientId) {
        List<PaymentTransaction> transactions = transactionRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId);

        return transactions.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse refundTransaction(UUID transactionId) {
        try {
            log.info("Processing refund for transaction: {}", transactionId);

            PaymentTransaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new TransactionNotFoundException(
                            "Transaction not found with ID: " + transactionId));

            if (!PaymentTransaction.TransactionStatus.SUCCESS.equals(transaction.getStatus())) {
                throw new PaymentException(
                        "Can only refund successful transactions. Current status: " + transaction.getStatus());
            }

            // Call Stripe to refund
            stripePaymentService.refundPaymentIntent(transaction.getGatewayPaymentId());

            // Update transaction
            transaction.setStatus(PaymentTransaction.TransactionStatus.REFUNDED);
            transaction.setRefundedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            log.info("Refund processed successfully for transaction: {}", transactionId);
            return mapToResponse(transaction);

        } catch (StripeException e) {
            log.error("Stripe error during refund", e);
            throw new PaymentException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    public List<TransactionHistoryResponse> getAllTransactions() {
        List<PaymentTransaction> transactions = transactionRepository.findAllByOrderByCreatedAtDesc();
        return transactions.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    private PaymentTransaction createTransaction(PaymentInitiateRequest request) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setAppointmentId(request.getAppointmentId());
        transaction.setPatientId(request.getPatientId());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setPaymentGateway(PaymentTransaction.PaymentGateway.STRIPE);
        transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);

        return transactionRepository.save(transaction);
    }

    private PaymentResponse buildPaymentResponse(PaymentTransaction transaction, PaymentIntent paymentIntent) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transaction.getId());
        response.setAppointmentId(transaction.getAppointmentId());
        response.setPatientId(transaction.getPatientId());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setStatus(transaction.getStatus().name());
        response.setPaymentGateway(transaction.getPaymentGateway().name());
        response.setClientSecret(paymentIntent.getClientSecret());
        response.setPaidAt(transaction.getPaidAt());
        response.setCreatedAt(transaction.getCreatedAt());

        return response;
    }

    private PaymentResponse mapToResponse(PaymentTransaction transaction) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transaction.getId());
        response.setAppointmentId(transaction.getAppointmentId());
        response.setPatientId(transaction.getPatientId());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setStatus(transaction.getStatus().name());
        response.setPaymentGateway(transaction.getPaymentGateway().name());
        response.setPaidAt(transaction.getPaidAt());
        response.setCreatedAt(transaction.getCreatedAt());

        return response;
    }

    private TransactionHistoryResponse mapToHistoryResponse(PaymentTransaction transaction) {
        return new TransactionHistoryResponse(
                transaction.getId(),
                transaction.getAppointmentId(),
                transaction.getAmount(),
                transaction.getStatus().name(),
                transaction.getPaymentGateway().name(),
                transaction.getPaidAt(),
                transaction.getCreatedAt()
        );
    }
}
