package com.nidaanpro.user_profile_service.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleDto(
        UUID doctorId,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime
) {}