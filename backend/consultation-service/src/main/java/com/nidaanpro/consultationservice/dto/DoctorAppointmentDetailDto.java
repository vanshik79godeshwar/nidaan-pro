package com.nidaanpro.consultationservice.dto;

import com.nidaanpro.consultationservice.model.Appointment;

// This record combines an appointment with the patient's details.
public record DoctorAppointmentDetailDto(
        Appointment appointment,
        PatientDetailDto patientDetails
) {}