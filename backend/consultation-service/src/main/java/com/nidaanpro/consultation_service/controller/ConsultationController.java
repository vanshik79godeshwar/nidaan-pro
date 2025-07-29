package com.nidaanpro.consultation_service.controller;

import com.nidaanpro.consultation_service.dto.*;
import com.nidaanpro.consultation_service.model.PreConsultationReport;
import com.nidaanpro.consultation_service.service.ConsultationService;
import com.nidaanpro.consultation_service.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;
//    private final GeminiService geminiService;
//    private final WebClient.Builder webClientBuilder;

    public ConsultationController(ConsultationService consultationService, GeminiService geminiService, WebClient.Builder webClientBuilder) {
        this.consultationService = consultationService;
//        this.webClientBuilder = webClientBuilder;
//        this.geminiService = geminiService;
    }

//    @PostMapping("/reports/dynamic-questions")
//    public Mono<String> getDynamicQuestions(@Valid @RequestBody DynamicQuestionsRequestDto dto) {
//        // This service now calls the API Gateway, which will then call the external Gemini API
//        return webClientBuilder.build().post()
//                .uri("http://API-GATEWAY/api/ai/dynamic-questions")
//                .bodyValue(dto)
//                .retrieve()
//                .bodyToMono(String.class);
//    }

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


}
