package com.se73.telemedicine_service.controller;

import com.se73.telemedicine_service.dto.SessionCreateRequest;
import com.se73.telemedicine_service.dto.SessionResponse;
import com.se73.telemedicine_service.dto.SessionTokenResponse;
import com.se73.telemedicine_service.service.TelemedicineSessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/telemedicine")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TelemedicineController {

    private final TelemedicineSessionService telemedicineSessionService;

    public TelemedicineController(TelemedicineSessionService telemedicineSessionService) {
        this.telemedicineSessionService = telemedicineSessionService;
    }

    @PostMapping("/session/create")
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody SessionCreateRequest request) {
        return ResponseEntity.ok(telemedicineSessionService.createSession(request));
    }

    @GetMapping("/session/{sessionId}/token")
    public ResponseEntity<SessionTokenResponse> getSessionToken(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(telemedicineSessionService.getSessionToken(sessionId));
    }

    @PutMapping("/session/{sessionId}/start")
    public ResponseEntity<SessionResponse> startSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(telemedicineSessionService.startSession(sessionId));
    }

    @PutMapping("/session/{sessionId}/end")
    public ResponseEntity<SessionResponse> endSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(telemedicineSessionService.endSession(sessionId));
    }

    @GetMapping("/session/{sessionId}/status")
    public ResponseEntity<SessionResponse> getSessionStatus(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(telemedicineSessionService.getSessionStatus(sessionId));
    }

    @GetMapping("/session/appointment/{appointmentId}")
    public ResponseEntity<SessionResponse> getByAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(telemedicineSessionService.getSessionByAppointment(appointmentId));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("UP");
    }
}
