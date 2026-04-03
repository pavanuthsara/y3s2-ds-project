package com.se73.patient_service.controller;

import com.se73.patient_service.dto.CreatePatientProfileRequest;
import com.se73.patient_service.dto.PatientProfileResponse;
import com.se73.patient_service.dto.UpdatePatientProfileRequest;
import com.se73.patient_service.model.PatientProfile;
import com.se73.patient_service.security.JwtTokenProvider;
import com.se73.patient_service.service.PatientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientProfileService patientProfileService;
    private final JwtTokenProvider jwtTokenProvider;

    public PatientController(PatientProfileService patientProfileService, JwtTokenProvider jwtTokenProvider) {
        this.patientProfileService = patientProfileService;
        this.jwtTokenProvider = jwtTokenProvider;
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
