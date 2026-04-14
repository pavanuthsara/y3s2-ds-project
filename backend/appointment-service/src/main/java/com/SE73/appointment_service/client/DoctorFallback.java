package com.se73.appointment_service.client;

import com.se73.appointment_service.dto.DoctorDTO;
import com.se73.appointment_service.dto.TimeSlotDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
class DoctorFallback implements DoctorClient {
    @Override
    public DoctorDTO getDoctor(Long id) {
        return new DoctorDTO(id, "Dr. Mock", "General Medicine", 50.0);
    }
    @Override
    public TimeSlotDTO getSlot(Long id, Long slotId) {
        return new TimeSlotDTO(slotId, LocalDateTime.now().plusDays(1));
    }
}
