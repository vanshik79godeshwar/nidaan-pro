package com.nidaanpro.user_profile_service.service;

import com.nidaanpro.user_profile_service.dto.*;
import com.nidaanpro.user_profile_service.model.Doctor;
import com.nidaanpro.user_profile_service.model.DoctorSpeciality;
import com.nidaanpro.user_profile_service.model.Patient;
import com.nidaanpro.user_profile_service.repo.DoctorRepository;
import com.nidaanpro.user_profile_service.repo.DoctorSpecialityRepository;
import com.nidaanpro.user_profile_service.repo.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserProfileService {



    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorSpecialityRepository specialityRepository; // <-- ADD THIS
    private final WebClient.Builder webClientBuilder;
    // <-- UPDATE THE CONSTRUCTOR
    public UserProfileService(DoctorRepository doctorRepository, PatientRepository patientRepository, DoctorSpecialityRepository specialityRepository, WebClient.Builder webClientBuilder) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.specialityRepository = specialityRepository;
        this.webClientBuilder = webClientBuilder;
    }

    public Doctor createDoctorProfile(CreateDoctorProfileDto dto) {
        Doctor doctor = new Doctor();
        doctor.setUserId(dto.userId());
        doctor.setSpecialityId(dto.specialityId());
        doctor.setMedicalLicenseNumber(dto.medicalLicenseNumber());
        doctor.setBio(dto.bio());
        doctor.setYearsOfExperience(dto.yearsOfExperience());
        doctor.setConsultationFee(dto.consultationFee());
        return doctorRepository.save(doctor);
    }

    public Patient createPatientProfile(CreatePatientProfileDto dto) {
        Patient patient = new Patient();
        patient.setUserId(dto.userId());
        patient.setDateOfBirth(dto.dateOfBirth());
        if (dto.gender() != null) {
            patient.setGender(Patient.Gender.valueOf(dto.gender().toUpperCase()));
        }
        patient.setAddress(dto.address());
        return patientRepository.save(patient);
    }

    public Optional<?> getProfileByUserId(UUID userId) {
        Optional<Doctor> doctor = doctorRepository.findById(userId);
        if (doctor.isPresent()) {
            return doctor;
        }
        return patientRepository.findById(userId);
    }

    // <-- ADD THIS METHOD
    public DoctorSpeciality createSpeciality(CreateSpecialityDto dto) {
        DoctorSpeciality speciality = new DoctorSpeciality();
        speciality.setName(dto.name());
        speciality.setDescription(dto.description());
        return specialityRepository.save(speciality);
    }

    // <-- AND ADD THIS METHOD
    public List<DoctorSpeciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    public List<DoctorDetailDto> findDoctors(Integer specialityId) {
        // 1. Get doctor profiles from our DB
        List<Doctor> doctors = (specialityId != null)
                ? doctorRepository.findBySpecialityId(specialityId)
                : doctorRepository.findAll();

        if (doctors.isEmpty()) {
            return List.of();
        }

        // 2. Get a list of their user IDs
        List<UUID> userIds = doctors.stream().map(Doctor::getUserId).toList();

        // 3. Call auth-service to get user details
        Map<UUID, UserDto> userDtoMap = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details") // Eureka finds the service
                .body(Mono.just(userIds), List.class)
                .retrieve()
                .bodyToFlux(UserDto.class)
                .collectMap(UserDto::id)
                .block(); // .block() makes the async call synchronous

        // 4. Combine the data
        return doctors.stream()
                .map(doctor -> {
                    UserDto user = userDtoMap.get(doctor.getUserId());
                    return new DoctorDetailDto(doctor, user.fullName(), user.email());
                })
                .collect(Collectors.toList());
    }
}
