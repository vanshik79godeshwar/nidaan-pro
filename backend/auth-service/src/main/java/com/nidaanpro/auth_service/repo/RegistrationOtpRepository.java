package com.nidaanpro.auth_service.repo;

import com.nidaanpro.auth_service.model.RegistrationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtp, String> {}