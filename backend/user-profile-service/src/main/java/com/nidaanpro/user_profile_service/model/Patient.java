// backend/user-profile-service/src/main/java/com/nidaanpro/user_profile_service/model/Patient.java
package com.nidaanpro.user_profile_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    private UUID userId; // This links directly to the User ID from auth-service

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String emergencyContactName;

    private String emergencyContactPhone;

    // --- ADD THIS LINE ---
    private String profilePictureUrl;

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
}