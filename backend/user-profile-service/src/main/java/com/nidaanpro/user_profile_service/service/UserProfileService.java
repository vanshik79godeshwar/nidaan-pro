package com.nidaanpro.user_profile_service.service;

import com.nidaanpro.user_profile_service.dto.*;
import com.nidaanpro.user_profile_service.model.Doctor;
import com.nidaanpro.user_profile_service.model.DoctorSchedule;
import com.nidaanpro.user_profile_service.model.DoctorSpeciality;
import com.nidaanpro.user_profile_service.model.Patient;
import com.nidaanpro.user_profile_service.repo.DoctorRepository;
import com.nidaanpro.user_profile_service.repo.DoctorScheduleRepository;
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
    private final DoctorSpecialityRepository specialityRepository;
    private final DoctorScheduleRepository doctorScheduleRepository; // <-- Add this
    private final WebClient.Builder webClientBuilder;

    // <-- Update the constructor
    public UserProfileService(DoctorRepository doctorRepository, PatientRepository patientRepository, DoctorSpecialityRepository specialityRepository, DoctorScheduleRepository doctorScheduleRepository, WebClient.Builder webClientBuilder) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.specialityRepository = specialityRepository;
        this.doctorScheduleRepository = doctorScheduleRepository; // <-- Add this
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
        Optional<Doctor> doctorOpt = doctorRepository.findById(userId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            UserDto userDto = webClientBuilder.build().post()
                    .uri("http://AUTH-SERVICE/api/users/details")
                    .body(Mono.just(List.of(doctor.getUserId())), List.class)
                    .retrieve()
                    .bodyToFlux(UserDto.class)
                    .blockFirst();

            if (userDto != null) {
                return Optional.of(new DoctorDetailDto(doctor, userDto.fullName(), userDto.email()));
            }
            return Optional.of(new DoctorDetailDto(doctor, null, null));
        }
        return patientRepository.findById(userId);
    }

    public DoctorSpeciality createSpeciality(CreateSpecialityDto dto) {
        DoctorSpeciality speciality = new DoctorSpeciality();
        speciality.setName(dto.name());
        speciality.setDescription(dto.description());
        return specialityRepository.save(speciality);
    }

    public List<DoctorSpeciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    public List<DoctorDetailDto> findDoctors(Integer specialityId) {
        List<Doctor> doctors = (specialityId != null)
                ? doctorRepository.findBySpecialityId(specialityId)
                : doctorRepository.findAll();

        if (doctors.isEmpty()) {
            return List.of();
        }

        List<UUID> userIds = doctors.stream().map(Doctor::getUserId).toList();
        Map<UUID, UserDto> userDtoMap = webClientBuilder.build().post()
                .uri("http://AUTH-SERVICE/api/users/details")
                .body(Mono.just(userIds), List.class)
                .retrieve()
                .bodyToFlux(UserDto.class)
                .collectMap(UserDto::id)
                .block();

        return doctors.stream()
                .map(doctor -> {
                    UserDto user = userDtoMap.get(doctor.getUserId());
                    return new DoctorDetailDto(doctor, user != null ? user.fullName() : null, user != null ? user.email() : null);
                })
                .collect(Collectors.toList());
    }

    // --- NEW METHODS FOR DOCTOR SCHEDULE ---

    public DoctorSchedule setDoctorSchedule(DoctorScheduleDto dto) {
        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctorId(dto.doctorId());
        schedule.setDayOfWeek(dto.dayOfWeek());
        schedule.setStartTime(dto.startTime());
        schedule.setEndTime(dto.endTime());
        return doctorScheduleRepository.save(schedule);
    }

    public List<DoctorSchedule> getDoctorSchedule(UUID doctorId) {
        return doctorScheduleRepository.findByDoctorId(doctorId);
    }
}