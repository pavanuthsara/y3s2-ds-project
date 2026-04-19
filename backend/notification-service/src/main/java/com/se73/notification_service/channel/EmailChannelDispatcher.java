package com.se73.notification_service.channel;

import com.se73.notification_service.entity.DeliveryAttempt;
import com.se73.notification_service.entity.Notification;
import com.se73.notification_service.service.EmailTemplateService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailChannelDispatcher implements ChannelDispatcher {

    private final JavaMailSender mailSender;
    private final EmailTemplateService templateService;

    @Value("${notification.mail.from}")
    private String fromAddress;

    @Value("${notification.mail.enabled:true}")
    private boolean enabled;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Override
    public DeliveryAttempt.Channel channel() {
        return DeliveryAttempt.Channel.EMAIL;
    }

    @Override
    public DeliveryAttempt dispatch(Notification notification) {
        DeliveryAttempt attempt = DeliveryAttempt.builder()
                .notification(notification)
                .channel(DeliveryAttempt.Channel.EMAIL)
                .attemptedAt(LocalDateTime.now())
                .build();

        if (!enabled || smtpUsername == null || smtpUsername.isBlank()) {
            log.warn("Email channel skipped (disabled or SMTP creds not configured)");
            attempt.setStatus(DeliveryAttempt.Status.SKIPPED);
            attempt.setErrorMessage("Email channel disabled or SMTP credentials not configured");
            return attempt;
        }

        String recipient = notification.getRecipientEmail();
        if (recipient == null || recipient.isBlank()) {
            attempt.setStatus(DeliveryAttempt.Status.SKIPPED);
            attempt.setErrorMessage("No recipient email on notification");
            return attempt;
        }

        try {
            String htmlBody = templateService.renderForNotification(notification);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject(notification.getSubject() != null ? notification.getSubject() : "Notification");
            helper.setText(htmlBody, true);

            mailSender.send(message);

            attempt.setStatus(DeliveryAttempt.Status.SUCCESS);
            attempt.setProviderMessageId("smtp-" + UUID.randomUUID());
            log.info("Email dispatched to {} for notification {}", recipient, notification.getId());
        } catch (Exception e) {
            log.error("Email dispatch failed for notification {}: {}", notification.getId(), e.getMessage(), e);
            attempt.setStatus(DeliveryAttempt.Status.FAILED);
            attempt.setErrorMessage(truncate(e.getMessage(), 2000));
        }

        return attempt;
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
