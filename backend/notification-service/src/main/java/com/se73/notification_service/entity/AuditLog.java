package com.se73.notification_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    public enum Action {
        NOTIFICATION_RECEIVED,
        NOTIFICATION_VALIDATED,
        NOTIFICATION_CREATED,
        CHANNEL_DISPATCHED,
        CHANNEL_SUCCEEDED,
        CHANNEL_FAILED,
        NOTIFICATION_COMPLETED,
        VALIDATION_FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "entity_type", length = 64)
    private String entityType;

    @Column(name = "entity_id", length = 128)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 48)
    private Action action;

    @Column(length = 64)
    private String actor;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
