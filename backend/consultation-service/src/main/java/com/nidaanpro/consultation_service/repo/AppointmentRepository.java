package com.nidaanpro.consultation_service.repo;

import com.nidaanpro.consultation_service.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
}