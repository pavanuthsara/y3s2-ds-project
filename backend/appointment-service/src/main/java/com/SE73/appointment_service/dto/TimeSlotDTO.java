package com.se73.appointment_service.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record TimeSlotDTO (
        Long id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean active
){
}
