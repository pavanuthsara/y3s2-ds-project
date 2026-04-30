package com.SE73.appointment_service.controller;

import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;
import com.SE73.appointment_service.exception.GlobalExceptionHandler;
import com.SE73.appointment_service.exception.SlotAlreadyBookedException;
import com.SE73.appointment_service.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @Test
    void createAppointment_returnsCreated() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.createAppointment(any(AppointmentRequest.class))).thenReturn(response);

        AppointmentRequest request = new AppointmentRequest(
                "patient-1",
                "dr.house",
                response.getSlotId(),
                response.getAppointmentDateTime(),
                "VIRTUAL",
                null,
                "initial notes"
        );

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.appointmentId").value(response.getAppointmentId().toString()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createAppointment_validationFailureReturnsBadRequest() throws Exception {
        AppointmentRequest request = new AppointmentRequest();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Patient ID is required")));
    }

    @Test
    void getAppointmentById_returnsOk() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.getAppointmentById(response.getAppointmentId())).thenReturn(response);

        mockMvc.perform(get("/api/appointments/{appointmentId}", response.getAppointmentId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorUsername").value("dr.house"));
    }

    @Test
    void getAppointmentsByPatientId_returnsOk() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.getAppointmentsByPatientId("patient-1")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments/patient/{patientId}", "patient-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].patientId").value("patient-1"));
    }

    @Test
    void getAppointmentsByDoctorUsername_returnsOk() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.getAppointmentsByDoctorUsername("dr.house")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments/doctor/{doctorUsername}", "dr.house"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].doctorUsername").value("dr.house"));
    }

    @Test
    void getAllAppointments_returnsOk() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.getAllAppointments()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].appointmentId").value(response.getAppointmentId().toString()));
    }

    @Test
    void updateAppointmentStatus_returnsOk() throws Exception {
        AppointmentResponse response = buildResponse();
        when(appointmentService.updateAppointmentStatus(any(), any(AppointmentStatusUpdateRequest.class))).thenReturn(response);

        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest("confirmed", "done");

        mockMvc.perform(put("/api/appointments/{appointmentId}/status", response.getAppointmentId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void deleteAppointment_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/appointments/{appointmentId}", UUID.randomUUID()))
                .andExpect(status().isNoContent());
    }

    @Test
    void createAppointment_mapsServiceExceptionToConflict() throws Exception {
        when(appointmentService.createAppointment(any(AppointmentRequest.class)))
                .thenThrow(new SlotAlreadyBookedException("Slot already booked"));

        AppointmentRequest request = new AppointmentRequest(
                "patient-1",
                "dr.house",
                UUID.randomUUID(),
                LocalDateTime.of(2026, 4, 19, 10, 30),
                "VIRTUAL",
                null,
                null
        );

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Slot already booked"));
    }

    private AppointmentResponse buildResponse() {
        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentId(UUID.randomUUID());
        response.setPatientId("patient-1");
        response.setDoctorUsername("dr.house");
        response.setSlotId(UUID.randomUUID());
        response.setAppointmentDateTime(LocalDateTime.of(2026, 4, 19, 10, 30));
        response.setAppointmentMode("VIRTUAL");
        response.setHospital("City Hospital");
        response.setStatus("PENDING");
        response.setPrice(new BigDecimal("99.99"));
        response.setPaymentStatus("PENDING");
        response.setNotes("initial notes");
        response.setCreatedAt(LocalDateTime.of(2026, 4, 19, 10, 30));
        response.setUpdatedAt(LocalDateTime.of(2026, 4, 19, 10, 30));
        return response;
    }
}