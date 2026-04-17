package com.se73.ai_symptom_checker.service;

import com.se73.ai_symptom_checker.dto.SymptomCheckRequest;
import com.se73.ai_symptom_checker.dto.SymptomCheckResponse;
import com.se73.ai_symptom_checker.dto.HealthCondition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

@Slf4j
@Service
public class SymptomAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public SymptomCheckResponse analyzeSymptoms(SymptomCheckRequest request) {
        log.info("Analyzing symptoms: {}", request.getSymptoms());

        try {
            String prompt = buildAnalysisPrompt(request);
            String geminiResponse = callGeminiAPI(prompt);
            
            return parseGeminiResponse(geminiResponse, request);
        } catch (Exception e) {
            log.error("Error analyzing symptoms with Gemini API, using mock data: {}", e.getMessage(), e);
            // Fallback to mock response if API fails
            return generateMockResponse(request);
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
        try {
            log.info("Calling Gemini API");
            
            // Build request body
            String requestBody = String.format("""
                {
                  "contents": [{
                    "parts": [{
                      "text": "%s"
                    }]
                  }]
                }
                """, escapeJsonString(prompt));
            
            // Make HTTP POST request
            URL url = new URL(GEMINI_API_URL + "?key=" + geminiApiKey);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            
            // Send request
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = requestBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            // Read response
            int responseCode = connection.getResponseCode();
            log.info("Gemini API Response Code: {}", responseCode);
            
            String response;
            if (responseCode == 200) {
                response = readResponseStream(connection.getInputStream());
                log.info("Gemini API Response received successfully");
                log.debug("Response: {}", response);
            } else {
                // Read error response
                String errorResponse = readResponseStream(connection.getErrorStream());
                log.error("Gemini API Error Response Code: {} - {}", responseCode, errorResponse);
                throw new Exception("Gemini API error: " + responseCode + " - " + errorResponse);
            }
            
            // Extract text from Gemini response
            return extractTextFromGeminiResponse(response);
            
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            return getErrorResponseJson();
        }
    }
    
    private String readResponseStream(java.io.InputStream stream) throws Exception {
        if (stream == null) {
            return "";
        }
        try (Scanner scanner = new Scanner(stream, StandardCharsets.UTF_8)) {
            scanner.useDelimiter("\\A");
            return scanner.hasNext() ? scanner.next() : "";
        }
    }
    
    private String extractTextFromGeminiResponse(String jsonResponse) throws Exception {
        // Parse Gemini response and extract the text content
        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(jsonResponse);
        com.fasterxml.jackson.databind.JsonNode candidates = root.get("candidates");
        
        if (candidates != null && candidates.isArray() && candidates.size() > 0) {
            com.fasterxml.jackson.databind.JsonNode firstCandidate = candidates.get(0);
            com.fasterxml.jackson.databind.JsonNode content = firstCandidate.get("content");
            if (content != null) {
                com.fasterxml.jackson.databind.JsonNode parts = content.get("parts");
                if (parts != null && parts.isArray() && parts.size() > 0) {
                    com.fasterxml.jackson.databind.JsonNode textNode = parts.get(0).get("text");
                    if (textNode != null) {
                        return textNode.asText();
                    }
                }
            }
        }
        
        log.error("Could not extract text from Gemini response: {}", jsonResponse);
        return getErrorResponseJson();
    }
    
    private String escapeJsonString(String input) {
        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private SymptomCheckResponse parseGeminiResponse(String jsonResponse, SymptomCheckRequest request) {
        try {
            // Clean up response if needed (remove markdown code blocks if present)
            String cleanedResponse = jsonResponse
                .replaceFirst("^```json\\s*", "")
                .replaceFirst("^```\\s*", "")
                .replaceAll("\\s*```$", "");
            
            SymptomCheckResponse response = objectMapper.readValue(cleanedResponse, SymptomCheckResponse.class);
            response.setAnalysisTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            response.setDisclaimer("This is a preliminary AI-based analysis and should NOT be used as a substitute for professional medical advice. Always consult with a qualified healthcare provider for accurate diagnosis and treatment.");
            return response;
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage(), e);
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

    private SymptomCheckResponse generateMockResponse(SymptomCheckRequest request) {
        log.info("Generating mock response for symptoms: {}", request.getSymptoms());
        
        // Simple mock JSON response
        String mockJson = """
        {
          "conditions": [
            {
              "name": "Common Cold",
              "probability": 75,
              "description": "A viral infection affecting the upper respiratory system",
              "characteristics": ["nasal congestion", "cough", "sore throat", "mild fever"],
              "severity": "mild"
            },
            {
              "name": "Influenza (Flu)",
              "probability": 60,
              "description": "A contagious respiratory illness caused by influenza virus",
              "characteristics": ["high fever", "body aches", "fatigue", "cough"],
              "severity": "moderate"
            }
          ],
          "recommendedSpecialties": ["General Practitioner", "Pulmonologist"],
          "warnings": ["Monitor your symptoms", "Seek care if symptoms worsen"],
          "nextSteps": "Rest, stay hydrated, and monitor your symptoms. If symptoms persist, consult a healthcare provider.",
          "confidence": "medium"
        }
        """;
        
        try {
            SymptomCheckResponse response = objectMapper.readValue(mockJson, SymptomCheckResponse.class);
            response.setAnalysisTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            response.setDisclaimer("This is a preliminary mock-based analysis. For accurate medical advice, please consult with a qualified healthcare provider.");
            return response;
        } catch (Exception e) {
            log.error("Error generating mock response: {}", e.getMessage());
            return getErrorResponse();
        }
    }

    private String getErrorResponseJson() {
        return """
        {
          "conditions": [],
          "recommendedSpecialties": [],
          "warnings": ["Unable to analyze symptoms. Please try again later."],
          "nextSteps": "Please consult with a healthcare provider.",
          "confidence": "low"
        }
        """;
    }

}
