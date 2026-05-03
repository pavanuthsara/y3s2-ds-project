package com.se73.patient_service.service;

import com.se73.patient_service.dto.CreatePatientProfileRequest;
import com.se73.patient_service.dto.UpdatePatientProfileRequest;
import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.repository.PatientProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;

    public PatientProfileService(PatientProfileRepository patientProfileRepository) {
        this.patientProfileRepository = patientProfileRepository;
    }

    public PatientProfile createProfile(String username, CreatePatientProfileRequest request) {
        // Each authenticated user can have only one patient profile.
        if (patientProfileRepository.existsByUsername(username)) {
            throw new RuntimeException("Patient profile already exists");
        }

        PatientProfile patientProfile = new PatientProfile();
        patientProfile.setUsername(username);
        patientProfile.setFirstName(request.getFirstName());
        patientProfile.setLastName(request.getLastName());
        patientProfile.setPhone(request.getPhone());
        patientProfile.setAddress(request.getAddress());
        patientProfile.setDateOfBirth(request.getDateOfBirth());

        return patientProfileRepository.save(patientProfile);
    }

    public PatientProfile getProfile(String username) {
        return patientProfileRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }

    public PatientProfile updateProfile(String username, UpdatePatientProfileRequest request) {
        // Updates are always applied to the profile owned by the current username.
        PatientProfile patientProfile = getProfile(username);
        patientProfile.setFirstName(request.getFirstName());
        patientProfile.setLastName(request.getLastName());
        patientProfile.setPhone(request.getPhone());
        patientProfile.setAddress(request.getAddress());
        patientProfile.setDateOfBirth(request.getDateOfBirth());

        return patientProfileRepository.save(patientProfile);
    }
}
