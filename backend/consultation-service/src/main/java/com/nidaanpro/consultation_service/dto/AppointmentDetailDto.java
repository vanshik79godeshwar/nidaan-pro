package com.nidaanpro.consultation_service.dto;

import com.nidaanpro.consultation_service.model.Appointment;

// This will be the final object we send to the frontend
public record AppointmentDetailDto(
        Appointment appointment,
        DoctorDetailDto doctorDetails
) {}