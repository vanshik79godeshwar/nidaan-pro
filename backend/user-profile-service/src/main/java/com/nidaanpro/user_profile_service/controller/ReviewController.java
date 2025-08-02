package com.nidaanpro.user_profile_service.controller;

import com.nidaanpro.user_profile_service.dto.DoctorReviewDto;
import com.nidaanpro.user_profile_service.dto.SubmitReviewDto;
import com.nidaanpro.user_profile_service.model.DoctorReview;
import com.nidaanpro.user_profile_service.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final UserProfileService userProfileService;

    public ReviewController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping
    public ResponseEntity<DoctorReview> submitReview(
            // --- THIS IS THE FIX ---
            // Change the type from UUID to String
            @RequestHeader("X-User-Id") String patientId,
            @Valid @RequestBody SubmitReviewDto dto
    ) {
        DoctorReview newReview = userProfileService.submitReview(patientId, dto);
        return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorReviewDto>> getReviewsForDoctor(@PathVariable UUID doctorId) {
        List<DoctorReviewDto> reviews = userProfileService.getReviewsForDoctor(doctorId);
        return ResponseEntity.ok(reviews);
    }
}