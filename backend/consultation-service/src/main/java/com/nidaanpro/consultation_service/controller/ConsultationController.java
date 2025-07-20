package com.nidaanpro.consultation_service.controller;

import com.nidaanpro.consultation_service.dto.BookAppointmentDto;
import com.nidaanpro.consultation_service.dto.SubmitReportDto; // <-- Import DTO
import com.nidaanpro.consultation_service.model.Appointment;
import com.nidaanpro.consultation_service.model.PreConsultationReport; // <-- Import model
import com.nidaanpro.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody BookAppointmentDto dto) {
        Appointment newAppointment = consultationService.bookAppointment(dto);
        return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
    }

    // <-- Add this endpoint
    @PostMapping("/reports")
    public ResponseEntity<PreConsultationReport> submitReport(@Valid @RequestBody SubmitReportDto dto) {
        PreConsultationReport report = consultationService.submitPreConsultationReport(dto);
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }
}