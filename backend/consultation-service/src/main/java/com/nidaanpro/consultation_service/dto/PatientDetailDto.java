package com.nidaanpro.consultation_service.dto;

import java.util.UUID;

// This record will hold the patient's details for the doctor's view.
public record PatientDetailDto(
        // --- THIS IS THE FIX ---
        // Change the field name from "userId" to "id" to match the UserDto from auth-service.
        UUID id,
        String fullName,
        String email
) {}