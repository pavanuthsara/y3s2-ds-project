package com.se73.doctor_service.service.impl;

import com.se73.doctor_service.dto.PatientMedicalReportResponse;
import com.se73.doctor_service.service.DoctorPatientRecordService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class InMemoryDoctorPatientRecordService implements DoctorPatientRecordService {
	@Override
	public List<PatientMedicalReportResponse> getPatientReports(String doctorUsername, String patientId) {
		if (!StringUtils.hasText(doctorUsername)) {
			throw new IllegalArgumentException("Doctor username is required");
		}

		if (!StringUtils.hasText(patientId)) {
			throw new IllegalArgumentException("Patient id is required");
		}

		return new ArrayList<>();
	}
}
