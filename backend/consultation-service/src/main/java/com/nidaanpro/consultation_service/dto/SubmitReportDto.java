package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitReportDto(
        @NotNull UUID appointmentId,
        @NotBlank String problemBrief
        // We will add fields for dynamic Q&A and file uploads later
) {}