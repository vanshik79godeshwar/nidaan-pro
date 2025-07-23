package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record BookAppointmentDto(
        @NotNull UUID patientId,
        @NotNull UUID doctorId,
        @NotNull UUID slotId, // <-- ADD THIS
        @NotNull Instant appointmentTime // We still send the time for the appointment record
) {}