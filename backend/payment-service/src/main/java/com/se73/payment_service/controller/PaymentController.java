package com.se73.payment_service.controller;

import com.se73.payment_service.dto.PaymentConfirmRequest;
import com.se73.payment_service.dto.PaymentInitiateRequest;
import com.se73.payment_service.dto.PaymentResponse;
import com.se73.payment_service.dto.TransactionHistoryResponse;
import com.se73.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiate a new payment for an appointment
     * POST /api/payments/initiate
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            HttpServletRequest httpRequest) {

        try {
            log.info("Payment initiation request received for appointment: {}", request.getAppointmentId());

            PaymentResponse response = paymentService.initiatePayment(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error initiating payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Payment initiation failed: " + e.getMessage()));
        }
    }

    /**
     * Confirm payment after customer completes payment gateway
     * POST /api/payments/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        try {
            log.info("Payment confirmation request received for transaction: {}", request.getTransactionId());

            PaymentResponse response = paymentService.confirmPayment(
                    request.getTransactionId(), request.getPaymentMethodId(), authorization);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error confirming payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Payment confirmation failed: " + e.getMessage()));
        }
    }

    /**
     * Get transaction details
     * GET /api/payments/transaction/{id}
     */
    @GetMapping("/transaction/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable UUID id) {
        try {
            PaymentResponse response = paymentService.getTransaction(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving transaction", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Transaction not found: " + e.getMessage()));
        }
    }

    /**
     * Get all transactions for a patient
     * GET /api/payments/patient/{patientId}/history
     */
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<?> getPatientTransactionHistory(@PathVariable String patientId) {
        try {
            List<TransactionHistoryResponse> history = paymentService.getPatientTransactionHistory(patientId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error retrieving patient transaction history", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to retrieve transaction history: " + e.getMessage()));
        }
    }

    /**
     * Refund a transaction
     * POST /api/payments/refund/{transactionId}
     */
    @PostMapping("/refund/{transactionId}")
    public ResponseEntity<?> refundTransaction(@PathVariable UUID transactionId) {
        try {
            log.info("Refund request received for transaction: {}", transactionId);

            PaymentResponse response = paymentService.refundTransaction(transactionId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing refund", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Refund failed: " + e.getMessage()));
        }
    }

    /**
     * Get all transactions (Admin endpoint)
     * GET /api/payments/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllTransactions(HttpServletRequest request) {
        try {
            // Check if user is admin
            String role = (String) request.getAttribute("role");
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Admin access required"));
            }

            List<TransactionHistoryResponse> transactions = paymentService.getAllTransactions();
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving all transactions", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to retrieve transactions: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     * GET /api/payments/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new HealthResponse("Payment Service is running"));
    }

    // Helper classes
    public static class ErrorResponse {
        private String error;
        private long timestamp;

        public ErrorResponse(String error) {
            this.error = error;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() {
            return error;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

    public static class HealthResponse {
        private String status;
        private long timestamp;

        public HealthResponse(String status) {
            this.status = status;
            this.timestamp = System.currentTimeMillis();
        }

        public String getStatus() {
            return status;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
