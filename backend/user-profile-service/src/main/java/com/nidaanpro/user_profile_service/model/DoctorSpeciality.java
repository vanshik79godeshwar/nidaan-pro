package com.nidaanpro.user_profile_service.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "doctor_specialities")
public class DoctorSpeciality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
