package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.NotBlank;

public record DynamicQuestionsRequestDto(
        @NotBlank String chiefComplaint,
        String symptomDuration,
        int symptomSeverity
) {}