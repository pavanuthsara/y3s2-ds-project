package com.se73.appointment_service.controller;

import com.se73.appointment_service.dto.AppointmentRequest;
import com.se73.appointment_service.model.Appointment;
import com.se73.appointment_service.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<Appointment> book(@RequestBody AppointmentRequest req) {
        return ResponseEntity.ok(service.createAppointment(
                req.getPatientId(), req.getDoctorId(), req.getTimeSlotId()
        ));
    }
}
