package com.nidaanpro.consultationservice.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AcceptEmergencyDto(
        @NotNull UUID doctorId
) {}