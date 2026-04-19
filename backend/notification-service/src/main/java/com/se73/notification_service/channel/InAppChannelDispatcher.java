package com.se73.notification_service.channel;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * In-app channel: the Notification row is the delivery.
 * It becomes visible through GET /api/notifications/user/{userId}.
 * This dispatcher simply marks the attempt as SUCCESS once the row is persisted.
 */
@Component
@Slf4j
public class InAppChannelDispatcher implements ChannelDispatcher {

    @Override
    public DeliveryAttempt.Channel channel() {
        return DeliveryAttempt.Channel.IN_APP;
    }

    @Override
    public DeliveryAttempt dispatch(Notification notification) {
        DeliveryAttempt attempt = DeliveryAttempt.builder()
                .notification(notification)
                .channel(DeliveryAttempt.Channel.IN_APP)
                .attemptedAt(LocalDateTime.now())
                .build();

        if (notification.getRecipientUserId() == null || notification.getRecipientUserId().isBlank()) {
            attempt.setStatus(DeliveryAttempt.Status.SKIPPED);
            attempt.setErrorMessage("No recipient userId — in-app delivery not possible");
            return attempt;
        }

        attempt.setStatus(DeliveryAttempt.Status.SUCCESS);
        attempt.setProviderMessageId("in-app-" + notification.getId());
        return attempt;
    }
}
