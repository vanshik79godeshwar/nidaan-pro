package com.nidaanpro.auth_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "registration_otps")
public class RegistrationOtp {
    @Id
    private String email;
    private String otpCode;
    private Instant otpExpiry;
}