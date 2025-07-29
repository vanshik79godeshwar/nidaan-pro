package com.nidaanpro.consultation_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nidaanpro.consultation_service.dto.DynamicQuestionsRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model-name}")
    private String modelName;

    // --- THIS IS THE FINAL FIX ---
    // The constructor NO LONGER injects a WebClient.Builder.
    // It creates its own, dedicated, non-load-balanced WebClient instance.
    public GeminiService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateDynamicQuestions(DynamicQuestionsRequestDto requestDto) {
        String prompt = String.format(
                "You are a Medical Triage Assistant. A patient has provided initial symptoms: " +
                        "Chief Complaint: '%s'. Duration: '%s'. Severity (1-10): '%d'. " +
                        "Generate 3 relevant follow-up questions to help a doctor. " +
                        "IMPORTANT: Respond ONLY with a valid, minified JSON array of strings. " +
                        "Example: [\"Do you have a fever?\",\"Is there any associated rash?\"]",
                requestDto.chiefComplaint(),
                requestDto.symptomDuration(),
                requestDto.symptomSeverity()
        );

        ObjectNode rootNode = objectMapper.createObjectNode();
        ArrayNode contentsNode = objectMapper.createArrayNode();
        ObjectNode content = objectMapper.createObjectNode();
        ArrayNode partsNode = objectMapper.createArrayNode();
        ObjectNode part = objectMapper.createObjectNode();
        part.put("text", prompt);
        partsNode.add(part);
        content.set("parts", partsNode);
        contentsNode.add(content);
        rootNode.set("contents", contentsNode);

        try {
            String uriPath = String.format("/v1beta/models/%s:generateContent?key=%s", modelName.trim(), apiKey);

            String response = this.webClient.post() // Use the service's own webClient instance
                    .uri(uriPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(rootNode.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseJson = objectMapper.readTree(response);
            JsonNode textNode = responseJson.at("/candidates/0/content/parts/0/text");

            return textNode.isMissingNode() ? "[]" : textNode.asText();

        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return "[]";
        }
    }
}