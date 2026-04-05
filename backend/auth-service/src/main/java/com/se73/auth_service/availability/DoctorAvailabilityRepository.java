package com.se73.auth_service.availability;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailabilitySlot, Long> {

    List<DoctorAvailabilitySlot> findByDoctorUsernameOrderByDayOfWeekAscStartTimeAsc(String doctorUsername);

    List<DoctorAvailabilitySlot> findByDoctorUsernameAndDayOfWeekOrderByStartTimeAsc(String doctorUsername, DayOfWeek dayOfWeek);

    Optional<DoctorAvailabilitySlot> findByIdAndDoctorUsername(Long id, String doctorUsername);

    void deleteByDoctorUsername(String doctorUsername);
}
