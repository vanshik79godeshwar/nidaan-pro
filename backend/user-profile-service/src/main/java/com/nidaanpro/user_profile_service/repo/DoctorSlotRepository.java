package com.nidaanpro.user_profile_service.repo;

import com.nidaanpro.user_profile_service.model.DoctorSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, UUID> {
    List<DoctorSlot> findByDoctorIdAndIsBookedFalseAndSlotTimeAfterOrderBySlotTimeAsc(UUID doctorId, Instant currentTime);
    Optional<DoctorSlot> findByIdAndIsBookedFalse(UUID slotId);
}