package com.nidaanpro.consultation_service.dto;

import com.nidaanpro.consultation_service.model.Appointment;

// This record combines an appointment with the patient's details.
public record DoctorAppointmentDetailDto(
        Appointment appointment,
        PatientDetailDto patientDetails
) {}