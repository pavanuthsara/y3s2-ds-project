package com.se73.appointment_service.repository;

import com.se73.appointment_service.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Find all appointments for a specific patient
    List<Appointment> findByPatientId(Long patientId);

    // Find all appointments for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);

    Appointment findAppointmentsByAppointmentMode();
}
