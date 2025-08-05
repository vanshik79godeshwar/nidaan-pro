package com.nidaanpro.consultationservice.service;

import com.nidaanpro.consultationservice.dto.*;
import com.nidaanpro.consultationservice.dto.events.AppointmentConfirmationEvent;
import com.nidaanpro.consultationservice.dto.events.EmergencyRequestAcceptedEvent;
import com.nidaanpro.consultationservice.dto.events.EmergencyRequestEvent;
import com.nidaanpro.consultationservice.model.Appointment;
import com.nidaanpro.consultationservice.model.EmergencyRequest;
import com.nidaanpro.consultationservice.model.PreConsultationReport;
import com.nidaanpro.consultationservice.repo.AppointmentRepository;
import com.nidaanpro.consultationservice.repo.EmergencyRequestRepository;
import com.nidaanpro.consultationservice.repo.PreConsultationReportRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConsultationService {

    private final AppointmentRepository appointmentRepository;
    private final PreConsultationReportRepository reportRepository;
    private final WebClient.Builder webClientBuilder;
    private final RabbitTemplate rabbitTemplate;
    private final EmergencyRequestRepository emergencyRequestRepository;

    public ConsultationService(AppointmentRepository appointmentRepository, PreConsultationReportRepository reportRepository, WebClient.Builder webClientBuilder, RabbitTemplate rabbitTemplate, EmergencyRequestRepository emergencyRequestRepository) {
        this.appointmentRepository = appointmentRepository;
        this.reportRepository = reportRepository;
        this.webClientBuilder = webClientBuilder;
        this.rabbitTemplate = rabbitTemplate;
        this.emergencyRequestRepository = emergencyRequestRepository;
    }

    @Transactional
    public PaymentDto initiateEmergencyRequest(RequestEmergencyDto dto) {
        UserDetailDto patientDetails = fetchUserDetails(dto.patientId());

        EmergencyRequest request = new EmergencyRequest();
        request.setPatientId(dto.patientId());
        request.setSpecialityId(dto.specialityId());
        request.setPatientName(patientDetails.fullName());
        request.setStatus(EmergencyRequest.RequestStatus.PENDING_PAYMENT);
        EmergencyRequest savedRequest = emergencyRequestRepository.save(request);

        BigDecimal emergencyFee = new BigDecimal("800.00");

        return webClientBuilder.build().post()
                .uri("http://PAYMENT-SERVICE/api/payments/create-order")
                .bodyValue(Map.of(
                        "referenceId", savedRequest.getId(),
                        "amount", emergencyFee,
                        "type", "EMERGENCY"
                ))
                .retrieve()
                .bodyToMono(PaymentDto.class)
                .block();
    }

    @Transactional
    public void confirmEmergencyPayment(UUID requestId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found for payment confirmation."));

        if (request.getStatus() != EmergencyRequest.RequestStatus.PENDING_PAYMENT) {
            return;
        }

        request.setStatus(EmergencyRequest.RequestStatus.PENDING);
        emergencyRequestRepository.save(request);

        List<UserDetailDto> availableDoctors = webClientBuilder.build().get()
                .uri("http://USER-PROFILE-SERVICE/api/doctors/emergency-available?specialityId={specId}", request.getSpecialityId())
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block();

        if (availableDoctors != null && !availableDoctors.isEmpty()) {
            EmergencyRequestEvent event = new EmergencyRequestEvent(
                    request.getId(),
                    request.getPatientName(),
                    request.getSpecialityId(),
                    availableDoctors.stream().map(UserDetailDto::id).toList()
            );
            rabbitTemplate.convertAndSend("emergency-request-exchange", "emergency.request.new", event);
        }
    }

    @Transactional
    public PaymentDto bookAppointment(BookAppointmentDto dto) {
        try {
            webClientBuilder.build().post()
                    .uri("http://USER-PROFILE-SERVICE/api/doctors/slots/{slotId}/book", dto.slotId())
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("This time slot is no longer available. Please select another.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.patientId());
        appointment.setDoctorId(dto.doctorId());
        appointment.setAppointmentTime(dto.appointmentTime());
        appointment.setStatus(Appointment.Status.PENDING_PAYMENT);
        appointment.setConsultationType(Appointment.ConsultationType.SCHEDULED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        BigDecimal consultationFee = new BigDecimal("500.00");

        return webClientBuilder.build().post()
                .uri("http://PAYMENT-SERVICE/api/payments/create-order")
                .bodyValue(Map.of(
                        "referenceId", savedAppointment.getId(),
                        "amount", consultationFee,
                        "type", "APPOINTMENT"
                ))
                .retrieve()
                .bodyToMono(PaymentDto.class)
                .block();
    }

    @Transactional
    public Appointment acceptEmergencyRequest(UUID requestId, UUID doctorId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found."));

        if (request.getStatus() != EmergencyRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("This request has already been accepted.");
        }

        request.setStatus(EmergencyRequest.RequestStatus.ACCEPTED);
        request.setAssignedDoctorId(doctorId);
        emergencyRequestRepository.save(request);

        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(doctorId);
        appointment.setAppointmentTime(Instant.now());
        appointment.setStatus(Appointment.Status.READY);
        appointment.setConsultationType(Appointment.ConsultationType.EMERGENCY);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        UserDetailDto patientDetails = fetchUserDetails(request.getPatientId());
        UserDetailDto doctorDetails = fetchUserDetails(doctorId);

        AppointmentConfirmationEvent patientNotificationEvent = new AppointmentConfirmationEvent(
                savedAppointment.getId(),
                patientDetails.id(),
                doctorDetails.id(),
                patientDetails.fullName(),
                patientDetails.email(),
                doctorDetails.fullName(),
                savedAppointment.getAppointmentTime(),
                savedAppointment.getConsultationType().name()
        );

        rabbitTemplate.convertAndSend("appointment-exchange", "appointment.booked", patientNotificationEvent);

        List<UserDetailDto> allNotifiedDoctors = webClientBuilder.build().get()
                .uri("http://USER-PROFILE-SERVICE/api/doctors/emergency-available?specialityId={specId}", request.getSpecialityId())
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block();

        if (allNotifiedDoctors != null && !allNotifiedDoctors.isEmpty()) {
            EmergencyRequestAcceptedEvent acceptedEvent = new EmergencyRequestAcceptedEvent(
                    requestId,
                    allNotifiedDoctors.stream().map(UserDetailDto::id).toList()
            );
            rabbitTemplate.convertAndSend("emergency-request-exchange", "emergency.request.accepted", acceptedEvent);
        }

        return savedAppointment;
    }

    public List<EmergencyRequest> getPendingEmergencyRequests(Integer specialityId) {
        return emergencyRequestRepository.findBySpecialityIdAndStatus(specialityId, EmergencyRequest.RequestStatus.PENDING);
    }

    private UserDetailDto fetchUserDetails(UUID userId) {
        List<UserDetailDto> userDetails = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(List.of(userId))
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block();

        if (userDetails == null || userDetails.isEmpty()) {
            throw new RuntimeException("Could not find details for user ID: " + userId);
        }
        return userDetails.get(0);
    }

    private Map<UUID, UserDetailDto> fetchMultipleUserDetails(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(userIds)
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectMap(UserDetailDto::id)
                .block();
    }

    @Transactional
    public PreConsultationReport submitPreConsultationReport(SubmitReportDto dto) {
        Appointment appointment = appointmentRepository.findById(dto.appointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + dto.appointmentId()));

        PreConsultationReport report = reportRepository.findByAppointmentId(dto.appointmentId())
                .orElse(new PreConsultationReport());

        report.setAppointmentId(dto.appointmentId());
        report.setProblemBrief(dto.chiefComplaint());
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
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentTimeDesc(patientId);
        if (appointments.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> doctorIds = appointments.stream().map(Appointment::getDoctorId).distinct().toList();
        Map<UUID, UserDetailDto> doctorDetailsMap = fetchMultipleUserDetails(doctorIds);
        UserDetailDto patientDetails = fetchUserDetails(patientId);

        return appointments.stream()
                .map(appointment -> {
                    UserDetailDto doctor = doctorDetailsMap.get(appointment.getDoctorId());
                    if(doctor == null) return null;
                    return new AppointmentDetailDto(
                            appointment,
                            new PatientDetailDto(patientDetails.id(), patientDetails.fullName(), patientDetails.email()),
                            new DoctorDetailDto(doctor.id(), doctor.fullName(), doctor.email())
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DoctorAppointmentDetailDto> getAppointmentsForDoctor(UUID doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorIdOrderByAppointmentTimeDesc(doctorId);
        if (appointments.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> patientIds = appointments.stream().map(Appointment::getPatientId).distinct().toList();
        Map<UUID, UserDetailDto> patientDetailsMap = fetchMultipleUserDetails(patientIds);

        return appointments.stream()
                .map(appointment -> {
                    UserDetailDto patient = patientDetailsMap.get(appointment.getPatientId());
                    if (patient == null) {
                        return null;
                    }
                    PatientDetailDto patientDetailDto = new PatientDetailDto(patient.id(), patient.fullName(), patient.email());
                    return new DoctorAppointmentDetailDto(appointment, patientDetailDto);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<UUID> findChatPartners(UUID userId) {
        return appointmentRepository.findDistinctChatPartnersByUserId(userId);
    }

    public PreConsultationReport getReportByAppointmentId(UUID appointmentId) {
        return reportRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Report not found for appointment ID: " + appointmentId));
    }

    public Optional<AppointmentStatusDto> getAppointmentStatus(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(app -> new AppointmentStatusDto(app.getId(), app.getPatientId(), app.getStatus()));
    }

    @Transactional
    public Appointment completeAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        appointment.setStatus(Appointment.Status.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment addDoctorNotes(UUID appointmentId, SubmitNotesDto dto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        if (appointment.getStatus() != Appointment.Status.COMPLETED) {
            throw new IllegalStateException("Notes can only be added to completed appointments.");
        }

        appointment.setDiagnosis(dto.diagnosis());
        appointment.setDoctorNotes(dto.doctorNotes());
        appointment.setPrescription(dto.prescription());

        return appointmentRepository.save(appointment);
    }

    // --- THIS IS THE CORRECTED METHOD ---
    public Optional<AppointmentDetailDto> getAppointmentDetails(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(appointment -> {
                    // Fetch details for BOTH the doctor and the patient
                    UserDetailDto doctorDetails = fetchUserDetails(appointment.getDoctorId());
                    UserDetailDto patientDetails = fetchUserDetails(appointment.getPatientId());

                    if (doctorDetails == null || patientDetails == null) {
                        return null;
                    }
                    // Construct the full DTO with all required nested objects
                    return new AppointmentDetailDto(
                            appointment,
                            new PatientDetailDto(patientDetails.id(), patientDetails.fullName(), patientDetails.email()),
                            new DoctorDetailDto(doctorDetails.id(), doctorDetails.fullName(), doctorDetails.email())
                    );
                });
    }

    public List<Appointment> getAppointmentHistory(UUID userId1, UUID userId2) {
        return appointmentRepository.findAppointmentHistory(userId1, userId2);
    }

    @Transactional
    public Appointment confirmAppointmentPayment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        if (appointment.getStatus() == Appointment.Status.PENDING_PAYMENT) {
            appointment.setStatus(Appointment.Status.SCHEDULED);
            Appointment savedAppointment = appointmentRepository.save(appointment);

            UserDetailDto patientDetails = fetchUserDetails(savedAppointment.getPatientId());
            UserDetailDto doctorDetails = fetchUserDetails(savedAppointment.getDoctorId());

            AppointmentConfirmationEvent event = new AppointmentConfirmationEvent(
                    savedAppointment.getId(),
                    patientDetails.id(),
                    doctorDetails.id(),
                    patientDetails.fullName(),
                    patientDetails.email(),
                    doctorDetails.fullName(),
                    savedAppointment.getAppointmentTime(),
                    savedAppointment.getConsultationType().name()
            );

            rabbitTemplate.convertAndSend("appointment-exchange", "appointment.booked", event);
            return savedAppointment;
        }
        return appointment;
    }

    public Optional<EmergencyRequest> findActiveRequestForPatient(UUID patientId) {
        return emergencyRequestRepository.findByPatientIdAndStatus(patientId, EmergencyRequest.RequestStatus.PENDING);
    }

    @Transactional
    public EmergencyRequest cancelEmergencyRequest(UUID requestId, UUID patientId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        if (!request.getPatientId().equals(patientId)) {
            throw new SecurityException("You can only cancel your own requests.");
        }

        if (request.getStatus() == EmergencyRequest.RequestStatus.PENDING) {
            request.setStatus(EmergencyRequest.RequestStatus.CANCELLED);
            return emergencyRequestRepository.save(request);
        } else {
            throw new IllegalStateException("This request can no longer be cancelled.");
        }
    }
}