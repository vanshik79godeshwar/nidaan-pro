package com.nidaanpro.user_profile_service.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record SubmitReviewDto(
        @NotNull UUID appointmentId,
        @NotNull UUID doctorId,
        @NotNull @Min(1) @Max(5) Integer rating,
        String comment
) {}