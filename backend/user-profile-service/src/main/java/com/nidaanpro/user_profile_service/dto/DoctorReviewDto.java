package com.nidaanpro.user_profile_service.dto;

import com.nidaanpro.user_profile_service.model.DoctorReview;

// DTO to combine review with patient details
public record DoctorReviewDto(
        DoctorReview review,
        UserDetailDto patientDetails
) {}