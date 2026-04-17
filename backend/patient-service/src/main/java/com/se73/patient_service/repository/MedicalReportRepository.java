package com.se73.patient_service.repository;

import com.se73.patient_service.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientId(Long patientId);
    Optional<MedicalReport> findByIdAndPatientId(Long id, Long patientId);
}
