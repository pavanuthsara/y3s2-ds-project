package com.se73.appointment_service.model;

import com.se73.appointment_service.enums.AppointmentMode;
import com.se73.appointment_service.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;   // ← just store the ID
    private Long doctorId;    // ← just store the ID
    private Long slotId;

    private LocalDateTime appointmentTime;
    private Double price;

    @Enumerated(EnumType.STRING)
    private AppointmentMode appointmentMode;

    private String hospital;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
}
