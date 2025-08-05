package com.nidaanpro.consultationservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "emergency_requests")
public class EmergencyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private Integer specialityId;

    @Column(nullable = false)
    private String patientName; // Denormalized for easy notification messages

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private UUID assignedDoctorId; // Will be set when a doctor accepts

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum RequestStatus {
        PENDING_PAYMENT,
        PENDING, // Waiting for a doctor to accept
        ACCEPTED, // A doctor has accepted the request
        COMPLETED, // The consultation is finished
        CANCELLED // The patient cancelled the request
    }
}