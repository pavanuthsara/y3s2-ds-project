package com.se73.ai_symptom_checker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SymptomCheckResponse {
    
    private List<HealthCondition> conditions;
    private List<String> recommendedSpecialties;
    private List<String> warnings;
    private String nextSteps;
    private String analysisTimestamp;
    private String disclaimer;
    private String confidence;
    
}
