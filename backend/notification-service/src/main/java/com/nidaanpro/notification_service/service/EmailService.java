package com.nidaanpro.notification_service.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    // IMPORTANT: Replace this with your new, verified SendGrid email address
    private final String FROM_ADDRESS = "nidaan.pro.contact@gmail.com";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS, "Nidaan Pro");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            System.out.println("HTML Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Error sending HTML email to " + to + ": " + e.getMessage());
        }
    }

    public void sendRegistrationOtp(String to, String otp) {
        String subject = "Your Nidaan Pro Registration Code";
        String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;'>"
                + "<h2 style='color: #0056b3;'>Welcome to Nidaan Pro!</h2>"
                + "<p>Your One-Time Password (OTP) to complete your registration is:</p>"
                + "<p style='font-size: 28px; font-weight: bold; color: #0056b3; background: #f0f5fa; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 4px;'>" + otp + "</p>"
                + "<p>This code is valid for 10 minutes.</p>"
                + "<p style='font-size: 12px; color: #888;'>If you did not request this, please disregard this email.</p>"
                + "</div>";
        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendPasswordReset(String to, String token) {
        String subject = "Reset Your Nidaan Pro Password";
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;'>"
                + "<h2 style='color: #0056b3;'>Password Reset Request</h2>"
                + "<p>We received a request to reset your password. Click the button below to set a new one:</p>"
                + "<a href='" + resetLink + "' style='display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>"
                + "<p>This link is valid for 1 hour.</p>"
                + "<p style='font-size: 12px; color: #888;'>If you did not request a password reset, please ignore this email.</p>"
                + "</div>";
        sendHtmlEmail(to, subject, htmlBody);
    }

    public void sendAppointmentConfirmation(String to, String patientName, String doctorName, Instant appointmentTime) {
        String subject = "Your Nidaan Pro Appointment is Confirmed!";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a").withZone(ZoneId.systemDefault());
        String formattedTime = formatter.format(appointmentTime);

        String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;'>"
                + "<h2 style='color: #28a745;'>Appointment Confirmed!</h2>"
                + "<p>Hello " + patientName + ",</p>"
                + "<p>Your appointment with <strong>Dr. " + doctorName + "</strong> has been successfully booked for:</p>"
                + "<p style='font-size: 18px; font-weight: bold; color: #333; background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center;'>" + formattedTime + "</p>"
                + "<p>You can view your appointment details in your dashboard. Please be ready to join the call a few minutes before the scheduled time.</p>"
                + "<p style='font-size: 12px; color: #888;'>Thank you for choosing Nidaan Pro.</p>"
                + "</div>";
        sendHtmlEmail(to, subject, htmlBody);
    }
}