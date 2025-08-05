package com.nidaanpro.consultationservice.controller;

import com.nidaanpro.consultationservice.dto.*;
import com.nidaanpro.consultationservice.model.Appointment;
import com.nidaanpro.consultationservice.model.EmergencyRequest;
import com.nidaanpro.consultationservice.model.PreConsultationReport;
import com.nidaanpro.consultationservice.service.ConsultationService;
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

    @GetMapping("/reports/appointment/{appointmentId}")
    public ResponseEntity<PreConsultationReport> getReportForAppointment(@PathVariable UUID appointmentId) {
        PreConsultationReport report = consultationService.getReportByAppointmentId(appointmentId);
        return ResponseEntity.ok(report);
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

    @GetMapping("/chat-partners/{userId}")
    public ResponseEntity<List<UUID>> getChatPartners(@PathVariable UUID userId) {
        List<UUID> chatPartners = consultationService.findChatPartners(userId);
        return ResponseEntity.ok(chatPartners);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAppointmentDetailDto>> getAppointmentsForDoctor(@PathVariable UUID doctorId) {
        List<DoctorAppointmentDetailDto> appointments = consultationService.getAppointmentsForDoctor(doctorId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentStatusDto> getAppointmentStatus(@PathVariable UUID appointmentId) {
        return consultationService.getAppointmentStatus(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{appointmentId}/complete")
    public ResponseEntity<Void> completeAppointment(@PathVariable UUID appointmentId) {
        try {
            consultationService.completeAppointment(appointmentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{appointmentId}/notes")
    public ResponseEntity<Appointment> addDoctorNotes(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody SubmitNotesDto dto
    ) {
        try {
            Appointment updatedAppointment = consultationService.addDoctorNotes(appointmentId, dto);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentDetailDto> getAppointmentDetails(@PathVariable UUID appointmentId) {
        return consultationService.getAppointmentDetails(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<Appointment>> getAppointmentHistory(
            @PathVariable UUID userId1,
            @PathVariable UUID userId2
    ) {
        List<Appointment> history = consultationService.getAppointmentHistory(userId1, userId2);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/{appointmentId}/confirm-payment")
    public ResponseEntity<Appointment> confirmPayment(@PathVariable UUID appointmentId) {
        try {
            Appointment updatedAppointment = consultationService.confirmAppointmentPayment(appointmentId);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- THIS IS THE FIX ---
    // The old `/emergency/request` endpoint has been removed.
    // The new `/emergency/initiate` endpoint is now the correct entry point.

    @PostMapping("/emergency/initiate")
    public ResponseEntity<PaymentDto> initiateEmergencyConsultation(@Valid @RequestBody RequestEmergencyDto dto) {
        PaymentDto paymentDetails = consultationService.initiateEmergencyRequest(dto);
        return new ResponseEntity<>(paymentDetails, HttpStatus.CREATED);
    }

    @GetMapping("/emergency/pending")
    public ResponseEntity<List<EmergencyRequest>> getPendingRequests(@RequestParam Integer specialityId) {
        return ResponseEntity.ok(consultationService.getPendingEmergencyRequests(specialityId));
    }

    @PostMapping("/emergency/{requestId}/accept")
    public ResponseEntity<Appointment> acceptEmergencyRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody AcceptEmergencyDto dto
    ) {
        try {
            Appointment newAppointment = consultationService.acceptEmergencyRequest(requestId, dto.doctorId());
            return new ResponseEntity<>(newAppointment, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/emergency/request/patient/{patientId}")
    public ResponseEntity<EmergencyRequest> getActiveRequestForPatient(@PathVariable UUID patientId) {
        return consultationService.findActiveRequestForPatient(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/emergency/request/{requestId}/cancel")
    public ResponseEntity<EmergencyRequest> cancelEmergencyRequest(@PathVariable UUID requestId, @RequestHeader("X-User-Id") UUID patientId) {
        try {
            EmergencyRequest cancelledRequest = consultationService.cancelEmergencyRequest(requestId, patientId);
            return ResponseEntity.ok(cancelledRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/emergency/{requestId}/confirm-payment")
    public ResponseEntity<Void> confirmEmergencyPayment(@PathVariable UUID requestId) {
        consultationService.confirmEmergencyPayment(requestId);
        return ResponseEntity.ok().build();
    }
}