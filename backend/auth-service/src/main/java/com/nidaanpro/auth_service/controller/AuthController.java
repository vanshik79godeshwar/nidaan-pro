package com.nidaanpro.auth_service.controller;

import com.nidaanpro.auth_service.dto.*;
import com.nidaanpro.auth_service.model.User;
import com.nidaanpro.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTRATION FLOW
    @PostMapping("/register/request-otp")
    public ResponseEntity<String> requestRegistrationOtp(@Valid @RequestBody OtpRequestDto dto) {
        authService.requestRegistrationOtp(dto.email());
        return ResponseEntity.ok("OTP has been sent to your email.");
    }

    @PostMapping("/register/verify")
    public ResponseEntity<User> verifyAndRegister(@Valid @RequestBody VerifyRegistrationDto dto) {
        User registeredUser = authService.verifyAndRegisterUser(dto.userDetails(), dto.otp());
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto dto) {
        String token = authService.login(dto);
        return ResponseEntity.ok(new LoginResponseDto(token));
    }

    // FORGOT PASSWORD FLOW
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody OtpRequestDto dto) {
        authService.generatePasswordResetToken(dto.email());
        return ResponseEntity.ok("If an account exists, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetTokenDto dto) {
        authService.resetPasswordWithToken(dto);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}