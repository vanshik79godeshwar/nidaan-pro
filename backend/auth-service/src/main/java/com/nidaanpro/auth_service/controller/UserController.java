package com.nidaanpro.auth_service.controller;

import com.nidaanpro.auth_service.dto.UserDto;
import com.nidaanpro.auth_service.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // This is the endpoint that other services will call.
    @PostMapping("/details")
    public ResponseEntity<List<UserDto>> getUserDetails(@RequestBody List<UUID> userIds) {
        List<UserDto> userDtos = userRepository.findByIdIn(userIds).stream()
                .map(user -> new UserDto(user.getId(), user.getFullName(), user.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }
}