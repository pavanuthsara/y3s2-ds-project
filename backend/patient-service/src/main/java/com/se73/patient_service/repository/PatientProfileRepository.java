package com.se73.patient_service.repository;

import com.se73.patient_service.model.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUsername(String username);
    boolean existsByUsername(String username);
}
