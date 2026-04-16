package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.PatientMedicalReportResponse;

import java.util.List;

public interface DoctorPatientRecordService {
	List<PatientMedicalReportResponse> getPatientReports(String doctorUsername, String patientId);
}
