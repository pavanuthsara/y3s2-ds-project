package com.se73.appointment_service.client;

import com.se73.appointment_service.dto.DoctorDTO;
import com.se73.appointment_service.dto.TimeSlotDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "doctor-service", fallback = DoctorFallback.class)
public interface DoctorClient {
    @GetMapping("/doctors/{id}")
    DoctorDTO getDoctor(@PathVariable Long id);

    @GetMapping("/doctors/{id}/slots/{slotId}")
    TimeSlotDTO getSlot(@PathVariable Long id, @PathVariable Long slotId);
}