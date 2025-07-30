package com.nidaanpro.consultationservice.dto;

import com.nidaanpro.consultationservice.model.Appointment;

// This will be the final object we send to the frontend
public record AppointmentDetailDto(
        Appointment appointment,
        DoctorDetailDto doctorDetails
) {}