package com.SE73.appointment_service.repository;

import com.SE73.appointment_service.enums.AppointmentStatus;
import com.SE73.appointment_service.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Appointment} entities.
 * Provides CRUD operations and custom query methods for appointment lookups.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    /**
     * Find all appointments belonging to a specific patient.
     *
     * @param patientId the patient's identifier
     * @return list of matching appointments
     */
    List<Appointment> findByPatientId(String patientId);

    /**
     * Find all appointments associated with a specific doctor.
     *
     * @param doctorUsername the doctor's username
     * @return list of matching appointments
     */
    List<Appointment> findByDoctorUsername(String doctorUsername);

    /**
     * Find all appointments linked to a specific time slot.
     *
     * @param slotId the slot UUID
     * @return list of matching appointments
     */
    List<Appointment> findBySlotId(UUID slotId);

    /**
     * Find all appointments with a given status.
     *
     * @param status the appointment status
     * @return list of matching appointments
     */
    List<Appointment> findByStatus(AppointmentStatus status);

    /**
     * Check if a slot is already booked by any active appointment.
     *
     * @param slotId the slot UUID to check
     * @return true if the slot is already booked
     */
    boolean existsBySlotId(UUID slotId);
}
