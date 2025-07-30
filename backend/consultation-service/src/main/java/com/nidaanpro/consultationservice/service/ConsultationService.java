package com.nidaanpro.consultationservice.service;

import com.nidaanpro.consultationservice.config.RabbitMQConfig;
import com.nidaanpro.consultationservice.dto.*;
import com.nidaanpro.consultationservice.model.Appointment;
import com.nidaanpro.consultationservice.model.PreConsultationReport;
import com.nidaanpro.consultationservice.repo.AppointmentRepository;
import com.nidaanpro.consultationservice.repo.PreConsultationReportRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

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
        // Step 1: Call user-profile-service to mark the slot as booked.
        // This implicitly validates that the slot exists and is available.
        try {
            webClientBuilder.build().post()
                    .uri("http://USER-PROFILE-SERVICE/api/doctors/slots/{slotId}/book", dto.slotId())
                    .retrieve()
                    .bodyToMono(Void.class) // We only care if it succeeds (200 OK) or fails (409 Conflict)
                    .block();
        } catch (Exception e) {
            // This will catch the error if the slot is already booked or doesn't exist
            throw new RuntimeException("This time slot is no longer available. Please select another.");
        }

        // Step 2: Create the Appointment record in this service's database
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.patientId());
        appointment.setDoctorId(dto.doctorId());
        appointment.setAppointmentTime(dto.appointmentTime());
        appointment.setStatus(Appointment.Status.PENDING_PAYMENT);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Step 3: Call Payment Service to create a payment order
        BigDecimal dummyAmount = new BigDecimal("500.00"); // Placeholder fee
        PaymentDto paymentResponse = webClientBuilder.build().post()
                .uri("http://PAYMENT-SERVICE/api/payments/create-order")
                .bodyValue(Map.of(
                        "appointmentId", savedAppointment.getId(),
                        "amount", dummyAmount
                ))
                .retrieve()
                .bodyToMono(PaymentDto.class)
                .block();

        // Step 4: Send notification about the booking
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, savedAppointment.getId().toString());

        return paymentResponse;
    }

    @Transactional
    public PreConsultationReport submitPreConsultationReport(SubmitReportDto dto) {
        Appointment appointment = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + dto.appointmentId()));

        PreConsultationReport report = reportRepository.findByAppointmentId(dto.appointmentId())
                .orElse(new PreConsultationReport());

        report.setAppointmentId(dto.appointmentId());

        // --- THIS IS THE FIX: Set the old field to satisfy the database ---
        report.setProblemBrief(dto.chiefComplaint());

        // Map all the new fields from the DTO
        report.setChiefComplaint(dto.chiefComplaint());
        report.setStaticQuestions(dto.staticQuestions());
        report.setDynamicQuestions(dto.dynamicQuestions());
        report.setDetailedDescription(dto.detailedDescription());
        report.setCurrentMedications(dto.currentMedications());
        report.setAttachmentUrls(dto.attachmentUrls());

        PreConsultationReport savedReport = reportRepository.save(report);

        appointment.setStatus(Appointment.Status.READY);
        appointmentRepository.save(appointment);

        return savedReport;
    }

    public boolean validateChatPair(UUID userId1, UUID userId2) {
        return appointmentRepository.existsByPatientIdAndDoctorId(userId1, userId2);
    }

    public List<AppointmentDetailDto> getAppointmentsForPatient(UUID patientId) {
        // 1. Get all appointments for the patient from our DB
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentTimeDesc(patientId);
        if (appointments.isEmpty()) {
            return List.of();
        }

        // 2. Collect all unique doctor IDs from these appointments
        List<UUID> doctorIds = appointments.stream()
                .map(Appointment::getDoctorId)
                .distinct()
                .toList();

        // 3. Call user-profile-service to get details for all required doctors in one go
        Map<UUID, DoctorDetailDto> doctorDetailsMap = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details") // We need to create this endpoint
                .bodyValue(doctorIds)
                .retrieve()
                .bodyToFlux(DoctorDetailDto.class)
                .collectMap(DoctorDetailDto::id)
                .block();

        // 4. Combine the appointment data with the doctor details
        return appointments.stream()
                .map(appointment -> {
                    DoctorDetailDto doctor = doctorDetailsMap.get(appointment.getDoctorId());
                    return new AppointmentDetailDto(appointment, doctor);
                })
                .toList();
    }

    public List<DoctorAppointmentDetailDto> getAppointmentsForDoctor(UUID doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorIdOrderByAppointmentTimeDesc(doctorId);
        if (appointments.isEmpty()) {
            return Collections.emptyList();
        }
        List<UUID> patientIds = appointments.stream().map(Appointment::getPatientId).distinct().toList();

        Map<UUID, PatientDetailDto> patientDetailsMap = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(patientIds)
                .retrieve()
                .bodyToFlux(PatientDetailDto.class)
                .collectMap(PatientDetailDto::id)
                .block();

        // This is the crucial change: We ensure that we only create DTOs for appointments
        // where we successfully found the corresponding patient details.
        return appointments.stream()
                .map(appointment -> {
                    PatientDetailDto patient = patientDetailsMap.get(appointment.getPatientId());
                    // If the patient details are not found for any reason, return null
                    if (patient == null) {
                        return null;
                    }
                    return new DoctorAppointmentDetailDto(appointment, patient);
                })
                .filter(Objects::nonNull) // This line removes all the null entries from the list
                .collect(Collectors.toList());
    }

    public List<UUID> findChatPartners(UUID userId) {
        return appointmentRepository.findDistinctChatPartnersByUserId(userId);
    }

    public PreConsultationReport getReportByAppointmentId(UUID appointmentId) {
        return reportRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Report not found for appointment ID: " + appointmentId));
    }
}