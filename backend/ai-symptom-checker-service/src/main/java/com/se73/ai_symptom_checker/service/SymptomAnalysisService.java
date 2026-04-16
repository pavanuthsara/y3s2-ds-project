package com.se73.ai_symptom_checker.service;

import com.se73.ai_symptom_checker.dto.SymptomCheckRequest;
import com.se73.ai_symptom_checker.dto.SymptomCheckResponse;
import com.se73.ai_symptom_checker.dto.HealthCondition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class SymptomAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public SymptomCheckResponse analyzeSymptoms(SymptomCheckRequest request) {
        log.info("Analyzing symptoms: {}", request.getSymptoms());

        try {
            String prompt = buildAnalysisPrompt(request);
            String geminiResponse = callGeminiAPI(prompt);
            
            return parseGeminiResponse(geminiResponse, request);
        } catch (Exception e) {
            log.error("Error analyzing symptoms", e);
            return getErrorResponse();
        }
    }

    private String buildAnalysisPrompt(SymptomCheckRequest request) {
        return String.format(
            """
            You are a medical AI assistant. Analyze the following symptoms and provide preliminary health suggestions.
            
            PATIENT INFORMATION:
            - Symptoms: %s
            - Duration: %s
            - Severity: %s
            - Age Group: %s
            - Additional Info: %s
            
            Please provide a response in JSON format with the following structure:
            {
              "conditions": [
                {
                  "name": "Condition Name",
                  "probability": 75,
                  "description": "Brief description",
                  "characteristics": ["symptom1", "symptom2"],
                  "severity": "mild/moderate/severe"
                }
              ],
              "recommendedSpecialties": ["Specialty 1", "Specialty 2"],
              "warnings": ["Warning 1", "Warning 2"],
              "nextSteps": "What the patient should do",
              "confidence": "high/medium/low"
            }
            
            IMPORTANT RESTRICTIONS:
            1. Only suggest top 3-5 most probable conditions
            2. Do not diagnose - only provide preliminary suggestions
            3. Always include a medical disclaimer
            4. If any warning signs present, highlight urgently
            5. Recommend seeing a doctor for proper diagnosis
            
            Provide ONLY the JSON response, no additional text.
            """,
            String.join(", ", request.getSymptoms()),
            request.getDuration(),
            request.getSeverity(),
            request.getAgeGroup(),
            request.getAdditionalInfo() != null ? request.getAdditionalInfo() : "None"
        );
    }

    private String callGeminiAPI(String prompt) {
        // For now, return a mock response since we need to handle API key setup
        // This will be replaced with actual Gemini API call
        log.info("Calling Gemini API with prompt");
        
        // Mock response for demonstration
        return """
        {
          "conditions": [
            {
              "name": "Common Cold",
              "probability": 80,
              "description": "A viral infection causing upper respiratory symptoms",
              "characteristics": ["nasal congestion", "cough", "mild fever"],
              "severity": "mild"
            },
            {
              "name": "Influenza (Flu)",
              "probability": 60,
              "description": "Highly contagious viral infection",
              "characteristics": ["high fever", "body aches", "severe fatigue"],
              "severity": "moderate"
            },
            {
              "name": "Bronchitis",
              "probability": 45,
              "description": "Inflammation of bronchial tubes",
              "characteristics": ["persistent cough", "mucus production", "chest discomfort"],
              "severity": "moderate"
            }
          ],
          "recommendedSpecialties": ["General Practitioner", "Pulmonologist", "ENT Specialist"],
          "warnings": ["If fever exceeds 103F, seek immediate care", "If difficulty breathing occurs, visit ER"],
          "nextSteps": "Rest, stay hydrated, monitor symptoms for 2-3 days. If symptoms worsen, consult a healthcare provider.",
          "confidence": "high"
        }
        """;
    }

    private SymptomCheckResponse parseGeminiResponse(String jsonResponse, SymptomCheckRequest request) {
        try {
            SymptomCheckResponse response = objectMapper.readValue(jsonResponse, SymptomCheckResponse.class);
            response.setAnalysisTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            response.setDisclaimer("This is a preliminary AI-based analysis and should NOT be used as a substitute for professional medical advice. Always consult with a qualified healthcare provider for accurate diagnosis and treatment.");
            return response;
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            return getErrorResponse();
        }
    }

    private SymptomCheckResponse getErrorResponse() {
        SymptomCheckResponse response = new SymptomCheckResponse();
        response.setWarnings(Arrays.asList("Unable to process your request at this time. Please try again later."));
        response.setDisclaimer("This is a preliminary AI-based analysis and should NOT be used as a substitute for professional medical advice.");
        response.setNextSteps("Please consult with a healthcare provider for proper medical evaluation.");
        return response;
    }

}
