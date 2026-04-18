package com.se73.notification_service.channel;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mock SMS dispatcher. Logs the would-be SMS and marks the attempt SUCCESS.
 * Swap to Twilio/Vonage by replacing the body of dispatch().
 */
@Component
@Slf4j
public class SmsChannelDispatcher implements ChannelDispatcher {

    @Override
    public DeliveryAttempt.Channel channel() {
        return DeliveryAttempt.Channel.SMS;
    }

    @Override
    public DeliveryAttempt dispatch(Notification notification) {
        DeliveryAttempt attempt = DeliveryAttempt.builder()
                .notification(notification)
                .channel(DeliveryAttempt.Channel.SMS)
                .attemptedAt(LocalDateTime.now())
                .build();

        String phone = notification.getRecipientPhone();
        if (phone == null || phone.isBlank()) {
            attempt.setStatus(DeliveryAttempt.Status.SKIPPED);
            attempt.setErrorMessage("No recipient phone on notification");
            return attempt;
        }

        String body = notification.getBodyText() != null
                ? notification.getBodyText()
                : (notification.getSubject() != null ? notification.getSubject() : "You have a new notification");

        log.info("[MOCK SMS] to={} body={}", phone, body);
        attempt.setStatus(DeliveryAttempt.Status.SUCCESS);
        attempt.setProviderMessageId("mock-sms-" + UUID.randomUUID());
        return attempt;
    }
}
