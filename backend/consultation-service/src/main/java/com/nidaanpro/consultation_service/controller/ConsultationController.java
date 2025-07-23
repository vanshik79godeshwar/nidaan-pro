package com.nidaanpro.consultation_service.controller;

import com.nidaanpro.consultation_service.dto.AppointmentDetailDto;
import com.nidaanpro.consultation_service.dto.BookAppointmentDto;
import com.nidaanpro.consultation_service.dto.PaymentDto;
import com.nidaanpro.consultation_service.dto.SubmitReportDto;
import com.nidaanpro.consultation_service.model.PreConsultationReport;
import com.nidaanpro.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/book")
    public ResponseEntity<PaymentDto> bookAppointment(@Valid @RequestBody BookAppointmentDto dto) {
        PaymentDto paymentDetails = consultationService.bookAppointment(dto);
        return new ResponseEntity<>(paymentDetails, HttpStatus.CREATED);
    }

    @PostMapping("/reports")
    public ResponseEntity<PreConsultationReport> submitReport(@Valid @RequestBody SubmitReportDto dto) {
        PreConsultationReport report = consultationService.submitPreConsultationReport(dto);
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDetailDto>> getAppointmentsForPatient(@PathVariable UUID patientId) {
        List<AppointmentDetailDto> appointments = consultationService.getAppointmentsForPatient(patientId);
        return ResponseEntity.ok(appointments);
    }
}
