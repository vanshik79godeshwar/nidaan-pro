package com.nidaanpro.user_profile_service.repo;

import com.nidaanpro.user_profile_service.model.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorReviewRepository extends JpaRepository<DoctorReview, UUID> {
    // We'll add a method to find all reviews for a specific doctor
    List<DoctorReview> findByDoctorIdOrderByReviewDateDesc(UUID doctorId);
}