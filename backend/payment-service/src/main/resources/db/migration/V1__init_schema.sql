CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY,
    appointment_id UUID NOT NULL,
    patient_id VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(500),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_payment_transactions_appointment_id ON payment_transactions(appointment_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);