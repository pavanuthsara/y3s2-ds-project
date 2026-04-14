package com.se73.doctor_service.repository;

import com.se73.doctor_service.model.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
	List<DoctorProfile> findAllByOrderBySpecialtyAscLastNameAscFirstNameAsc();
}
