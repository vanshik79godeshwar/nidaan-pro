package com.nidaanpro.notification_service.dto.events;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

public record EmergencyRequestAcceptedEvent(
        UUID acceptedRequestId,
        List<UUID> allNotifiedDoctorIds
) implements Serializable {}