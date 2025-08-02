package com.nidaanpro.consultationservice.dto;

import com.nidaanpro.consultationservice.model.Appointment;
import java.util.UUID;

// A simple DTO to securely return only the necessary information
public record AppointmentStatusDto(
        UUID appointmentId,
        UUID patientId,
        Appointment.Status status
) {}