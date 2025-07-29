package com.nidaanpro.user_profile_service.dto;

import java.util.UUID;

// This record holds the basic details we need for appointments and chat lists.
public record UserDetailDto(
        UUID id,
        String fullName,
        String email
) {}