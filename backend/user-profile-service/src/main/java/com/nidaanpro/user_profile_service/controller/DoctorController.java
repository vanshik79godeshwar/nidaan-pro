package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.DoctorDetailDto;
import com.nidaanpro.user_profile_service.dto.DoctorSlotDto;
import com.nidaanpro.user_profile_service.model.DoctorSlot;
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
    public ResponseEntity<List<DoctorDetailDto>> findDoctors(@RequestParam(required = false) Integer specialityId) {
        return ResponseEntity.ok(userProfileService.findDoctors(specialityId));
    }

    @PostMapping("/{doctorId}/slots")
    public ResponseEntity<DoctorSlot> addSlot(@RequestBody DoctorSlotDto dto) {
        return new ResponseEntity<>(userProfileService.addDoctorSlot(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<DoctorSlot>> getSlots(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(userProfileService.getDoctorAvailableSlots(doctorId));
    }

    @PostMapping("/slots/{slotId}/book")
    public ResponseEntity<DoctorSlot> bookSlot(@PathVariable UUID slotId) {
        try {
            DoctorSlot bookedSlot = userProfileService.bookSlot(slotId);
            return ResponseEntity.ok(bookedSlot);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}