package com.nidaanpro.consultation_service.repo;

import com.nidaanpro.consultation_service.model.PreConsultationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PreConsultationReportRepository extends JpaRepository<PreConsultationReport, UUID> {
    Optional<PreConsultationReport> findByAppointmentId(UUID appointmentId);
}