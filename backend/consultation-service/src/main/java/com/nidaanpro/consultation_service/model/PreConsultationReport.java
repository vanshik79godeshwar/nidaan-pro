package com.nidaanpro.consultation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "pre_consultation_reports")
public class PreConsultationReport {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID appointmentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problemBrief;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String dynamicQaSummary;

    @Column(columnDefinition = "TEXT")
    private String generatedReportText;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}