package com.se73.notification_service.dto;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private UUID id;
    private String type;
    private String recipientUserId;
    private String recipientEmail;
    private String subject;
    private String bodyText;
    private String status;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private List<AttemptView> attempts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttemptView {
        private String channel;
        private String status;
        private String errorMessage;
        private LocalDateTime attemptedAt;
    }

    public static NotificationResponse from(Notification n) {
        List<AttemptView> attemptViews = n.getAttempts() == null ? List.of() : n.getAttempts().stream()
                .map(a -> AttemptView.builder()
                        .channel(a.getChannel().name())
                        .status(a.getStatus().name())
                        .errorMessage(a.getErrorMessage())
                        .attemptedAt(a.getAttemptedAt())
                        .build())
                .toList();
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .recipientUserId(n.getRecipientUserId())
                .recipientEmail(n.getRecipientEmail())
                .subject(n.getSubject())
                .bodyText(n.getBodyText())
                .status(n.getStatus().name())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .attempts(attemptViews)
                .build();
    }
}
