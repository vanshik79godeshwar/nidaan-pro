package com.nidaanpro.consultationservice.repo;

import com.nidaanpro.consultationservice.model.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, UUID> {
    // Find all pending requests for a specific speciality
    List<EmergencyRequest> findBySpecialityIdAndStatus(Integer specialityId, EmergencyRequest.RequestStatus status);
    Optional<EmergencyRequest> findByPatientIdAndStatus(UUID patientId, EmergencyRequest.RequestStatus status);
}