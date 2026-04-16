package com.se73.doctor_service.repository;

import com.se73.doctor_service.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
}
