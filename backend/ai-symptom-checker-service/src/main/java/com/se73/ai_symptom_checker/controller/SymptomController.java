package com.se73.ai_symptom_checker.controller;

import com.se73.ai_symptom_checker.dto.SymptomCheckRequest;
import com.se73.ai_symptom_checker.dto.SymptomCheckResponse;
import com.se73.ai_symptom_checker.service.SymptomAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SymptomController {

    private final SymptomAnalysisService symptomAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSymptoms(
            @Valid @RequestBody SymptomCheckRequest request,
            BindingResult bindingResult) {
        
        log.info("Received symptom analysis request: {}", request.getSymptoms());

        // Validation error handling
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage()
                    ));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            SymptomCheckResponse response = symptomAnalysisService.analyzeSymptoms(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error analyzing symptoms", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to analyze symptoms");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.info("Health check called");
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI Symptom Checker Service");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getServiceInfo() {
        log.info("Service info requested");
        Map<String, Object> info = new HashMap<>();
        info.put("serviceName", "AI Symptom Checker Service");
        info.put("version", "1.0.0");
        info.put("description", "AI-powered preliminary health analysis service");
        info.put("endpoints", new String[]{
                "POST /api/symptoms/analyze - Analyze symptoms",
                "GET /api/symptoms/health - Health check",
                "GET /api/symptoms/info - Service information"
        });
        return ResponseEntity.ok(info);
    }

}
