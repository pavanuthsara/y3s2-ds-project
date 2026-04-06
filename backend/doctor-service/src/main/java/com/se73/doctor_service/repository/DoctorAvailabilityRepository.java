package com.se73.doctor_service.repository;

import com.se73.doctor_service.model.DoctorAvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailabilitySlot, UUID> {
	List<DoctorAvailabilitySlot> findByDoctorUsernameOrderByDayOfWeekAscStartTimeAsc(String doctorUsername);

	List<DoctorAvailabilitySlot> findByDoctorUsernameAndDayOfWeekOrderByStartTimeAsc(String doctorUsername, DayOfWeek dayOfWeek);

	Optional<DoctorAvailabilitySlot> findByIdAndDoctorUsername(UUID id, String doctorUsername);

	void deleteByDoctorUsername(String doctorUsername);
}