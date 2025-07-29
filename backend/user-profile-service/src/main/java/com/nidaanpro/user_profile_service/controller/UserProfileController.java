package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.CreateDoctorProfileDto;
import com.nidaanpro.user_profile_service.dto.CreatePatientProfileDto;
import com.nidaanpro.user_profile_service.dto.UserDetailDto;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/doctor")
    public ResponseEntity<?> createDoctorProfile(@Valid @RequestBody CreateDoctorProfileDto dto) {
        return new ResponseEntity<>(userProfileService.createDoctorProfile(dto), HttpStatus.CREATED);
    }

    @PostMapping("/patient")
    public ResponseEntity<?> createPatientProfile(@Valid @RequestBody CreatePatientProfileDto dto) {
        return new ResponseEntity<>(userProfileService.createPatientProfile(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable UUID userId) {
        // This method will now exist in the service
        return userProfileService.getProfileByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/details")
    public ResponseEntity<List<UserDetailDto>> getUserDetails(@RequestBody List<UUID> userIds) {
        // This endpoint now exists and will delegate the work to the service
        List<UserDetailDto> userDetails = userProfileService.findUserDetailsByIds(userIds);
        return ResponseEntity.ok(userDetails);
    }
}