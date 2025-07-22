package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.DoctorDetailDto;
import com.nidaanpro.user_profile_service.dto.DoctorScheduleDto;
import com.nidaanpro.user_profile_service.model.DoctorSchedule;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @PostMapping("/{doctorId}/schedule")
    public ResponseEntity<DoctorSchedule> setSchedule(@PathVariable UUID doctorId, @RequestBody DoctorScheduleDto dto) {
        // In a real app, you'd verify the logged-in user is this doctor
        DoctorSchedule schedule = userProfileService.setDoctorSchedule(dto);
        return new ResponseEntity<>(schedule, HttpStatus.CREATED);
    }

    @GetMapping("/{doctorId}/schedule")
    public ResponseEntity<List<DoctorSchedule>> getSchedule(@PathVariable UUID doctorId) {
        List<DoctorSchedule> schedule = userProfileService.getDoctorSchedule(doctorId);
        return ResponseEntity.ok(schedule);
    }
}