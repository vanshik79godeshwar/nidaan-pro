// backend/consultation-service/src/main/java/com/nidaanpro/consultation_service/model/PreConsultationReport.java
package com.nidaanpro.consultationservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;
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

    // --- THIS IS THE FIX: Re-add the old field ---
    @Column(nullable = false, columnDefinition = "TEXT")
    private String problemBrief;

    // --- New Fields ---
    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String staticQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String dynamicQuestions;

    @Column(columnDefinition = "TEXT")
    private String detailedDescription;

    @Column(columnDefinition = "TEXT")
    private String currentMedications;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> attachmentUrls;

    @Column(columnDefinition = "TEXT")
    private String generatedReportText;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}