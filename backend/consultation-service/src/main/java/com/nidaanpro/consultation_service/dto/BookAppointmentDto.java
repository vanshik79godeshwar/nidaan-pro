package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record BookAppointmentDto(
        @NotNull UUID patientId,
        @NotNull UUID doctorId,
        @NotNull @Future Instant appointmentTime
) {}