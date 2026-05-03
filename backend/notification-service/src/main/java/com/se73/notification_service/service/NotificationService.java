package com.se73.notification_service.service;

import tools.jackson.databind.ObjectMapper;
import com.se73.notification_service.channel.ChannelDispatcher;
import com.se73.notification_service.dto.PatientContactInfo;
import com.se73.notification_service.dto.PaymentConfirmedNotificationRequest;
import com.se73.notification_service.entity.AuditLog;
import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import com.se73.notification_service.exception.ValidationException;
import com.se73.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuditService auditService;
    private final PatientLookupService patientLookupService;
    private final ObjectMapper objectMapper;
    private final List<ChannelDispatcher> dispatchers;

    // Validates the request, resolves patient contact info, builds the notification record, and fans out to all channels
    @Transactional
    public Notification handlePaymentConfirmed(PaymentConfirmedNotificationRequest req, String bearerToken) {
        auditService.record("transaction", req.getTransactionId(),
                AuditLog.Action.NOTIFICATION_RECEIVED,
                "payment-confirmed event received for appointment " + req.getAppointmentId());

        validate(req);
        auditService.record("transaction", req.getTransactionId(),
                AuditLog.Action.NOTIFICATION_VALIDATED, null);

        PatientContactInfo contact = resolveContact(req, bearerToken);

        String subject = String.format("Payment confirmed — %s %s",
                req.getCurrency() != null ? req.getCurrency() : "", req.getAmount().toPlainString()).trim();
        String bodyText = String.format(
                "Your payment of %s %s for appointment %s has been received. Thank you!",
                req.getAmount().toPlainString(),
                req.getCurrency() != null ? req.getCurrency() : "",
                req.getAppointmentId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("transactionId", req.getTransactionId());
        payload.put("appointmentId", req.getAppointmentId());
        payload.put("patientId", req.getPatientId());
        payload.put("amount", req.getAmount());
        payload.put("currency", req.getCurrency());
        payload.put("paymentGateway", req.getPaymentGateway());
        payload.put("patientName", contact != null ? contact.getDisplayName() : req.getPatientName());
        if (req.getDoctorName() != null) payload.put("doctorName", req.getDoctorName());
        if (req.getAppointmentMode() != null) payload.put("appointmentMode", req.getAppointmentMode());
        if (req.getHospital() != null) payload.put("hospital", req.getHospital());
        if (req.getAppointmentDateTime() != null) payload.put("appointmentDateTime", req.getAppointmentDateTime());

        Notification notification = Notification.builder()
                .type(Notification.Type.PAYMENT_CONFIRMED)
                .recipientUserId(req.getPatientId())
                .recipientEmail(contact != null && contact.getEmail() != null ? contact.getEmail() : req.getPatientEmail())
                .recipientPhone(contact != null && contact.getPhone() != null ? contact.getPhone() : req.getPatientPhone())
                .subject(subject)
                .bodyText(bodyText)
                .payloadJson(toJson(payload))
                .status(Notification.Status.PENDING)
                .build();

        notification = notificationRepository.save(notification);
        auditService.record("notification", notification.getId().toString(),
                AuditLog.Action.NOTIFICATION_CREATED,
                "type=PAYMENT_CONFIRMED recipient=" + notification.getRecipientUserId());

        return dispatchAll(notification);
    }

    /**
     * Fan-out to every configured channel in parallel and aggregate the results.
     */
    // Dispatches the notification to every configured channel in parallel and aggregates delivery results
    private Notification dispatchAll(Notification notification) {
        UUID notificationId = notification.getId();

        List<CompletableFuture<DeliveryAttempt>> futures = dispatchers.stream()
                .map(d -> {
                    auditService.record("notification", notificationId.toString(),
                            AuditLog.Action.CHANNEL_DISPATCHED, "channel=" + d.channel().name());
                    return CompletableFuture.supplyAsync(() -> safeDispatch(d, notification));
                })
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        List<DeliveryAttempt> attempts = futures.stream()
                .map(CompletableFuture::join)
                .sorted(Comparator.comparing(a -> a.getChannel().name()))
                .toList();

        // Attach to the notification so they cascade-save.
        Notification managed = notificationRepository.findById(notificationId).orElseThrow();
        managed.getAttempts().clear();
        managed.getAttempts().addAll(attempts);
        attempts.forEach(a -> a.setNotification(managed));

        boolean anySuccess = attempts.stream().anyMatch(a -> a.getStatus() == DeliveryAttempt.Status.SUCCESS);
        boolean anyFail = attempts.stream().anyMatch(a -> a.getStatus() == DeliveryAttempt.Status.FAILED);
        Notification.Status finalStatus;
        if (anySuccess && anyFail) {
            finalStatus = Notification.Status.PARTIALLY_DELIVERED;
        } else if (anySuccess) {
            finalStatus = Notification.Status.DELIVERED;
        } else {
            finalStatus = Notification.Status.FAILED;
        }
        managed.setStatus(finalStatus);
        Notification saved = notificationRepository.save(managed);

        attempts.forEach(a -> auditService.record("notification", notificationId.toString(),
                a.getStatus() == DeliveryAttempt.Status.SUCCESS
                        ? AuditLog.Action.CHANNEL_SUCCEEDED
                        : AuditLog.Action.CHANNEL_FAILED,
                "channel=" + a.getChannel().name()
                        + " status=" + a.getStatus().name()
                        + (a.getErrorMessage() != null ? " error=" + a.getErrorMessage() : "")));

        auditService.record("notification", notificationId.toString(),
                AuditLog.Action.NOTIFICATION_COMPLETED,
                "finalStatus=" + finalStatus.name());

        return saved;
    }

    private DeliveryAttempt safeDispatch(ChannelDispatcher dispatcher, Notification notification) {
        try {
            return dispatcher.dispatch(notification);
        } catch (Exception e) {
            log.error("Dispatcher {} threw unexpectedly: {}", dispatcher.channel(), e.getMessage(), e);
            return DeliveryAttempt.builder()
                    .notification(notification)
                    .channel(dispatcher.channel())
                    .status(DeliveryAttempt.Status.FAILED)
                    .errorMessage("Unhandled dispatcher error: " + e.getMessage())
                    .attemptedAt(LocalDateTime.now())
                    .build();
        }
    }

    // Prefers email from the inbound request; falls back to a patient-service lookup via the forwarded JWT
    private PatientContactInfo resolveContact(PaymentConfirmedNotificationRequest req, String bearerToken) {
        // Prefer contact info from the inbound request.
        if (req.getPatientEmail() != null && !req.getPatientEmail().isBlank()) {
            return PatientContactInfo.builder()
                    .patientId(req.getPatientId())
                    .email(req.getPatientEmail())
                    .phone(req.getPatientPhone())
                    .displayName(req.getPatientName())
                    .build();
        }
        // Fall back to a service-to-service lookup via forwarded JWT.
        PatientContactInfo looked = patientLookupService.lookupSelf(bearerToken);
        if (looked != null) {
            log.debug("Patient contact resolved via patient-service lookup");
        } else {
            log.info("No patient contact info available — channels requiring it will skip");
        }
        return looked;
    }

    private void validate(PaymentConfirmedNotificationRequest req) {
        List<String> errors = new ArrayList<>();
        if (req.getTransactionId() == null || req.getTransactionId().isBlank()) errors.add("transactionId");
        if (req.getPatientId() == null || req.getPatientId().isBlank()) errors.add("patientId");
        if (req.getAppointmentId() == null || req.getAppointmentId().isBlank()) errors.add("appointmentId");
        if (req.getAmount() == null || req.getAmount().signum() <= 0) errors.add("amount");
        if (req.getPatientEmail() != null && !req.getPatientEmail().isBlank()
                && !req.getPatientEmail().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            errors.add("patientEmail (invalid format)");
        }
        if (!errors.isEmpty()) {
            String msg = "Invalid fields: " + String.join(", ", errors);
            auditService.record("transaction",
                    req.getTransactionId() == null ? "<missing>" : req.getTransactionId(),
                    AuditLog.Action.VALIDATION_FAILED, msg);
            throw new ValidationException(msg);
        }
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return "{}";
        }
    }
}
