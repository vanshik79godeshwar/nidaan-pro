package com.nidaanpro.user_profile_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    private UUID userId; // This links directly to the User ID from auth-service

    @Column(nullable = false)
    private Integer specialityId;

    @Column(nullable = false, unique = true)
    private String medicalLicenseNumber;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    private boolean isVerified = false;

    @Column(nullable = false)
    private BigDecimal consultationFee;

    @Column(nullable = false)
    private BigDecimal averageRating = BigDecimal.valueOf(0.00);

    @Column(nullable = false)
    private Integer ratingCount = 0;

    private String profilePictureUrl;

    private String headerPictureUrl;

    @Column(nullable = false)
    private boolean availableForEmergency = false;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.OFFLINE;

    public enum AvailabilityStatus {
        ONLINE,
        OFFLINE,
        IN_CONSULTATION
    }
}
