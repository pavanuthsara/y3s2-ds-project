package com.se73.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientContactInfo {
    private String patientId;
    private String email;
    private String phone;
    private String displayName;
}
