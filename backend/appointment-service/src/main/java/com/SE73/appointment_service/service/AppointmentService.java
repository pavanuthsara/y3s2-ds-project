package com.se73.appointment_service.service;

import com.se73.appointment_service.client.DoctorClient;
import com.se73.appointment_service.client.PatientClient;
import com.se73.appointment_service.dto.*;
import com.se73.appointment_service.enums.PaymentStatus;
import com.se73.appointment_service.model.Appointment;
import com.se73.appointment_service.repository.AppointmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository repository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    @Transactional
    public Appointment createAppointment(Long patientId, Long doctorId, Long slotId) {
        // 1. Verify Patient exists (Mocked for now)
        PatientDTO patient = patientClient.getPatient(patientId);

        // 2. Get Doctor details and Price (Mocked for now)
        DoctorDTO doctor = doctorClient.getDoctor(doctorId);
        TimeSlotDTO slot = doctorClient.getSlot(doctorId, slotId);

        // 3. Create Appointment Record
        Appointment appointment = new Appointment();
        appointment.setPatientId(patient.id());
        appointment.setDoctorId(doctor.id());
        appointment.setSlotId(slot.id());
        appointment.setAppointmentTime(slot.startTime());
        appointment.setPrice(doctor.consultationFee());
        appointment.setPaymentStatus(PaymentStatus.PENDING);

        return repository.save(appointment);
    }
}
