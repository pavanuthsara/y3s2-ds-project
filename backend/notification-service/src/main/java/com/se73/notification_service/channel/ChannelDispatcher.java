package com.se73.notification_service.channel;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;

public interface ChannelDispatcher {

    DeliveryAttempt.Channel channel();

    /**
     * Dispatch the notification through this channel.
     * Implementations should return a DeliveryAttempt with status SUCCESS / FAILED / SKIPPED.
     * Must not throw — catch and encode errors into the attempt.
     */
    DeliveryAttempt dispatch(Notification notification);
}
