package com.nidaanpro.consultation_service.service;

import com.nidaanpro.consultation_service.dto.BookAppointmentDto;
import com.nidaanpro.consultation_service.model.Appointment;
import com.nidaanpro.consultation_service.repo.AppointmentRepository;
import org.springframework.stereotype.Service;

@Service
public class ConsultationService {

    private final AppointmentRepository appointmentRepository;

    public ConsultationService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment bookAppointment(BookAppointmentDto dto) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.patientId());
        appointment.setDoctorId(dto.doctorId());
        appointment.setAppointmentTime(dto.appointmentTime());
        // Default status is already set to SCHEDULED in the model
        return appointmentRepository.save(appointment);
    }
}