package com.se73.doctor_service.service;

import com.se73.doctor_service.dto.AppointmentActionResponse;
import com.se73.doctor_service.dto.DoctorAppointmentResponse;

import java.util.List;
import java.util.UUID;

public interface DoctorAppointmentService {
	List<DoctorAppointmentResponse> getDoctorAppointments(String doctorUsername);

	AppointmentActionResponse acceptAppointment(String doctorUsername, UUID appointmentId);

	AppointmentActionResponse rejectAppointment(String doctorUsername, UUID appointmentId);
}
