package com.nidaanpro.auth_service.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record PasswordResetTokenDto(@NotBlank String token, @NotBlank @Size(min = 8) String newPassword) {}