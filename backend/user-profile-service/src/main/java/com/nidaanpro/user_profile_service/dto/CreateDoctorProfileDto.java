package com.nidaanpro.user_profile_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateDoctorProfileDto(
        @NotNull UUID userId,
        @NotNull Integer specialityId,
        @NotBlank String medicalLicenseNumber,
        String bio,
        @NotNull @Min(0) Integer yearsOfExperience,
        @NotNull BigDecimal consultationFee,
        String profilePictureUrl,
        Boolean availableForEmergency
) {}
