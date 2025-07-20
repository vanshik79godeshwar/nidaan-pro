package com.nidaanpro.auth_service.service;


import com.nidaanpro.auth_service.dto.LoginRequestDto;
import com.nidaanpro.auth_service.dto.RegisterUserDto;
import com.nidaanpro.auth_service.model.User;
import com.nidaanpro.auth_service.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerUser(RegisterUserDto dto) {
        User newUser = new User();
        newUser.setFullName(dto.fullName());
        newUser.setEmail(dto.email());
        newUser.setPasswordHash(passwordEncoder.encode(dto.password()));
        newUser.setRole(User.Role.valueOf(dto.role().toUpperCase()));
        return userRepository.save(newUser);
    }

    public String login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + dto.email()));

        if (!passwordEncoder.matches(dto.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }
        return jwtService.generateToken(user.getId(), user.getRole().name());
    }
}