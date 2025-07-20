package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.DoctorDetailDto;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final UserProfileService userProfileService;

    public DoctorController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<List<DoctorDetailDto>> findDoctors(
            @RequestParam(required = false) Integer specialityId) {
        List<DoctorDetailDto> doctors = userProfileService.findDoctors(specialityId);
        return ResponseEntity.ok(doctors);
    }
}