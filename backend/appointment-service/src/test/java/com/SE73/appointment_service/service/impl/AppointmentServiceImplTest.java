package com.SE73.appointment_service.service.impl;

import com.SE73.appointment_service.client.DoctorClient;
import com.SE73.appointment_service.dto.AppointmentRequest;
import com.SE73.appointment_service.dto.AppointmentResponse;
import com.SE73.appointment_service.dto.AppointmentStatusUpdateRequest;
import com.SE73.appointment_service.enums.AppointmentMode;
import com.SE73.appointment_service.enums.AppointmentStatus;
import com.SE73.appointment_service.exception.AppointmentNotFoundException;
import com.SE73.appointment_service.exception.InvalidAppointmentStatusException;
import com.SE73.appointment_service.exception.SlotAlreadyBookedException;
import com.SE73.appointment_service.model.Appointment;
import com.SE73.appointment_service.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorClient doctorClient;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private UUID appointmentId;
    private UUID slotId;
    private LocalDateTime appointmentDateTime;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        slotId = UUID.randomUUID();
        appointmentDateTime = LocalDateTime.of(2026, 4, 19, 10, 30);
    }

    @Test
    void createAppointment_persistsAndMapsResponse() {
        AppointmentRequest request = new AppointmentRequest(
                "patient-1",
                "dr.house",
                slotId,
                appointmentDateTime,
                "VIRTUAL",
                null,
                "initial notes"
        );

        when(appointmentRepository.existsBySlotIdAndStatusNot(slotId, AppointmentStatus.CANCELLED)).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appointment = invocation.getArgument(0);
            appointment.setAppointmentId(appointmentId);
            appointment.setPrice(new BigDecimal("120.50"));
            appointment.setCreatedAt(appointmentDateTime);
            appointment.setUpdatedAt(appointmentDateTime);
            return appointment;
        });

        AppointmentResponse response = appointmentService.createAppointment(request);

        assertEquals(appointmentId, response.getAppointmentId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("dr.house", response.getDoctorUsername());
        assertEquals(slotId, response.getSlotId());
        assertEquals("VIRTUAL", response.getAppointmentMode());
        assertEquals("PENDING", response.getStatus());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("initial notes", response.getNotes());
        verify(appointmentRepository).save(argThat(appointment ->
                "patient-1".equals(appointment.getPatientId())
                        && "dr.house".equals(appointment.getDoctorUsername())
                        && slotId.equals(appointment.getSlotId())
                        && AppointmentMode.VIRTUAL.equals(appointment.getAppointmentMode())
        ));
    }

    @Test
    void createAppointment_throwsWhenSlotAlreadyBooked() {
        AppointmentRequest request = new AppointmentRequest(
                "patient-1",
                "dr.house",
                slotId,
                appointmentDateTime,
                "PHYSICAL",
                "City Hospital",
                null
        );

        when(appointmentRepository.existsBySlotIdAndStatusNot(slotId, AppointmentStatus.CANCELLED)).thenReturn(true);

        assertThrows(SlotAlreadyBookedException.class, () -> appointmentService.createAppointment(request));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void createAppointment_throwsWhenModeInvalid() {
        AppointmentRequest request = new AppointmentRequest(
                "patient-1",
                "dr.house",
                slotId,
                appointmentDateTime,
                "REMOTE",
                null,
                null
        );

        when(appointmentRepository.existsBySlotIdAndStatusNot(slotId, AppointmentStatus.CANCELLED)).thenReturn(false);

        assertThrows(InvalidAppointmentStatusException.class, () -> appointmentService.createAppointment(request));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void getAppointmentById_returnsMappedResponse() {
        Appointment appointment = buildAppointment();
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);

        assertEquals(appointmentId, response.getAppointmentId());
        assertEquals("patient-1", response.getPatientId());
        assertEquals("dr.house", response.getDoctorUsername());
    }

    @Test
    void getAppointmentById_throwsWhenMissing() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        assertThrows(AppointmentNotFoundException.class, () -> appointmentService.getAppointmentById(appointmentId));
    }

    @Test
    void getAppointmentsByPatientId_mapsList() {
        when(appointmentRepository.findByPatientId("patient-1")).thenReturn(List.of(buildAppointment()));

        List<AppointmentResponse> responses = appointmentService.getAppointmentsByPatientId("patient-1");

        assertEquals(1, responses.size());
        assertEquals(slotId, responses.get(0).getSlotId());
    }

    @Test
    void getAppointmentsByDoctorUsername_mapsList() {
        when(appointmentRepository.findByDoctorUsername("dr.house")).thenReturn(List.of(buildAppointment()));

        List<AppointmentResponse> responses = appointmentService.getAppointmentsByDoctorUsername("dr.house");

        assertEquals(1, responses.size());
        assertEquals("dr.house", responses.get(0).getDoctorUsername());
    }

    @Test
    void getAllAppointments_mapsList() {
        when(appointmentRepository.findAll()).thenReturn(List.of(buildAppointment()));

        List<AppointmentResponse> responses = appointmentService.getAllAppointments();

        assertEquals(1, responses.size());
        assertEquals("patient-1", responses.get(0).getPatientId());
    }

    @Test
    void updateAppointmentStatus_updatesNotesAndNotifiesWhenCancelled() {
        Appointment appointment = buildAppointment();
        appointment.setStatus(AppointmentStatus.PENDING);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest("cancelled", "follow-up note");

        AppointmentResponse response = appointmentService.updateAppointmentStatus(appointmentId, request);

        assertEquals("CANCELLED", response.getStatus());
        assertEquals("follow-up note", response.getNotes());
        verify(doctorClient).updateSlotStatus(slotId, true);
    }

    @Test
    void updateAppointmentStatus_skipsBlankNotesAndDoesNotNotifyWhenConfirmed() {
        Appointment appointment = buildAppointment();
        appointment.setNotes("original note");
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest("confirmed", "   ");

        AppointmentResponse response = appointmentService.updateAppointmentStatus(appointmentId, request);

        assertEquals("CONFIRMED", response.getStatus());
        assertEquals("original note", response.getNotes());
        verify(doctorClient, never()).updateSlotStatus(any(), anyBoolean());
    }

    @Test
    void updateAppointmentStatus_throwsWhenStatusInvalid() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(buildAppointment()));

        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest("reopened", null);

        assertThrows(InvalidAppointmentStatusException.class,
                () -> appointmentService.updateAppointmentStatus(appointmentId, request));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void cancelAppointment_setsCancelledAndNotifiesDoctorService() {
        Appointment appointment = buildAppointment();
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentResponse response = appointmentService.cancelAppointment(appointmentId);

        assertEquals("CANCELLED", response.getStatus());
        verify(doctorClient).updateSlotStatus(slotId, true);
    }

    private Appointment buildAppointment() {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(appointmentId);
        appointment.setPatientId("patient-1");
        appointment.setDoctorUsername("dr.house");
        appointment.setSlotId(slotId);
        appointment.setAppointmentDateTime(appointmentDateTime);
        appointment.setAppointmentMode(AppointmentMode.VIRTUAL);
        appointment.setHospital("City Hospital");
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setPrice(new BigDecimal("99.99"));
        appointment.setNotes("original note");
        appointment.setCreatedAt(appointmentDateTime);
        appointment.setUpdatedAt(appointmentDateTime);
        return appointment;
    }
}