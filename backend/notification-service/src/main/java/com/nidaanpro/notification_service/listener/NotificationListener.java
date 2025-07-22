package com.nidaanpro.notification_service.listener;

import com.nidaanpro.notification_service.config.RabbitMQConfig;
import com.nidaanpro.notification_service.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private final EmailService emailService;

    public NotificationListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handleUserRegistration(String message) {
        String[] parts = message.split(":");
        String email = parts[0];
        String otp = parts[1];

        String subject = "Your Nidaan Pro Registration Code";
        String body = "Hello,\n\nThank you for registering with Nidaan Pro.\n\nYour OTP is: " + otp + "\n\nThis code will expire in 10 minutes.";
        emailService.sendEmail(email, subject, body);
    }

    @RabbitListener(queues = RabbitMQConfig.PW_RESET_QUEUE_NAME)
    public void handlePasswordReset(String message) {
        String[] parts = message.split(":");
        String email = parts[0];
        String token = parts[1];

        String subject = "Your Nidaan Pro Password Reset Link";
        String body = "Hello,\n\nYou requested a password reset. Click the link below:\n\nhttp://localhost:3000/reset-password?token=" + token + "\n\nThis link will expire in 1 hour.";
        emailService.sendEmail(email, subject, body);
    }

    @RabbitListener(queues = "appointment-booking-queue") // Use the new queue name
    public void handleAppointmentBooking(String appointmentId) {
        System.out.println("======================================================");
        System.out.println("Received new appointment booking event!");
        System.out.println("Sending confirmation email for appointment ID: " + appointmentId);
        System.out.println("======================================================");
        // Here you would call the EmailService to send the confirmation
    }
}