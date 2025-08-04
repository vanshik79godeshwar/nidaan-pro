package com.nidaanpro.notification_service.dto.events;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public record AppointmentConfirmationEvent(
        UUID appointmentId,
        UUID patientId,
        UUID doctorId,
        String patientName,
        String patientEmail,
        String doctorName,
        Instant appointmentTime
) implements Serializable {}