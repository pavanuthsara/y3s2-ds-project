package com.se73.patient_service.integration.controller;

import com.se73.patient_service.model.MedicalReport;
import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.repository.MedicalReportRepository;
import com.se73.patient_service.repository.PatientProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.OK;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@ActiveProfiles("test")
class PatientControllerIT {

    private static final String JWT_SECRET = "mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789";

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @AfterEach
    void tearDown() {
        medicalReportRepository.deleteAll();
        patientProfileRepository.deleteAll();
    }

    @Test
    void createProfilePersistsProfileAndReturnsCreatedResponse() throws Exception {
        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/patients"),
                POST,
                jsonRequest("""
                        {
                          "firstName": "Damith",
                          "lastName": "Chandrathilaka",
                          "phone": "0771234567",
                          "address": "Colombo",
                          "dateOfBirth": "2000-01-02"
                        }
                        """, "damith"),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(CREATED);
        JsonNode body = objectMapper.readTree(response.getBody());
        assertThat(body.get("username").asText()).isEqualTo("damith");
        assertThat(body.get("firstName").asText()).isEqualTo("Damith");
        assertThat(body.get("lastName").asText()).isEqualTo("Chandrathilaka");
        assertThat(body.get("phone").asText()).isEqualTo("0771234567");
        assertThat(body.get("address").asText()).isEqualTo("Colombo");
        assertThat(body.get("dateOfBirth").asText()).isEqualTo("2000-01-02");

        PatientProfile savedProfile = patientProfileRepository.findByUsername("damith").orElseThrow();
        assertThat(savedProfile.getFirstName()).isEqualTo("Damith");
        assertThat(savedProfile.getLastName()).isEqualTo("Chandrathilaka");
    }

    @Test
    void getMyProfileReturnsPersistedPatientProfile() throws Exception {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("damith");
        profile.setFirstName("Damith");
        profile.setLastName("Chandrathilaka");
        profile.setPhone("0771234567");
        profile.setAddress("Colombo");
        profile.setDateOfBirth(LocalDate.of(2000, 1, 2));
        patientProfileRepository.save(profile);

        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/patients/me"),
                GET,
                authOnlyRequest("damith"),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(OK);
        JsonNode body = objectMapper.readTree(response.getBody());
        assertThat(body.get("username").asText()).isEqualTo("damith");
        assertThat(body.get("firstName").asText()).isEqualTo("Damith");
        assertThat(body.get("lastName").asText()).isEqualTo("Chandrathilaka");
    }

    @Test
    void updateMyProfileUpdatesPersistedPatientProfile() throws Exception {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("damith");
        profile.setFirstName("Damith");
        profile.setLastName("Old");
        profile.setPhone("0770000000");
        profile.setAddress("Kandy");
        profile.setDateOfBirth(LocalDate.of(1999, 5, 1));
        patientProfileRepository.save(profile);

        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/patients/me"),
                PUT,
                jsonRequest("""
                        {
                          "firstName": "Damith",
                          "lastName": "Updated",
                          "phone": "0719999999",
                          "address": "Galle",
                          "dateOfBirth": "1998-03-04"
                        }
                        """, "damith"),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(OK);
        JsonNode body = objectMapper.readTree(response.getBody());
        assertThat(body.get("lastName").asText()).isEqualTo("Updated");
        assertThat(body.get("phone").asText()).isEqualTo("0719999999");
        assertThat(body.get("address").asText()).isEqualTo("Galle");
        assertThat(body.get("dateOfBirth").asText()).isEqualTo("1998-03-04");

        PatientProfile updatedProfile = patientProfileRepository.findByUsername("damith").orElseThrow();
        assertThat(updatedProfile.getLastName()).isEqualTo("Updated");
        assertThat(updatedProfile.getPhone()).isEqualTo("0719999999");
        assertThat(updatedProfile.getAddress()).isEqualTo("Galle");
    }

    @Test
    void getReportsReturnsOnlyAuthorizedPatientsReports() throws Exception {
        PatientProfile profile = new PatientProfile();
        profile.setUsername("damith");
        profile.setFirstName("Damith");
        profile.setLastName("Chandrathilaka");
        patientProfileRepository.save(profile);

        MedicalReport report = new MedicalReport(
                profile.getId(),
                "lab-report.pdf",
                "s3://patient-reports-damith-001/reports/" + profile.getId() + "/lab-report.pdf",
                "PDF",
                512L,
                "Blood test"
        );
        MedicalReport savedReport = medicalReportRepository.save(report);

        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/patients/" + profile.getId() + "/reports"),
                GET,
                authOnlyRequest("damith"),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(OK);
        JsonNode body = objectMapper.readTree(response.getBody());
        assertThat(body.get(0).get("id").asLong()).isEqualTo(savedReport.getId());
        assertThat(body.get(0).get("fileName").asText()).isEqualTo("lab-report.pdf");
        assertThat(body.get(0).get("fileType").asText()).isEqualTo("PDF");
        assertThat(body.get(0).get("downloadUrl").asText())
                .isEqualTo("/api/patients/" + profile.getId() + "/reports/" + savedReport.getId() + "/download");
    }

    @Test
    void getReportsRejectsAccessToAnotherPatientsData() throws Exception {
        PatientProfile owner = new PatientProfile();
        owner.setUsername("owner");
        owner.setFirstName("Owner");
        owner.setLastName("Patient");
        patientProfileRepository.save(owner);

        PatientProfile attacker = new PatientProfile();
        attacker.setUsername("damith");
        attacker.setFirstName("Damith");
        attacker.setLastName("Chandrathilaka");
        patientProfileRepository.save(attacker);

        ResponseEntity<String> response = restTemplate.exchange(
                url("/api/patients/" + owner.getId() + "/reports"),
                GET,
                authOnlyRequest("damith"),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(FORBIDDEN);
        JsonNode body = objectMapper.readTree(response.getBody());
        assertThat(body.get("message").asText()).isEqualTo("You can only access your own patient data");
    }

    private HttpEntity<String> jsonRequest(String body, String username) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(rawToken(username));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private HttpEntity<Void> authOnlyRequest(String username) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(rawToken(username));
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return new HttpEntity<>(headers);
    }

    private String rawToken(String username) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
