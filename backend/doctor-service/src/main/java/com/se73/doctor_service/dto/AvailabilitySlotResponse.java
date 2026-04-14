package com.se73.doctor_service.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public class AvailabilitySlotResponse {
	private final UUID id;
	private final DayOfWeek dayOfWeek;
	private final LocalTime startTime;
	private final LocalTime endTime;
	private final boolean active;

	public AvailabilitySlotResponse(UUID id, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, boolean active) {
		this.id = id;
		this.dayOfWeek = dayOfWeek;
		this.startTime = startTime;
		this.endTime = endTime;
		this.active = active;
	}

	public UUID getId() {
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