package com.se73.doctor_service.service.impl;

import com.se73.doctor_service.dto.AppointmentActionResponse;
import com.se73.doctor_service.dto.DoctorAppointmentResponse;
import com.se73.doctor_service.service.DoctorAppointmentService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryDoctorAppointmentService implements DoctorAppointmentService {
	private final ConcurrentHashMap<UUID, AppointmentActionResponse> appointmentStates = new ConcurrentHashMap<>();

	@Override
	public List<DoctorAppointmentResponse> getDoctorAppointments(String doctorUsername) {
		validateDoctorUsername(doctorUsername);
		return new ArrayList<>();
	}

	@Override
	public AppointmentActionResponse acceptAppointment(String doctorUsername, UUID appointmentId) {
		validateDoctorUsername(doctorUsername);
		validateAppointmentId(appointmentId);

		AppointmentActionResponse response = new AppointmentActionResponse(
			appointmentId,
			doctorUsername,
			"ACCEPTED",
			"Appointment accepted"
		);
		appointmentStates.put(appointmentId, response);
		return response;
	}

	@Override
	public AppointmentActionResponse rejectAppointment(String doctorUsername, UUID appointmentId) {
		validateDoctorUsername(doctorUsername);
		validateAppointmentId(appointmentId);

		AppointmentActionResponse response = new AppointmentActionResponse(
			appointmentId,
			doctorUsername,
			"REJECTED",
			"Appointment rejected"
		);
		appointmentStates.put(appointmentId, response);
		return response;
	}

	private void validateDoctorUsername(String doctorUsername) {
		if (!StringUtils.hasText(doctorUsername)) {
			throw new IllegalArgumentException("Doctor username is required");
		}
	}

	private void validateAppointmentId(UUID appointmentId) {
		if (appointmentId == null) {
			throw new IllegalArgumentException("Appointment id is required");
		}
	}
}
