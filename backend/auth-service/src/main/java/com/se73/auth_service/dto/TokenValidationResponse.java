package com.se73.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
    private String username;
}
