package com.se73.patient_service.service;

import com.se73.patient_service.dto.CreatePatientProfileRequest;
import com.se73.patient_service.dto.UpdatePatientProfileRequest;
import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.repository.PatientProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientProfileServiceTest {

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @InjectMocks
    private PatientProfileService patientProfileService;

    @Test
    void createProfileSavesNewProfile() {
        CreatePatientProfileRequest request = new CreatePatientProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("123456789");
        request.setAddress("Main Street");
        request.setDateOfBirth(LocalDate.of(1995, 1, 10));

        when(patientProfileRepository.existsByUsername("john")).thenReturn(false);
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PatientProfile result = patientProfileService.createProfile("john", request);

        assertEquals("john", result.getUsername());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());

        ArgumentCaptor<PatientProfile> captor = ArgumentCaptor.forClass(PatientProfile.class);
        verify(patientProfileRepository).save(captor.capture());
        assertEquals("john", captor.getValue().getUsername());
    }

    @Test
    void createProfileThrowsWhenProfileExists() {
        CreatePatientProfileRequest request = new CreatePatientProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");

        when(patientProfileRepository.existsByUsername("john")).thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> patientProfileService.createProfile("john", request)
        );

        assertEquals("Patient profile already exists", exception.getMessage());
    }

    @Test
    void updateProfileUpdatesExistingProfile() {
        PatientProfile existing = new PatientProfile();
        existing.setUsername("john");
        existing.setFirstName("Old");
        existing.setLastName("Name");

        UpdatePatientProfileRequest request = new UpdatePatientProfileRequest();
        request.setFirstName("New");
        request.setLastName("Name");
        request.setPhone("5555555");
        request.setAddress("Updated Address");
        request.setDateOfBirth(LocalDate.of(1990, 5, 1));

        when(patientProfileRepository.findByUsername("john")).thenReturn(Optional.of(existing));
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PatientProfile updated = patientProfileService.updateProfile("john", request);

        assertEquals("New", updated.getFirstName());
        assertEquals("Name", updated.getLastName());
        assertEquals("5555555", updated.getPhone());
        assertEquals("Updated Address", updated.getAddress());
        assertEquals(LocalDate.of(1990, 5, 1), updated.getDateOfBirth());
    }

    @Test
    void getProfileThrowsWhenNotFound() {
        when(patientProfileRepository.findByUsername("missing")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> patientProfileService.getProfile("missing")
        );

        assertEquals("Patient profile not found", exception.getMessage());
    }
}
