package com.se73.auth_service.availability;

import java.time.DayOfWeek;
import java.time.LocalTime;

public class AvailabilitySlotResponse {

    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;

    public AvailabilitySlotResponse(Long id, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, boolean active) {
        this.id = id;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.active = active;
    }

    public Long getId() {
        return id;
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

    public boolean isActive() {
        return active;
    }
}
