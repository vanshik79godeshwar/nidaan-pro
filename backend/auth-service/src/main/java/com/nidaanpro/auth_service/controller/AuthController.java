package com.nidaanpro.auth_service.controller;


import com.nidaanpro.auth_service.dto.LoginRequestDto;
import com.nidaanpro.auth_service.dto.LoginResponseDto;
import com.nidaanpro.auth_service.dto.RegisterUserDto;
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

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterUserDto dto) {
        User registeredUser = authService.registerUser(dto);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto dto) {
        String token = authService.login(dto);
        return ResponseEntity.ok(new LoginResponseDto(token));
    }
}
