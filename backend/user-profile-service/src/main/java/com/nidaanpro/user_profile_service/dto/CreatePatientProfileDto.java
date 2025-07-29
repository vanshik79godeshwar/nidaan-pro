// backend/user-profile-service/src/main/java/com/nidaanpro/user_profile_service/dto/CreatePatientProfileDto.java
package com.nidaanpro.user_profile_service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePatientProfileDto(
        @NotNull UUID userId,
        LocalDate dateOfBirth,
        String gender,
        String address,
        String profilePictureUrl // <-- ADD THIS LINE
) {}