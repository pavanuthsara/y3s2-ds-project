package com.se73.doctor_service.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public class DoctorAvailabilityResponse {
    private final UUID id;
    private final String doctorUsername;
    private final DayOfWeek dayOfWeek;
    private final LocalTime startTime;
    private final LocalTime endTime;

    public DoctorAvailabilityResponse(UUID id, String doctorUsername, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        this.id = id;
        this.doctorUsername = doctorUsername;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public UUID getId() {
        return id;
    }

    public String getDoctorUsername() {
        return doctorUsername;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }
}
