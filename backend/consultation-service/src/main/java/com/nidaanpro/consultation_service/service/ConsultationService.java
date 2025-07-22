package com.nidaanpro.consultation_service.service;

import com.nidaanpro.consultation_service.config.RabbitMQConfig;
import com.nidaanpro.consultation_service.dto.BookAppointmentDto;
import com.nidaanpro.consultation_service.dto.DoctorScheduleDto;
import com.nidaanpro.consultation_service.dto.PaymentDto;
import com.nidaanpro.consultation_service.dto.SubmitReportDto;
import com.nidaanpro.consultation_service.model.Appointment;
import com.nidaanpro.consultation_service.model.PreConsultationReport;
import com.nidaanpro.consultation_service.repo.AppointmentRepository;
import com.nidaanpro.consultation_service.repo.PreConsultationReportRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ConsultationService {

    private final AppointmentRepository appointmentRepository;
    private final PreConsultationReportRepository reportRepository;
    private final WebClient.Builder webClientBuilder;
    private final RabbitTemplate rabbitTemplate;

    public ConsultationService(AppointmentRepository appointmentRepository, PreConsultationReportRepository reportRepository, WebClient.Builder webClientBuilder, RabbitTemplate rabbitTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.reportRepository = reportRepository;
        this.webClientBuilder = webClientBuilder;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public PaymentDto bookAppointment(BookAppointmentDto dto) {
        // Step 1: Validate Slot Availability (from previous step)
        // (The existing logic for checking schedule remains here)
        // ...

        // Step 2: Create Appointment with PENDING status
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.patientId());
        appointment.setDoctorId(dto.doctorId());
        appointment.setAppointmentTime(dto.appointmentTime());
        appointment.setStatus(Appointment.Status.PENDING_PAYMENT); // New status
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Step 3: Call Payment Service to create a payment order
        // NOTE: In a real app, you'd fetch the doctor's fee. We'll use a dummy amount.
        BigDecimal dummyAmount = new BigDecimal("500.00");
        PaymentDto paymentResponse = webClientBuilder.build().post()
                .uri("http://PAYMENT-SERVICE/api/payments/create-order")
                .bodyValue(Map.of(
                        "appointmentId", savedAppointment.getId(),
                        "amount", dummyAmount
                ))
                .retrieve()
                .bodyToMono(PaymentDto.class)
                .block();

        // Step 4: Send notification about the booking attempt
        // In a real app, you'd send more details like patient/doctor names
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, savedAppointment.getId().toString());

        return paymentResponse;
    }

    // ... (rest of your methods like submitPreConsultationReport and validateChatPair)
    @Transactional
    public PreConsultationReport submitPreConsultationReport(SubmitReportDto dto) {
        Appointment appointment = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        PreConsultationReport report = new PreConsultationReport();
        report.setAppointmentId(dto.appointmentId());
        report.setProblemBrief(dto.problemBrief());
        PreConsultationReport savedReport = reportRepository.save(report);

        appointment.setStatus(Appointment.Status.READY);
        appointmentRepository.save(appointment);

        return savedReport;
    }

    public boolean validateChatPair(UUID userId1, UUID userId2) {
        return appointmentRepository.existsByPatientIdAndDoctorId(userId1, userId2);
    }
}