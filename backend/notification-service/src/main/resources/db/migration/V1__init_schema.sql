CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    recipient_user_id VARCHAR(128),
    recipient_email VARCHAR(256),
    recipient_phone VARCHAR(32),
    subject VARCHAR(256),
    body_text TEXT,
    payload_json TEXT,
    status VARCHAR(32) NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE TABLE delivery_attempts (
    id UUID PRIMARY KEY,
    notification_id UUID NOT NULL,
    channel VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    provider_message_id VARCHAR(256),
    error_message TEXT,
    attempted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_delivery_attempts_notification
        FOREIGN KEY (notification_id) REFERENCES notifications (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_attempts_notification ON delivery_attempts(notification_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(64),
    entity_id VARCHAR(128),
    action VARCHAR(48) NOT NULL,
    actor VARCHAR(64),
    details TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);