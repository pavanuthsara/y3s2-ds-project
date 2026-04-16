package com.se73.ai_symptom_checker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCondition {
    
    private String name;
    private int probability;
    private String description;
    private List<String> characteristics;
    private String severity;
    
}
