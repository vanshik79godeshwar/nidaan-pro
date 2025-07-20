package com.nidaanpro.user_profile_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSpecialityDto(
        @NotBlank String name,
        String description
) {}
