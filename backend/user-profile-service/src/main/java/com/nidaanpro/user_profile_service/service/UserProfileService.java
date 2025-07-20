package com.nidaanpro.user_profile_service.service;

import com.nidaanpro.user_profile_service.dto.CreateDoctorProfileDto;
import com.nidaanpro.user_profile_service.dto.CreatePatientProfileDto;
import com.nidaanpro.user_profile_service.dto.CreateSpecialityDto;
import com.nidaanpro.user_profile_service.model.Doctor;
import com.nidaanpro.user_profile_service.model.DoctorSpeciality;
import com.nidaanpro.user_profile_service.model.Patient;
import com.nidaanpro.user_profile_service.repo.DoctorRepository;
import com.nidaanpro.user_profile_service.repo.DoctorSpecialityRepository;
import com.nidaanpro.user_profile_service.repo.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserProfileService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorSpecialityRepository specialityRepository; // <-- ADD THIS

    // <-- UPDATE THE CONSTRUCTOR
    public UserProfileService(DoctorRepository doctorRepository, PatientRepository patientRepository, DoctorSpecialityRepository specialityRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.specialityRepository = specialityRepository;
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
}
