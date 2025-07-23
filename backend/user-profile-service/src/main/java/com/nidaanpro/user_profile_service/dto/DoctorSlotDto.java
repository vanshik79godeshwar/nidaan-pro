package com.nidaanpro.user_profile_service.dto;

import java.time.Instant;
import java.util.UUID;

public record DoctorSlotDto(
        UUID doctorId,
        Instant slotTime
) {}