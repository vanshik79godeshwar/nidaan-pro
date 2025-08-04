package com.nidaanpro.consultationservice.dto.events;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

// This object will be sent to RabbitMQ when a new emergency request is made.
public record EmergencyRequestEvent(
        UUID emergencyRequestId,
        String patientName,
        Integer specialityId,
        List<UUID> availableDoctorIds // A list of all doctors to be notified
) implements Serializable {}