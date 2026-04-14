package com.se73.doctor_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class SetDoctorAvailabilityRequest {
	@NotEmpty
	@Valid
	private List<AvailabilitySlotRequest> slots;

	public List<AvailabilitySlotRequest> getSlots() {
		return slots;
	}

	public void setSlots(List<AvailabilitySlotRequest> slots) {
		this.slots = slots;
	}
}