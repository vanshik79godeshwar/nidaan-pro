package com.nidaanpro.consultation_service.service;

import com.nidaanpro.consultation_service.dto.BookAppointmentDto;
import com.nidaanpro.consultation_service.dto.SubmitReportDto; // <-- Import DTO
import com.nidaanpro.consultation_service.model.Appointment;
import com.nidaanpro.consultation_service.model.PreConsultationReport; // <-- Import model
import com.nidaanpro.consultation_service.repo.AppointmentRepository;
import com.nidaanpro.consultation_service.repo.PreConsultationReportRepository; // <-- Import repo
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- Import Transactional

import java.util.UUID;

@Service
public class ConsultationService {

    private final AppointmentRepository appointmentRepository;
    private final PreConsultationReportRepository reportRepository; // <-- Add repo

    // <-- Update constructor
    public ConsultationService(AppointmentRepository appointmentRepository, PreConsultationReportRepository reportRepository) {
        this.appointmentRepository = appointmentRepository;
        this.reportRepository = reportRepository;
    }

    public Appointment bookAppointment(BookAppointmentDto dto) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.patientId());
        appointment.setDoctorId(dto.doctorId());
        appointment.setAppointmentTime(dto.appointmentTime());
        return appointmentRepository.save(appointment);
    }

    // <-- Add this method
    @Transactional // Ensures both operations (save report, update appointment) succeed or fail together
    public PreConsultationReport submitPreConsultationReport(SubmitReportDto dto) {
        // 1. Find the appointment
        Appointment appointment = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2. Create and save the report
        PreConsultationReport report = new PreConsultationReport();
        report.setAppointmentId(dto.appointmentId());
        report.setProblemBrief(dto.problemBrief());
        PreConsultationReport savedReport = reportRepository.save(report);

        // 3. Update the appointment status
        appointment.setStatus(Appointment.Status.READY);
        appointmentRepository.save(appointment);

        return savedReport;
    }

    public boolean validateChatPair(UUID userId1, UUID userId2) {
        return appointmentRepository.existsByPatientIdAndDoctorId(userId1, userId2);
    }
}