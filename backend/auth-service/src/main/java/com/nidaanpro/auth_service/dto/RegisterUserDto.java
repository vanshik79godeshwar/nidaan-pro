package com.nidaanpro.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserDto(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String role
) {}
