package com.nidaanpro.consultationservice.repo;

import com.nidaanpro.consultationservice.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;
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

    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(UUID patientId);

    @Query("SELECT DISTINCT CASE WHEN a.patientId = :userId THEN a.doctorId ELSE a.patientId END FROM Appointment a WHERE a.patientId = :userId OR a.doctorId = :userId")
    List<UUID> findDistinctChatPartnersByUserId(@Param("userId") UUID userId);


    List<Appointment> findByDoctorIdOrderByAppointmentTimeDesc(UUID doctorId);

    Optional<Appointment> findById(UUID appointmentId);

    @Query("SELECT a FROM Appointment a WHERE (a.patientId = :patientId AND a.doctorId = :doctorId) OR (a.patientId = :doctorId AND a.doctorId = :patientId) ORDER BY a.appointmentTime DESC")
    List<Appointment> findAppointmentHistory(@Param("patientId") UUID patientId, @Param("doctorId") UUID doctorId);
}