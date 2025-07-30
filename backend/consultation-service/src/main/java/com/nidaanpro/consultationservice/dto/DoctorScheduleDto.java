package com.nidaanpro.consultationservice.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

// This DTO must match the structure of the one in user-profile-service
public record DoctorScheduleDto(
        UUID id,
        UUID doctorId,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime
) {}