package com.nidaanpro.consultationservice.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RequestEmergencyDto(
        @NotNull UUID patientId,
        @NotNull Integer specialityId
) {}