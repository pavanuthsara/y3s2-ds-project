package com.se73.notification_service.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.se73.notification_service.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateService {

    private final TemplateEngine templateEngine;
    private final ObjectMapper objectMapper;

    public String renderForNotification(Notification notification) {
        String templateName = templateFor(notification.getType());
        Context ctx = new Context();

        ctx.setVariable("subject", notification.getSubject());
        ctx.setVariable("bodyText", notification.getBodyText());
        ctx.setVariable("recipientName", notification.getRecipientUserId());

        Map<String, Object> payload = parsePayload(notification.getPayloadJson());
        payload.forEach(ctx::setVariable);

        try {
            return templateEngine.process(templateName, ctx);
        } catch (Exception e) {
            log.warn("Template '{}' failed ({}), falling back to plain body", templateName, e.getMessage());
            return "<p>" + (notification.getBodyText() != null ? notification.getBodyText() : "") + "</p>";
        }
    }

    private String templateFor(Notification.Type type) {
        return switch (type) {
            case PAYMENT_CONFIRMED -> "payment-confirmed";
            case PAYMENT_FAILED -> "payment-failed";
            case APPOINTMENT_BOOKED -> "appointment-booked";
            default -> "generic";
        };
    }

    private Map<String, Object> parsePayload(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse notification payload JSON: {}", e.getMessage());
            return Map.of();
        }
    }
}
