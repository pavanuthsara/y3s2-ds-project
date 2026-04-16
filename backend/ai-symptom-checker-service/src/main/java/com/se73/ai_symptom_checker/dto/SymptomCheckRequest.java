package com.se73.ai_symptom_checker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomCheckRequest {
    
    @NotEmpty(message = "Symptoms list cannot be empty")
    private List<String> symptoms;
    
    @NotNull(message = "Duration is required")
    private String duration;
    
    @NotNull(message = "Severity is required")
    private String severity;
    
    @NotNull(message = "Age group is required")
    private String ageGroup;
    
    private String additionalInfo;
    
}
