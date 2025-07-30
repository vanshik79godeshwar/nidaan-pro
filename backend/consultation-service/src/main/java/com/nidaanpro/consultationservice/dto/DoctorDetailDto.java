package com.nidaanpro.consultationservice.dto;

import java.util.UUID;

// A simplified DTO to hold only the doctor details we need
public record DoctorDetailDto(
        UUID id,
        String fullName,
        String email
        // We can add speciality later if needed
) {}