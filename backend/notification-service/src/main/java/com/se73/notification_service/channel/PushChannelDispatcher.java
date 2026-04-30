package com.se73.notification_service.channel;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mock push notification dispatcher. Swap to FCM/APNs by replacing the body of dispatch().
 */
@Component
@Slf4j
public class PushChannelDispatcher implements ChannelDispatcher {

    @Override
    public DeliveryAttempt.Channel channel() {
        return DeliveryAttempt.Channel.PUSH;
    }

    @Override
    public DeliveryAttempt dispatch(Notification notification) {
        DeliveryAttempt attempt = DeliveryAttempt.builder()
                .notification(notification)
                .channel(DeliveryAttempt.Channel.PUSH)
                .attemptedAt(LocalDateTime.now())
                .build();

        String recipient = notification.getRecipientUserId();
        if (recipient == null || recipient.isBlank()) {
            attempt.setStatus(DeliveryAttempt.Status.SKIPPED);
            attempt.setErrorMessage("No recipient userId on notification");
            return attempt;
        }

        log.info("[MOCK PUSH] userId={} title={} body={}",
                recipient, notification.getSubject(), notification.getBodyText());
        attempt.setStatus(DeliveryAttempt.Status.SUCCESS);
        attempt.setProviderMessageId("mock-push-" + UUID.randomUUID());
        return attempt;
    }
}
