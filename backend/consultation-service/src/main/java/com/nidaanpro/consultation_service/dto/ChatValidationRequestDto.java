package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ChatValidationRequestDto(
        @NotNull UUID userId1,
        @NotNull UUID userId2
) {}