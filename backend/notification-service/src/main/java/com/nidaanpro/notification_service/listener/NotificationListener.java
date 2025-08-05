// backend/notification-service/src/main/java/com/nidaanpro/notification_service/listener/NotificationListener.java
package com.nidaanpro.notification_service.listener;

import com.nidaanpro.notification_service.config.RabbitMQConfig;
import com.nidaanpro.notification_service.dto.events.AppointmentConfirmationEvent;
import com.nidaanpro.notification_service.dto.events.EmergencyRequestAcceptedEvent;
import com.nidaanpro.notification_service.dto.events.EmergencyRequestEvent;
import com.nidaanpro.notification_service.service.EmailService;
import com.nidaanpro.notification_service.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class NotificationListener {
    private final EmailService emailService;
    private final NotificationService notificationService;

    public NotificationListener(EmailService emailService, NotificationService notificationService) {
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // ... (handleUserRegistration, handlePasswordReset, handleAppointmentBooking methods are unchanged)
    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handleUserRegistration(String message) {
        String[] parts = message.split(":");
        String email = parts[0];
        String otp = parts[1];
        emailService.sendRegistrationOtp(email, otp);
    }

    @RabbitListener(queues = RabbitMQConfig.PW_RESET_QUEUE_NAME)
    public void handlePasswordReset(String message) {
        String[] parts = message.split(":");
        String email = parts[0];
        String token = parts[1];
        emailService.sendPasswordReset(email, token);
    }

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_QUEUE_NAME)
    public void handleAppointmentBooking(AppointmentConfirmationEvent event) {
        // 1. Send the styled email
        emailService.sendAppointmentConfirmation(
                event.patientEmail(),
                event.patientName(),
                event.doctorName(),
                event.appointmentTime()
        );

        // 2. Create and send the in-app notification
        String patientMessage = "Your appointment with Dr. " + event.doctorName() + " is confirmed.";
        String patientLink = "/dashboard/appointments";
        notificationService.createAndSendNotification(event.patientId(), patientMessage, patientLink);

        // 3. Create and send in-app notification to the DOCTOR
        String doctorMessage = "New appointment booked by " + event.patientName() + ".";
        String doctorLink = "/dashboard/appointments";
        notificationService.createAndSendNotification(event.doctorId(), doctorMessage, doctorLink);
    }

    // --- THIS IS THE FIX ---
    // This listener now only listens to the queue for NEW requests
    @RabbitListener(queues = RabbitMQConfig.EMERGENCY_NEW_QUEUE_NAME)
    public void handleEmergencyRequest(EmergencyRequestEvent event) {
        System.out.println("Received emergency request from " + event.patientName() + ". Notifying " + event.availableDoctorIds().size() + " doctors.");

        String message = event.patientName() + " needs an urgent consultation!";
        String link = "/dashboard/emergency";

        for (UUID doctorId : event.availableDoctorIds()) {
            notificationService.createAndSendNotification(doctorId, message, link);
        }
    }

    // --- THIS IS THE FIX ---
    // This listener now only listens to the queue for ACCEPTED requests
    @RabbitListener(queues = RabbitMQConfig.EMERGENCY_ACCEPTED_QUEUE_NAME)
    public void handleEmergencyRequestAccepted(EmergencyRequestAcceptedEvent event) {
        System.out.println("Emergency request " + event.acceptedRequestId() + " was accepted. Notifying other doctors to remove it.");

        for (UUID doctorId : event.allNotifiedDoctorIds()) {
            notificationService.sendSystemUpdate(doctorId, "REQUEST_ACCEPTED", event.acceptedRequestId().toString());
        }
    }
}