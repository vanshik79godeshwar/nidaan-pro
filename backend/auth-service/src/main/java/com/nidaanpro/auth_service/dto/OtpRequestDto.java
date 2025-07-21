package com.nidaanpro.auth_service.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public record OtpRequestDto(@NotBlank @Email String email) {}