package com.se73.patient_service.controller;

import com.se73.patient_service.dto.CreatePatientProfileRequest;
import com.se73.patient_service.dto.PatientAppointmentHistoryResponse;
import com.se73.patient_service.dto.PatientProfileResponse;
import com.se73.patient_service.dto.PatientPrescriptionResponse;
import com.se73.patient_service.dto.UpdatePatientProfileRequest;
import com.se73.patient_service.dto.MedicalReportResponse;
import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.model.MedicalReport;
import com.se73.patient_service.security.JwtTokenProvider;
import com.se73.patient_service.service.PatientProfileService;
import com.se73.patient_service.service.FileStorageService;
import com.se73.patient_service.service.PatientRecordsService;
import com.se73.patient_service.repository.MedicalReportRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientProfileService patientProfileService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FileStorageService fileStorageService;
    private final MedicalReportRepository medicalReportRepository;
    private final PatientRecordsService patientRecordsService;

    public PatientController(PatientProfileService patientProfileService, JwtTokenProvider jwtTokenProvider,
                           FileStorageService fileStorageService, MedicalReportRepository medicalReportRepository,
                           PatientRecordsService patientRecordsService) {
        this.patientProfileService = patientProfileService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.fileStorageService = fileStorageService;
        this.medicalReportRepository = medicalReportRepository;
        this.patientRecordsService = patientRecordsService;
    }

    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreatePatientProfileRequest request
    ) {
        try {
            String username = extractUsername(authHeader);
            PatientProfile profile = patientProfileService.createProfile(username, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(new PatientProfileResponse(profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            PatientProfile profile = patientProfileService.getProfile(username);
            return ResponseEntity.ok(new PatientProfileResponse(profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdatePatientProfileRequest request
    ) {
        try {
            String username = extractUsername(authHeader);
            PatientProfile profile = patientProfileService.updateProfile(username, request);
            return ResponseEntity.ok(new PatientProfileResponse(profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getPatientHistory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        try {
            PatientProfile patient = getAuthorizedPatient(authHeader, id);
            List<PatientAppointmentHistoryResponse> history = patientRecordsService.getPatientHistory(patient);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/prescriptions")
    public ResponseEntity<?> getPatientPrescriptions(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        try {
            PatientProfile patient = getAuthorizedPatient(authHeader, id);
            List<PatientPrescriptionResponse> prescriptions = patientRecordsService.getPatientPrescriptions(patient);
            return ResponseEntity.ok(prescriptions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/reports")
    public ResponseEntity<?> uploadReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            getAuthorizedPatient(authHeader, id);

            MedicalReport report = fileStorageService.uploadFile(id, file, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(new MedicalReportResponse(report, "/api/patients/" + id + "/reports/" + report.getId() + "/download"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/reports")
    public ResponseEntity<?> getReports(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        try {
            getAuthorizedPatient(authHeader, id);

            List<MedicalReport> reports = medicalReportRepository.findByPatientId(id);
            List<MedicalReportResponse> responses = reports.stream()
                    .map(r -> new MedicalReportResponse(r, "/api/patients/" + id + "/reports/" + r.getId() + "/download"))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/reports/{reportId}")
    public ResponseEntity<?> getReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        try {
            getAuthorizedPatient(authHeader, id);

            MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, id)
                    .orElseThrow(() -> new RuntimeException("Report not found"));
            return ResponseEntity.ok(new MedicalReportResponse(report, "/api/patients/" + id + "/reports/" + report.getId() + "/download"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/reports/{reportId}/download")
    public ResponseEntity<?> downloadReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        try {
            getAuthorizedPatient(authHeader, id);
            FileStorageService.DownloadedFile downloadedFile = fileStorageService.downloadFile(reportId, id);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadedFile.fileName() + "\"")
                    .contentType(MediaType.parseMediaType(downloadedFile.contentType()))
                    .body(new ByteArrayResource(downloadedFile.content()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/reports/{reportId}")
    public ResponseEntity<?> deleteReport(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @PathVariable Long reportId
    ) {
        try {
            getAuthorizedPatient(authHeader, id);

            fileStorageService.deleteFile(reportId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(e.getMessage()));
        }
    }

    private PatientProfile getAuthorizedPatient(String authHeader, Long id) {
        String username = extractUsername(authHeader);
        PatientProfile patient = patientProfileService.getProfile(username);
        if (!patient.getId().equals(id)) {
            throw new SecurityException("You can only access your own patient data");
        }
        return patient;
    }

    private String extractUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid token format");
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        return jwtTokenProvider.getUsernameFromToken(token);
    }

    public static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
