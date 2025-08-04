package com.nidaanpro.consultationservice.dto.events;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

// This event is fired when a doctor accepts a request.
public record EmergencyRequestAcceptedEvent(
        UUID acceptedRequestId,
        List<UUID> allNotifiedDoctorIds // The list of all doctors who need to be updated
) implements Serializable {}