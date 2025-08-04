package com.nidaanpro.user_profile_service.service;

import com.nidaanpro.user_profile_service.dto.*;
import com.nidaanpro.user_profile_service.model.*;
import com.nidaanpro.user_profile_service.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserProfileService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorSpecialityRepository specialityRepository;
    private final DoctorSlotRepository doctorSlotRepository;
    private final WebClient.Builder webClientBuilder;
    private final DoctorReviewRepository reviewRepository;

    public UserProfileService(DoctorRepository doctorRepository, PatientRepository patientRepository, DoctorSpecialityRepository specialityRepository, DoctorSlotRepository doctorSlotRepository, WebClient.Builder webClientBuilder, DoctorReviewRepository reviewRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.specialityRepository = specialityRepository;
        this.doctorSlotRepository = doctorSlotRepository;
        this.webClientBuilder = webClientBuilder;
        this.reviewRepository = reviewRepository;
    }

    // --- PROFILE MANAGEMENT ---
    public Doctor createDoctorProfile(CreateDoctorProfileDto dto) {
        Doctor doctor = doctorRepository.findById(dto.userId()).orElse(new Doctor());
        doctor.setUserId(dto.userId());
        doctor.setSpecialityId(dto.specialityId());
        doctor.setMedicalLicenseNumber(dto.medicalLicenseNumber());
        doctor.setBio(dto.bio());
        doctor.setYearsOfExperience(dto.yearsOfExperience());
        doctor.setConsultationFee(dto.consultationFee());
        doctor.setProfilePictureUrl(dto.profilePictureUrl());
        if (dto.availableForEmergency() != null) {
            doctor.setAvailableForEmergency(dto.availableForEmergency());
        }
        return doctorRepository.save(doctor);
    }

    public List<UserDetailDto> findEmergencyAvailableDoctors(Integer specialityId) {
        List<Doctor> doctors = doctorRepository.findBySpecialityIdAndAvailableForEmergencyTrue(specialityId);
        if (doctors.isEmpty()) {
            return List.of();
        }
        List<UUID> userIds = doctors.stream().map(Doctor::getUserId).toList();
        return findUserDetailsByIds(userIds); // We can reuse the existing method to get their details
    }

    public Patient createPatientProfile(CreatePatientProfileDto dto) {
        Patient patient = patientRepository.findById(dto.userId()).orElse(new Patient());
        patient.setUserId(dto.userId());
        patient.setDateOfBirth(dto.dateOfBirth());
        if (dto.gender() != null) {
            patient.setGender(Patient.Gender.valueOf(dto.gender().toUpperCase()));
        }
        patient.setAddress(dto.address());
        patient.setProfilePictureUrl(dto.profilePictureUrl()); // <-- ADD THIS LINE
        return patientRepository.save(patient);
    }

    // --- SPECIALITY MANAGEMENT ---
    public DoctorSpeciality createSpeciality(CreateSpecialityDto dto) {
        DoctorSpeciality speciality = new DoctorSpeciality();
        speciality.setName(dto.name());
        speciality.setDescription(dto.description());
        return specialityRepository.save(speciality);
    }

    public List<DoctorSpeciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    // --- SLOT MANAGEMENT ---
    public DoctorSlot addDoctorSlot(DoctorSlotDto dto) {
        DoctorSlot slot = new DoctorSlot();
        slot.setDoctorId(dto.doctorId());
        slot.setSlotTime(dto.slotTime());
        slot.setBooked(false);
        return doctorSlotRepository.save(slot);
    }

    public List<DoctorSlot> getDoctorAvailableSlots(UUID doctorId) {
        return doctorSlotRepository.findByDoctorIdAndIsBookedFalseAndSlotTimeAfterOrderBySlotTimeAsc(doctorId, Instant.now());
    }

    @Transactional
    public DoctorSlot bookSlot(UUID slotId) {
        DoctorSlot slot = doctorSlotRepository.findByIdAndIsBookedFalse(slotId)
                .orElseThrow(() -> new RuntimeException("Slot is not available or does not exist."));
        slot.setBooked(true);
        return doctorSlotRepository.save(slot);
    }

    // --- DATA AGGREGATION / FETCHING ---
    public Optional<?> getProfileByUserId(UUID userId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(userId);
        if (doctorOpt.isPresent()) {
            return Optional.of(enrichDoctorWithUserDetails(doctorOpt.get()));
        }
        // If not a doctor, try to find a patient profile
        return patientRepository.findById(userId);
    }

    public List<DoctorDetailDto> findDoctors(Integer specialityId) {
        List<Doctor> doctors = (specialityId != null)
                ? doctorRepository.findBySpecialityId(specialityId)
                : doctorRepository.findAll();

        if (doctors.isEmpty()) {
            return List.of();
        }

        List<UUID> userIds = doctors.stream().map(Doctor::getUserId).toList();
        // This now calls our new, correct method
        Map<UUID, UserDto> userDtoMap = fetchUserDetails(userIds);

        return doctors.stream()
                .map(doctor -> {
                    UserDto user = userDtoMap.get(doctor.getUserId());
                    if (user != null) {
                        return new DoctorDetailDto(doctor, user.fullName(), user.email());
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    // enrichDoctorWithUserDetails method
    private DoctorDetailDto enrichDoctorWithUserDetails(Doctor doctor) {
        // This also calls our new, correct method
        Map<UUID, UserDto> userMap = fetchUserDetails(List.of(doctor.getUserId()));
        UserDto user = userMap.get(doctor.getUserId());
        return new DoctorDetailDto(doctor, user != null ? user.fullName() : "N/A", user != null ? user.email() : "N/A");
    }

    public List<UserDetailDto> findUserDetailsByIds(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyList();
        }
        // It now correctly calls the AUTH-SERVICE via the gateway
        return webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(userIds)
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectList()
                .block(); // .block() to make the call synchronous
    }

    private Map<UUID, UserDto> fetchUserDetails(List<UUID> userIds) {
        return webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .body(Mono.just(userIds), List.class)
                .retrieve()
                .bodyToFlux(UserDto.class)
                .collectMap(UserDto::id)
                .block();
    }

    @Transactional
    public DoctorReview submitReview(String patientIdStr, SubmitReviewDto dto) {
        // Step 1: Verify the appointment status from the consultation-service
        UUID patientId = UUID.fromString(patientIdStr);

        // Step 1: Verify the appointment status (the rest of the method is the same)
        AppointmentStatusDto appointmentStatus = webClientBuilder.build().get()
                .uri("http://CONSULTATION-SERVICE/api/consultations/{id}/status", dto.appointmentId())
                .retrieve()
                .bodyToMono(AppointmentStatusDto.class)
                .block();

        if (appointmentStatus == null) {
            throw new RuntimeException("Appointment not found.");
        }
        if (!appointmentStatus.patientId().equals(patientId)) {
            throw new SecurityException("You can only review your own appointments.");
        }
        if (!"COMPLETED".equals(appointmentStatus.status().name())) {
            throw new IllegalStateException("You can only review completed appointments.");
        }

        // Step 2: Save the review
        DoctorReview review = new DoctorReview();
        review.setAppointmentId(dto.appointmentId());
        review.setDoctorId(dto.doctorId());
        review.setPatientId(patientId);
        review.setRating(dto.rating());
        review.setComment(dto.comment());
        reviewRepository.save(review);

        // Step 3: Update the doctor's average rating
        Doctor doctor = doctorRepository.findById(dto.doctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found."));

        int oldRatingCount = doctor.getRatingCount();
        BigDecimal oldTotalRating = doctor.getAverageRating().multiply(new BigDecimal(oldRatingCount));

        int newRatingCount = oldRatingCount + 1;
        BigDecimal newTotalRating = oldTotalRating.add(new BigDecimal(dto.rating()));
        BigDecimal newAverageRating = newTotalRating.divide(new BigDecimal(newRatingCount), 2, RoundingMode.HALF_UP);

        doctor.setRatingCount(newRatingCount);
        doctor.setAverageRating(newAverageRating);
        doctorRepository.save(doctor);

        return review;
    }

    public List<DoctorReviewDto> getReviewsForDoctor(UUID doctorId) {
        List<DoctorReview> reviews = reviewRepository.findByDoctorIdOrderByReviewDateDesc(doctorId);
        if (reviews.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> patientIds = reviews.stream().map(DoctorReview::getPatientId).distinct().toList();

        // Fetch patient details from auth-service to display their names
        Map<UUID, UserDetailDto> userDetailsMap = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .bodyValue(patientIds)
                .retrieve()
                .bodyToFlux(UserDetailDto.class)
                .collectMap(UserDetailDto::id)
                .block();

        return reviews.stream()
                .map(review -> {
                    UserDetailDto patient = userDetailsMap.get(review.getPatientId());
                    return new DoctorReviewDto(review, patient);
                })
                .filter(dto -> dto.patientDetails() != null)
                .toList();
    }

    // A simple DTO for the cross-service call, place it at the bottom of the file
    private record AppointmentStatusDto(UUID appointmentId, UUID patientId, Status status) {
        enum Status { SCHEDULED, AWAITING_REPORT, READY, COMPLETED, CANCELLED, PENDING_PAYMENT }
    }

}