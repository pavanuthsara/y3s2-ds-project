package com.se73.patient_service.dto;

import com.se73.patient_service.model.PatientProfile;

import java.time.LocalDate;

public class PatientProfileResponse {
    private final Long id;
    private final String username;
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final String address;
    private final LocalDate dateOfBirth;

    public PatientProfileResponse(PatientProfile patientProfile) {
        this.id = patientProfile.getId();
        this.username = patientProfile.getUsername();
        this.firstName = patientProfile.getFirstName();
        this.lastName = patientProfile.getLastName();
        this.phone = patientProfile.getPhone();
        this.address = patientProfile.getAddress();
        this.dateOfBirth = patientProfile.getDateOfBirth();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
}
