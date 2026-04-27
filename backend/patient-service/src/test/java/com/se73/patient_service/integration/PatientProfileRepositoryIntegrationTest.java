package com.se73.patient_service.integration;

import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.repository.PatientProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class PatientProfileRepositoryIntegrationTest {

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", () -> "jdbc:h2:mem:patient-service-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1");
    registry.add("spring.datasource.username", () -> "sa");
    registry.add("spring.datasource.password", () -> "");
    registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.H2Dialect");
    }

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Test
    void saveAndFindByUsernameWorksWithRealPostgres() {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("jane");
        profile.setFirstName("Jane");
        profile.setLastName("Doe");
        profile.setPhone("123456789");
        profile.setAddress("Sample Street");
        profile.setDateOfBirth(LocalDate.of(1992, 3, 14));

        patientProfileRepository.save(profile);

        Optional<PatientProfile> loaded = patientProfileRepository.findByUsername("jane");

        assertTrue(loaded.isPresent());
        assertEquals("Jane", loaded.get().getFirstName());
        assertTrue(patientProfileRepository.existsByUsername("jane"));
    }
}
