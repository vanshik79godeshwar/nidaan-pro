package com.nidaanpro.consultation_service.repo;

import com.nidaanpro.consultation_service.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // JPQL query to check if an appointment exists between two users, regardless of who is patient/doctor
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE " +
            "(a.patientId = :userId1 AND a.doctorId = :userId2) OR " +
            "(a.patientId = :userId2 AND a.doctorId = :userId1)")
    boolean existsByPatientIdAndDoctorId(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2
    );
}