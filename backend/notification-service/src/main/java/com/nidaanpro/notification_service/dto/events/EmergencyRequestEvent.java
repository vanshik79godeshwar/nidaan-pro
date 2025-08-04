package com.nidaanpro.notification_service.dto.events;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

// This must exactly match the event DTO from the consultation-service
public record EmergencyRequestEvent(
        UUID emergencyRequestId,
        String patientName,
        Integer specialityId,
        List<UUID> availableDoctorIds
) implements Serializable {}