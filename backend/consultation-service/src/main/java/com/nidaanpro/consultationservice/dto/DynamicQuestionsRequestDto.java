package com.nidaanpro.consultationservice.dto;

import jakarta.validation.constraints.NotBlank;

public record DynamicQuestionsRequestDto(
        @NotBlank String chiefComplaint,
        String symptomDuration,
        int symptomSeverity
) {}