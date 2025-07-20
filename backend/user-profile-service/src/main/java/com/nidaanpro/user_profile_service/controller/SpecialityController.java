package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.CreateSpecialityDto;
import com.nidaanpro.user_profile_service.model.DoctorSpeciality;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialities")
public class SpecialityController {

    private final UserProfileService userProfileService;

    public SpecialityController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping
    public ResponseEntity<DoctorSpeciality> createSpeciality(@Valid @RequestBody CreateSpecialityDto dto) {
        DoctorSpeciality newSpeciality = userProfileService.createSpeciality(dto);
        return new ResponseEntity<>(newSpeciality, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DoctorSpeciality>> getAllSpecialities() {
        List<DoctorSpeciality> specialities = userProfileService.getAllSpecialities();
        return ResponseEntity.ok(specialities);
    }
}
