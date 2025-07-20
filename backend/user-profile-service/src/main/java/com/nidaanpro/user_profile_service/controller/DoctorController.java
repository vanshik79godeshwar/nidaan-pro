package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.model.Doctor;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final UserProfileService userProfileService;

    public DoctorController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> findDoctors(
            @RequestParam(required = false) Integer specialityId) {
        List<Doctor> doctors = userProfileService.findDoctors(specialityId);
        return ResponseEntity.ok(doctors);
    }
}
