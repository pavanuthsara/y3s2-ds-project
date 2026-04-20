CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_username VARCHAR(255) NOT NULL,
    slot_id UUID NOT NULL,
    appointment_date_time TIMESTAMP NOT NULL,
    appointment_mode VARCHAR(16) NOT NULL,
    hospital VARCHAR(255),
    status VARCHAR(16) NOT NULL,
    price NUMERIC(10, 2),
    payment_status VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    notes TEXT
);