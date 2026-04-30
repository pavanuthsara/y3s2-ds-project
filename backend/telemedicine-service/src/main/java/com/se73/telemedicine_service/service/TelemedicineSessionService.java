package com.se73.telemedicine_service.service;

import com.se73.telemedicine_service.dto.SessionCreateRequest;
import com.se73.telemedicine_service.dto.SessionResponse;
import com.se73.telemedicine_service.dto.SessionTokenResponse;
import com.se73.telemedicine_service.exception.ApiException;
import com.se73.telemedicine_service.model.CompletionStatus;
import com.se73.telemedicine_service.model.SessionState;
import com.se73.telemedicine_service.model.TelemedicineSession;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TelemedicineSessionService {

    private final Map<UUID, TelemedicineSession> sessions = new ConcurrentHashMap<>();
    private final AppointmentClient appointmentClient;
    private final AgoraTokenService agoraTokenService;

    public TelemedicineSessionService(AppointmentClient appointmentClient, AgoraTokenService agoraTokenService) {
        this.appointmentClient = appointmentClient;
        this.agoraTokenService = agoraTokenService;
    }

    public SessionResponse createSession(SessionCreateRequest request) {
        appointmentClient.assertAppointmentConfirmed(request.getAppointmentId());

        UUID sessionId = UUID.randomUUID();
        String roomName = "consultation-" + request.getAppointmentId();

        TelemedicineSession session = TelemedicineSession.builder()
                .sessionId(sessionId)
                .appointmentId(request.getAppointmentId())
                .roomName(roomName)
                .state(SessionState.WAITING)
                .completionStatus(CompletionStatus.ONGOING)
                .createdAt(LocalDateTime.now())
                .build();

        sessions.put(sessionId, session);
        return toResponse(session);
    }

    public SessionTokenResponse getSessionToken(UUID sessionId) {
        TelemedicineSession session = getRequiredSession(sessionId);

        if (session.getState() == SessionState.COMPLETED) {
            throw new ApiException("Cannot issue token for completed session");
        }

        int ttl = agoraTokenService.getDefaultTtlSeconds();
        String token = agoraTokenService.generateSessionToken(session.getRoomName(), ttl);

        return SessionTokenResponse.builder()
                .sessionId(session.getSessionId())
                .roomName(session.getRoomName())
                .agoraAppId(agoraTokenService.getAgoraAppId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusSeconds(ttl))
                .build();
    }

    public SessionResponse startSession(UUID sessionId) {
        TelemedicineSession session = getRequiredSession(sessionId);

        if (session.getState() == SessionState.COMPLETED) {
            throw new ApiException("Completed session cannot be started");
        }

        if (session.getState() == SessionState.WAITING) {
            session.setState(SessionState.ACTIVE);
            session.setStartedAt(LocalDateTime.now());
        }

        return toResponse(session);
    }

    public SessionResponse endSession(UUID sessionId) {
        TelemedicineSession session = getRequiredSession(sessionId);

        if (session.getState() == SessionState.COMPLETED) {
            return toResponse(session);
        }

        session.setState(SessionState.COMPLETED);
        session.setEndedAt(LocalDateTime.now());

        if (session.getStartedAt() != null) {
            long duration = java.time.Duration.between(session.getStartedAt(), session.getEndedAt()).getSeconds();
            session.setDurationSeconds(Math.max(duration, 0));
            session.setCompletionStatus(CompletionStatus.COMPLETED_NORMALLY);
        } else {
            session.setDurationSeconds(0L);
            session.setCompletionStatus(CompletionStatus.ENDED_BEFORE_START);
        }

        return toResponse(session);
    }

    public SessionResponse getSessionStatus(UUID sessionId) {
        return toResponse(getRequiredSession(sessionId));
    }

    public SessionResponse getSessionByAppointment(UUID appointmentId) {
        return sessions.values().stream()
                .filter(s -> appointmentId.equals(s.getAppointmentId()))
                .findFirst()
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException("No telemedicine session found for appointment: " + appointmentId));
    }

    private TelemedicineSession getRequiredSession(UUID sessionId) {
        TelemedicineSession session = sessions.get(sessionId);
        if (session == null) {
            throw new ApiException("Session not found: " + sessionId);
        }
        return session;
    }

    private SessionResponse toResponse(TelemedicineSession session) {
        return SessionResponse.builder()
                .sessionId(session.getSessionId())
                .appointmentId(session.getAppointmentId())
                .roomName(session.getRoomName())
                .state(session.getState())
                .completionStatus(session.getCompletionStatus())
                .createdAt(session.getCreatedAt())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .durationSeconds(session.getDurationSeconds())
                .build();
    }
}
