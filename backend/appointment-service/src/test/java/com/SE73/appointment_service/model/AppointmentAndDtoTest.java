package com.SE73.appointment_service.model;

import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;
import com.SE73.appointment_service.dto.ErrorResponse;
import com.SE73.appointment_service.enums.AppointmentMode;
import com.SE73.appointment_service.enums.AppointmentStatus;
import com.SE73.appointment_service.enums.PaymentStatus;
import com.SE73.appointment_service.exception.AppointmentNotFoundException;
import com.SE73.appointment_service.exception.InvalidAppointmentStatusException;
import com.SE73.appointment_service.exception.ServiceUnavailableException;
import com.SE73.appointment_service.exception.SlotAlreadyBookedException;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AppointmentAndDtoTest {

    @Test
    void appointmentEntitySupportsLifecycleAndAccessors() throws Exception {
        Appointment appointment = new Appointment();
        UUID appointmentId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2026, 4, 19, 10, 30);

        appointment.setAppointmentId(appointmentId);
        appointment.setPatientId("patient-1");
        appointment.setDoctorUsername("dr.house");
        appointment.setSlotId(slotId);
        appointment.setAppointmentDateTime(now);
        appointment.setAppointmentMode(AppointmentMode.PHYSICAL);
        appointment.setHospital("City Hospital");
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPrice(new BigDecimal("123.45"));
        appointment.setPaymentStatus(PaymentStatus.PAID);
        appointment.setNotes("notes");

        assertEquals(appointmentId, appointment.getAppointmentId());
        assertEquals("patient-1", appointment.getPatientId());
        assertEquals("dr.house", appointment.getDoctorUsername());
        assertEquals(slotId, appointment.getSlotId());
        assertEquals(now, appointment.getAppointmentDateTime());
        assertEquals(AppointmentMode.PHYSICAL, appointment.getAppointmentMode());
        assertEquals("City Hospital", appointment.getHospital());
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getStatus());
        assertEquals(new BigDecimal("123.45"), appointment.getPrice());
        assertEquals(PaymentStatus.PAID, appointment.getPaymentStatus());
        assertEquals("notes", appointment.getNotes());

        Method onCreate = Appointment.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(appointment);
        assertNotNull(appointment.getCreatedAt());
        assertNotNull(appointment.getUpdatedAt());

        LocalDateTime beforeUpdate = appointment.getUpdatedAt();
        Method onUpdate = Appointment.class.getDeclaredMethod("onUpdate");
        onUpdate.setAccessible(true);
        onUpdate.invoke(appointment);
        assertTrue(appointment.getUpdatedAt().isEqual(beforeUpdate) || appointment.getUpdatedAt().isAfter(beforeUpdate));
    }

    @Test
    void appointmentRequestSupportsAccessors() {
        UUID slotId = UUID.randomUUID();
        LocalDateTime appointmentDateTime = LocalDateTime.of(2026, 4, 19, 10, 30);

        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId("patient-1");
        request.setDoctorUsername("dr.house");
        request.setSlotId(slotId);
        request.setAppointmentDateTime(appointmentDateTime);
        request.setAppointmentMode("virtual");
        request.setHospital("City Hospital");
        request.setNotes("hello");

        assertEquals("patient-1", request.getPatientId());
        assertEquals("dr.house", request.getDoctorUsername());
        assertEquals(slotId, request.getSlotId());
        assertEquals(appointmentDateTime, request.getAppointmentDateTime());
        assertEquals("virtual", request.getAppointmentMode());
        assertEquals("City Hospital", request.getHospital());
        assertEquals("hello", request.getNotes());
    }

    @Test
    void appointmentResponseSupportsAccessors() {
        UUID appointmentId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        LocalDateTime appointmentDateTime = LocalDateTime.of(2026, 4, 19, 10, 30);

        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentId(appointmentId);
        response.setPatientId("patient-1");
        response.setDoctorUsername("dr.house");
        response.setSlotId(slotId);
        response.setAppointmentDateTime(appointmentDateTime);
        response.setAppointmentMode("VIRTUAL");
        response.setHospital("City Hospital");
        response.setStatus("CONFIRMED");
        response.setPrice(new BigDecimal("123.45"));
        response.setPaymentStatus("PAID");
        response.setNotes("hello");
        response.setCreatedAt(appointmentDateTime);
        response.setUpdatedAt(appointmentDateTime);

        assertEquals(appointmentId, response.getAppointmentId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("dr.house", response.getDoctorUsername());
        assertEquals(slotId, response.getSlotId());
        assertEquals(appointmentDateTime, response.getAppointmentDateTime());
        assertEquals("VIRTUAL", response.getAppointmentMode());
        assertEquals("City Hospital", response.getHospital());
        assertEquals("CONFIRMED", response.getStatus());
        assertEquals(new BigDecimal("123.45"), response.getPrice());
        assertEquals("PAID", response.getPaymentStatus());
        assertEquals("hello", response.getNotes());
        assertEquals(appointmentDateTime, response.getCreatedAt());
        assertEquals(appointmentDateTime, response.getUpdatedAt());
    }

    @Test
    void appointmentStatusUpdateRequestSupportsAccessors() {
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("cancelled");
        request.setNotes("follow-up");

        assertEquals("cancelled", request.getStatus());
        assertEquals("follow-up", request.getNotes());
    }

    @Test
    void errorResponseSupportsConstructorsAndAccessors() {
        ErrorResponse response = new ErrorResponse("message");
        assertEquals("message", response.getMessage());
        assertNotNull(response.getTimestamp());

        LocalDateTime timestamp = LocalDateTime.of(2026, 4, 19, 10, 30);
        response.setMessage("updated");
        response.setTimestamp(timestamp);

        assertEquals("updated", response.getMessage());
        assertEquals(timestamp, response.getTimestamp());
    }

    @Test
    void exceptionConstructorsPreserveMessages() {
        assertEquals("missing", new AppointmentNotFoundException("missing").getMessage());
        assertEquals("bad status", new InvalidAppointmentStatusException("bad status").getMessage());
        assertEquals("down", new ServiceUnavailableException("down").getMessage());
        assertEquals("slot taken", new SlotAlreadyBookedException("slot taken").getMessage());
    }
}