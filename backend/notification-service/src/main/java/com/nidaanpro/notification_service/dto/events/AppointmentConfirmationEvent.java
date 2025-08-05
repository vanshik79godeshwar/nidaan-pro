// In: backend/consultation-service/src/main/java/com/nidaanpro/consultationservice/dto/events/AppointmentConfirmationEvent.java
// AND
// In: backend/notification-service/src/main/java/com/nidaanpro/notification_service/dto/events/AppointmentConfirmationEvent.java

package com.nidaanpro.notification_service.dto.events; // or com.nidaanpro.notification_service.dto.events

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
        Instant appointmentTime,
        String consultationType // <-- ADD THIS FIELD
) implements Serializable {}