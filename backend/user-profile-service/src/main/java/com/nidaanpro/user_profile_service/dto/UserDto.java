package com.nidaanpro.user_profile_service.dto;

import java.util.UUID;

public record UserDto(UUID id, String fullName, String email) {}