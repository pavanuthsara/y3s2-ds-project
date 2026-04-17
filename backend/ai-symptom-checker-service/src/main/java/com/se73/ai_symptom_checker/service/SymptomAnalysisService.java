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
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

@Slf4j
@Service
public class SymptomAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model}")
    private String geminiModel;

    @Value("${symptom.mock.enabled:true}")
    private boolean mockEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1/models/%s:generateContent";

    public SymptomCheckResponse analyzeSymptoms(SymptomCheckRequest request) {
        log.info("Analyzing symptoms: {}", request.getSymptoms());

        try {
            if (shouldUseMockResponse()) {
                log.warn("Using mock symptom analysis response (mockEnabled={}, apiKeyConfigured={})", mockEnabled, isApiKeyConfigured());
                return buildMockResponse(request);
            }

            String prompt = buildAnalysisPrompt(request);
            String geminiResponse = callGeminiAPI(prompt);

            if (geminiResponse == null || geminiResponse.isBlank()) {
                log.warn("Gemini response was empty, falling back to mock symptom analysis");
                return buildMockResponse(request);
            }

            return parseGeminiResponse(geminiResponse, request);
        } catch (Exception e) {
            log.error("Error analyzing symptoms", e);
            return buildMockResponse(request);
        }
    }

    private boolean shouldUseMockResponse() {
        return mockEnabled || !isApiKeyConfigured();
    }

    private boolean isApiKeyConfigured() {
        return geminiApiKey != null
                && !geminiApiKey.isBlank()
                && !geminiApiKey.contains("your-gemini-api-key-here");
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
            String endpoint = String.format(GEMINI_API_URL_TEMPLATE, geminiModel);
            URL url = new URL(endpoint + "?key=" + geminiApiKey);
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
                return null;
            }
            
            // Extract text from Gemini response
            return extractTextFromGeminiResponse(response);
            
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            return null;
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
        return null;
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
            return buildMockResponse(request);
        }
    }

    private SymptomCheckResponse buildMockResponse(SymptomCheckRequest request) {
        String combinedSymptoms = String.join(" ", request.getSymptoms()).toLowerCase(Locale.ROOT);
        List<HealthCondition> conditions;
        List<String> specialties;
        List<String> warnings;
        String nextSteps;

        if (containsAny(combinedSymptoms, "fever", "cough", "sore throat", "runny nose")) {
            conditions = Arrays.asList(
                    new HealthCondition("Viral Upper Respiratory Infection", 78, "Common viral illness affecting nose and throat", Arrays.asList("fever", "cough", "sore throat"), "mild"),
                    new HealthCondition("Influenza-like Illness", 62, "May cause fever, body aches, and fatigue", Arrays.asList("fever", "fatigue", "body pain"), "moderate"),
                    new HealthCondition("Seasonal Allergy with Infection", 35, "Allergy symptoms with possible secondary irritation", Arrays.asList("runny nose", "sneezing", "mild cough"), "mild")
            );
            specialties = Arrays.asList("General Physician", "Pulmonologist");
            warnings = Arrays.asList("Seek urgent care if breathing difficulty develops", "High fever above 103F requires immediate medical attention");
            nextSteps = "Hydrate well, rest, monitor fever every 6-8 hours, and consult a doctor if symptoms worsen after 48 hours.";
        } else if (containsAny(combinedSymptoms, "headache", "dizziness", "migraine")) {
            conditions = Arrays.asList(
                    new HealthCondition("Tension Headache", 71, "Often linked with stress, posture, or poor sleep", Arrays.asList("headache", "neck tightness"), "mild"),
                    new HealthCondition("Migraine Episode", 55, "Recurring headache often with light sensitivity", Arrays.asList("headache", "nausea", "light sensitivity"), "moderate"),
                    new HealthCondition("Dehydration-related Headache", 42, "Low fluid intake can trigger dizziness and headache", Arrays.asList("dizziness", "dry mouth", "fatigue"), "mild")
            );
            specialties = Arrays.asList("General Physician", "Neurologist");
            warnings = Arrays.asList("Sudden severe headache needs emergency assessment", "Seek care if weakness, speech issues, or vision changes occur");
            nextSteps = "Increase hydration, rest in a dark environment, and book a doctor consultation if headaches persist or recur frequently.";
        } else {
            conditions = Arrays.asList(
                    new HealthCondition("General Viral Syndrome", 58, "A non-specific viral condition with self-limited symptoms", request.getSymptoms(), "mild"),
                    new HealthCondition("Stress-related Somatic Symptoms", 41, "Physical symptoms that may worsen during stress", Arrays.asList("fatigue", "sleep disturbance", "body discomfort"), "mild"),
                    new HealthCondition("Early Inflammatory Condition", 33, "May need clinical examination and basic lab tests", request.getSymptoms(), "moderate")
            );
            specialties = Arrays.asList("General Physician");
            warnings = Arrays.asList("Visit emergency care for chest pain, breathing difficulty, or confusion", "Persistent symptoms beyond one week require clinical review");
            nextSteps = "Track symptoms for 24-48 hours and consult a doctor for proper diagnosis and treatment planning.";
        }

        SymptomCheckResponse response = new SymptomCheckResponse();
        response.setConditions(conditions);
        response.setRecommendedSpecialties(specialties);
        response.setWarnings(warnings);
        response.setNextSteps(nextSteps);
        response.setConfidence("medium");
        response.setAnalysisTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.setDisclaimer("Demo mock response: This is preliminary guidance only and not a diagnosis. Please consult a qualified healthcare professional.");
        return response;
    }

    private boolean containsAny(String source, String... keywords) {
        for (String keyword : keywords) {
            if (source.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

}
