package com.nidaanpro.auth_service.dto;

import java.util.UUID;

public record UserDto(
        UUID id,
        String fullName,
        String email
) {}