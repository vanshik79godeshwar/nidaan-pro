// backend/consultation-service/src/main/java/com/nidaanpro/consultation_service/dto/SubmitReportDto.java
package com.nidaanpro.consultation_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

// Using a record for concise, immutable data transfer
public record SubmitReportDto(
        @NotNull UUID appointmentId,
        @NotBlank String chiefComplaint,
        String staticQuestions, // Will be a JSON string from the frontend
        String dynamicQuestions, // Will be a JSON string from the frontend
        String detailedDescription,
        String currentMedications,
        List<String> attachmentUrls
) {}