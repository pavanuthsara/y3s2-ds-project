package com.se73.payment_service.repository;

import com.se73.payment_service.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByGatewayPaymentId(String gatewayPaymentId);

    Optional<PaymentTransaction> findByAppointmentId(UUID appointmentId);

    List<PaymentTransaction> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<PaymentTransaction> findByStatusOrderByCreatedAtDesc(PaymentTransaction.TransactionStatus status);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
}
