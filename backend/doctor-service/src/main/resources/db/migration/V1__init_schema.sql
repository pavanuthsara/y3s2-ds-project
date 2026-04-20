CREATE TABLE doctors (
    doctor_username VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    qualifications VARCHAR(255),
    bio VARCHAR(255),
    phone_number VARCHAR(255),
    profile_photo VARCHAR(255),
    consultation_fee NUMERIC(19, 2),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(19, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE availability_slots (
    id UUID PRIMARY KEY,
    doctor_username VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_availability_slots_doctor
        FOREIGN KEY (doctor_username) REFERENCES doctors (doctor_username)
        ON DELETE CASCADE
);

CREATE INDEX idx_availability_slots_doctor_username ON availability_slots(doctor_username);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY,
    doctor_username VARCHAR(255) NOT NULL,
    patient_id VARCHAR(255) NOT NULL,
    appointment_id UUID NOT NULL,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    instructions VARCHAR(255) NOT NULL,
    notes VARCHAR(255),
    issued_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_prescriptions_doctor
        FOREIGN KEY (doctor_username) REFERENCES doctors (doctor_username)
        ON DELETE CASCADE
);

CREATE INDEX idx_prescriptions_doctor_username ON prescriptions(doctor_username);