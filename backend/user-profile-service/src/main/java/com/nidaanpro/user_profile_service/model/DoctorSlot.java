package com.nidaanpro.user_profile_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "doctor_slots")
public class DoctorSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private Instant slotTime;

    @Column(nullable = false)
    private boolean isBooked = false;
}