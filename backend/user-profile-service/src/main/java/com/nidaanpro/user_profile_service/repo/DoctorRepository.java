package com.nidaanpro.user_profile_service.repo;

import com.nidaanpro.user_profile_service.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // <-- ADD THIS IMPORT
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    // <-- ADD THIS METHOD
    List<Doctor> findBySpecialityId(Integer specialityId);
}