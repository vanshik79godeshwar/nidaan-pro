package com.nidaanpro.auth_service.service;

import com.nidaanpro.auth_service.dto.*;
import com.nidaanpro.auth_service.model.RegistrationOtp;
import com.nidaanpro.auth_service.model.User;
import com.nidaanpro.auth_service.repo.RegistrationOtpRepository; // <-- IMPORT
import com.nidaanpro.auth_service.repo.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RegistrationOtpRepository registrationOtpRepository; // <-- ADD THIS FIELD
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RabbitTemplate rabbitTemplate;

    // <-- UPDATE THE CONSTRUCTOR TO INCLUDE THE NEW REPOSITORY
    public AuthService(UserRepository userRepository, RegistrationOtpRepository registrationOtpRepository, PasswordEncoder passwordEncoder, JwtService jwtService, RabbitTemplate rabbitTemplate) {
        this.userRepository = userRepository;
        this.registrationOtpRepository = registrationOtpRepository; // <-- ADD THIS LINE
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rabbitTemplate = rabbitTemplate;
    }

    // --- REGISTRATION LOGIC ---
    public void requestRegistrationOtp(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }
        String otp = new DecimalFormat("000000").format(new SecureRandom().nextInt(999999));

        RegistrationOtp registrationOtp = new RegistrationOtp();
        registrationOtp.setEmail(email);
        registrationOtp.setOtpCode(otp);
        registrationOtp.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
        registrationOtpRepository.save(registrationOtp);

        String message = email + ":" + otp;
        rabbitTemplate.convertAndSend("user-registration-exchange", "user.registered", message);
    }

    @Transactional
    public User verifyAndRegisterUser(RegisterUserDto dto, String otp) {
        RegistrationOtp registrationOtp = registrationOtpRepository.findById(dto.email())
                .orElseThrow(() -> new RuntimeException("No OTP request found for this email."));

        if (!registrationOtp.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP.");
        }
        if (registrationOtp.getOtpExpiry().isBefore(Instant.now())) {
            throw new RuntimeException("OTP has expired.");
        }

        User newUser = new User();
        newUser.setFullName(dto.fullName());
        newUser.setEmail(dto.email());
        newUser.setPasswordHash(passwordEncoder.encode(dto.password()));
        newUser.setRole(User.Role.valueOf(dto.role().name()));

        registrationOtpRepository.delete(registrationOtp);
        return userRepository.save(newUser);
    }

    // --- LOGIN LOGIC ---
    public String login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }
        return jwtService.generateToken(user.getId(), user.getRole().name());
    }

    // --- FORGOT PASSWORD LOGIC ---
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);

        String message = user.getEmail() + ":" + token;
        rabbitTemplate.convertAndSend("password-reset-exchange", "password.reset.request", message);
    }

    @Transactional
    public void resetPasswordWithToken(PasswordResetTokenDto dto) {
        User user = userRepository.findByResetToken(dto.token())
                .orElseThrow(() -> new RuntimeException("Invalid reset token."));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}