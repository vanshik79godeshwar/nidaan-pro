package com.nidaanpro.consultation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "report_attachments")
public class ReportAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID reportId;

    @Column(nullable = false)
    private String fileUrl;

    private String fileType;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();
}