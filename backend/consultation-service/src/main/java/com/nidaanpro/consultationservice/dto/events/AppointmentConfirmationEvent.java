package com.nidaanpro.consultationservice.dto.events;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

// A dedicated, serializable object for our RabbitMQ event
public record AppointmentConfirmationEvent(
        UUID appointmentId,
        UUID patientId,
        UUID doctorId,
        String patientName,
        String patientEmail,
        String doctorName,
        Instant appointmentTime
) implements Serializable {}