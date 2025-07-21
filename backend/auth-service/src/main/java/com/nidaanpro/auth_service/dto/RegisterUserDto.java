package com.nidaanpro.auth_service.dto;
import jakarta.validation.constraints.*;
public record RegisterUserDto(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @NotNull UserRole role
) {
    public enum UserRole { PATIENT, DOCTOR }
}