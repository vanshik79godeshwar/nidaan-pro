package com.nidaanpro.consultationservice.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// This 'record' is a modern Java class that defines the expected structure of the JSON.
public record SubmitReportDto(
        @NotNull
        UUID appointmentId,

        String chiefComplaint,

        // --- THIS IS THE FIX ---
        // This now correctly tells Java to expect a JSON object (a "Map") for staticQuestions,
        // which matches what the frontend is sending.
        Map<String, String> staticQuestions,

        Map<String, String> dynamicQuestions,

        String detailedDescription,

        List<String> currentMedications,

        List<String> attachmentUrls
) {}