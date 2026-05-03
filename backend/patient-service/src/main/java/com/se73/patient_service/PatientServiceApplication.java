package com.se73.patient_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PatientServiceApplication {

    public static void main(String[] args) {
        // Bootstraps the patient-service Spring application context.
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
