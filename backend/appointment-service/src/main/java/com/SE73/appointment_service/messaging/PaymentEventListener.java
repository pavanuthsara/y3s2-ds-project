package com.SE73.appointment_service.messaging;

import com.SE73.appointment_service.config.RabbitMQConfig;
import com.SE73.appointment_service.dto.PaymentEventMessage;
import com.SE73.appointment_service.enums.PaymentStatus;
import com.SE73.appointment_service.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventListener {

    private static final Logger logger = LoggerFactory.getLogger(PaymentEventListener.class);
    
    private final AppointmentService appointmentService;

    public PaymentEventListener(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handlePaymentUpdate(PaymentEventMessage message) {
        logger.info("Received payment update for appointment '{}': status '{}'", 
                message.getAppointmentId(), message.getPaymentStatus());
                
        try {
            PaymentStatus status = PaymentStatus.valueOf(message.getPaymentStatus().toUpperCase());
            appointmentService.updatePaymentStatus(message.getAppointmentId(), status);
            logger.info("Successfully updated payment status for appointment '{}'", message.getAppointmentId());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid payment status received: '{}'", message.getPaymentStatus(), e);
        } catch (Exception e) {
            logger.error("Error updating payment status for appointment '{}'", message.getAppointmentId(), e);
        }
    }
}
