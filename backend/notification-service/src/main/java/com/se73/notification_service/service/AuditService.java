package com.se73.notification_service.service;

import com.se73.notification_service.entity.AuditLog;
import com.se73.notification_service.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private static final String ACTOR = "notification-service";

    private final AuditLogRepository auditLogRepository;

    public void record(String entityType, String entityId, AuditLog.Action action, String details) {
        AuditLog entry = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .actor(ACTOR)
                .details(details)
                .build();
        try {
            auditLogRepository.save(entry);
        } catch (Exception e) {
            // Never let an audit failure break the main flow.
            log.warn("Audit write failed for {}/{} action={}: {}", entityType, entityId, action, e.getMessage());
        }
    }
}
