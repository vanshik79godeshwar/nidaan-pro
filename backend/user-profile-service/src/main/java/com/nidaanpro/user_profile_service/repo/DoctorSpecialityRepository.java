package com.nidaanpro.user_profile_service.repo;


import com.nidaanpro.user_profile_service.model.DoctorSpeciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorSpecialityRepository extends JpaRepository<DoctorSpeciality, Integer> {
}
