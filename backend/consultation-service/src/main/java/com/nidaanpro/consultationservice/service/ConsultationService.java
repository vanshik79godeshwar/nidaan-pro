package com.nidaanpro.consultationservice.service;

import com.nidaanpro.consultationservice.config.RabbitMQConfig;
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
    public Appointment acceptEmergencyRequest(UUID requestId, UUID doctorId) {
        // 1. Find the request and ensure it's still pending
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found."));

        if (request.getStatus() != EmergencyRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("This request has already been accepted.");
        }

        // 2. Update the request status
        request.setStatus(EmergencyRequest.RequestStatus.ACCEPTED);
        request.setAssignedDoctorId(doctorId);
        emergencyRequestRepository.save(request);

        // 3. Create a formal appointment record for this emergency consultation
        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(doctorId);
        appointment.setAppointmentTime(Instant.now()); // The appointment is happening now
        appointment.setStatus(Appointment.Status.READY); // It's ready for the call immediately
        appointment.setConsultationType(Appointment.ConsultationType.EMERGENCY);

        List<UserDetailDto> allNotifiedDoctors = webClientBuilder.build().get()
                .uri("http://USER-PROFILE-SERVICE/api/doctors/emergency-available?specialityId={specId}", request.getSpecialityId())
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block();

        // 2. Create and publish the "accepted" event
        if (allNotifiedDoctors != null && !allNotifiedDoctors.isEmpty()) {
            EmergencyRequestAcceptedEvent acceptedEvent = new EmergencyRequestAcceptedEvent(
                    requestId,
                    allNotifiedDoctors.stream().map(UserDetailDto::id).toList()
            );
            // We'll define this new exchange in the notification-service
            rabbitTemplate.convertAndSend("emergency-request-exchange", "emergency.request.accepted", acceptedEvent);
        }

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public EmergencyRequest createEmergencyRequest(RequestEmergencyDto dto) {
        // 1. Get patient details for the notification message
        UserDetailDto patientDetails = fetchUserDetails(dto.patientId());

        // 2. Create and save the new emergency request record
        EmergencyRequest request = new EmergencyRequest();
        request.setPatientId(dto.patientId());
        request.setSpecialityId(dto.specialityId());
        request.setPatientName(patientDetails.fullName());
        EmergencyRequest savedRequest = emergencyRequestRepository.save(request);

        // 3. Find all doctors available for this emergency
        List<UserDetailDto> availableDoctors = webClientBuilder.build().get()
                .uri("http://USER-PROFILE-SERVICE/api/doctors/emergency-available?specialityId={specId}", dto.specialityId())
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block();

        // 4. Publish a notification event for each available doctor
        if (availableDoctors != null && !availableDoctors.isEmpty()) {
            EmergencyRequestEvent event = new EmergencyRequestEvent(
                    savedRequest.getId(),
                    patientDetails.fullName(),
                    dto.specialityId(),
                    availableDoctors.stream().map(UserDetailDto::id).toList() // Send a list of doctor IDs
            );
            // We'll need a new RabbitMQ exchange for this
            rabbitTemplate.convertAndSend("emergency-request-exchange", "emergency.request.new", event);
        }

        return savedRequest;
    }

    public List<EmergencyRequest> getPendingEmergencyRequests(Integer specialityId) {
        return emergencyRequestRepository.findBySpecialityIdAndStatus(specialityId, EmergencyRequest.RequestStatus.PENDING);
    }

    private UserDetailDto fetchUserDetails(UUID userId) {
        return webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(List.of(userId))
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .blockFirst();
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

        UserDetailDto patientDetails = fetchUserDetails(dto.patientId());
        UserDetailDto doctorDetails = fetchUserDetails(dto.doctorId());

        AppointmentConfirmationEvent event = new AppointmentConfirmationEvent(
                savedAppointment.getId(),
                dto.patientId(),
                dto.doctorId(),
                patientDetails.fullName(),
                patientDetails.email(),
                doctorDetails.fullName(),
                savedAppointment.getAppointmentTime()
        );

        // Step 4: Send notification about the booking
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event);

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

    public Optional<AppointmentStatusDto> getAppointmentStatus(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(app -> new AppointmentStatusDto(app.getId(), app.getPatientId(), app.getStatus()));
    }

    @Transactional
    public Appointment completeAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        // You could add logic here to ensure only doctors or involved patients can complete it
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

    public Optional<AppointmentDetailDto> getAppointmentDetails(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(appointment -> {
                    // Fetch the doctor's details from the auth-service
                    DoctorDetailDto doctorDetails = webClientBuilder.build().post()
                            .uri("http://AUTH-SERVICE/api/users/details")
                            .bodyValue(List.of(appointment.getDoctorId()))
                            .retrieve()
                            .bodyToFlux(DoctorDetailDto.class)
                            .blockFirst(); // We expect only one result

                    if (doctorDetails == null) {
                        return null;
                    }
                    return new AppointmentDetailDto(appointment, doctorDetails);
                });
    }

    public List<Appointment> getAppointmentHistory(UUID userId1, UUID userId2) {
        // This will return a list of all appointments between the two users, sorted by most recent first.
        return appointmentRepository.findAppointmentHistory(userId1, userId2);
    }

    @Transactional
    public Appointment confirmAppointmentPayment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        // Only update if it's pending, to avoid race conditions or invalid states
        if (appointment.getStatus() == Appointment.Status.PENDING_PAYMENT) {
            appointment.setStatus(Appointment.Status.SCHEDULED);
            return appointmentRepository.save(appointment);
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

        // Security check: ensure the person cancelling is the one who made the request
        if (!request.getPatientId().equals(patientId)) {
            throw new SecurityException("You can only cancel your own requests.");
        }

        if (request.getStatus() == EmergencyRequest.RequestStatus.PENDING) {
            request.setStatus(EmergencyRequest.RequestStatus.CANCELLED);
            return emergencyRequestRepository.save(request);
        } else {
            // Can't cancel a request that's already been accepted or completed
            throw new IllegalStateException("This request can no longer be cancelled.");
        }
    }
}