package com.nidaanpro.consultationservice.dto;

import java.util.UUID;

// This DTO defines the shape of user data received from the auth-service.
// It must match the UserDto in auth-service.
public record UserDetailDto(
        UUID id,
        String fullName,
        String email
) {}