package com.se73.auth_service.availability;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class SetDoctorAvailabilityRequest {

    @Valid
    @NotNull(message = "Slots list is required")
    private List<AvailabilitySlotRequest> slots;

    public List<AvailabilitySlotRequest> getSlots() {
        return slots;
    }

    public void setSlots(List<AvailabilitySlotRequest> slots) {
        this.slots = slots;
    }
}
