package com.se73.notification_service.repository;

import com.se73.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    List<Notification> findByRecipientEmail(String email);
    
    List<Notification> findByTransactionId(String transactionId);
    
    List<Notification> findByPatientId(String patientId);
    
    List<Notification> findByStatus(Notification.NotificationStatus status);
    
    List<Notification> findByChannel(Notification.Channel channel);
    
    List<Notification> findByType(Notification.NotificationType type);
    
    List<Notification> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Optional<Notification> findByIdAndRecipientEmail(UUID id, String email);
}
