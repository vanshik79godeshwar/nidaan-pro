package com.nidaanpro.consultationservice.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitNotesDto(
        @NotBlank String diagnosis,
        String doctorNotes,
        String prescription
) {}