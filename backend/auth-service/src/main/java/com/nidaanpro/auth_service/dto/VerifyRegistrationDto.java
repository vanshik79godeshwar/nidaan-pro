package com.nidaanpro.auth_service.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
public record VerifyRegistrationDto(@Valid RegisterUserDto userDetails, @NotBlank String otp) {}