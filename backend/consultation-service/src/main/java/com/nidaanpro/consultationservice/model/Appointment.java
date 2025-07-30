package com.nidaanpro.consultationservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private Instant appointmentTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationType consultationType = ConsultationType.SCHEDULED;

    private String consultationUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum Status {
        SCHEDULED,
        AWAITING_REPORT,
        READY,
        COMPLETED,
        CANCELLED,
        PENDING_PAYMENT // <-- Add this line
    }

    public enum ConsultationType {
        SCHEDULED,
        EMERGENCY
    }
}