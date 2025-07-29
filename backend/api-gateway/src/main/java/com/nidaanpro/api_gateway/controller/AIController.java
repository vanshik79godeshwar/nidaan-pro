package com.nidaanpro.api_gateway.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

// Import Java's built-in HTTP client
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    // --- We no longer inject WebClient ---

    @PostMapping("/dynamic-questions")
    public Mono<ResponseEntity<String>> getDynamicQuestions(@RequestBody JsonNode requestBody) {
        String modelName = "gemini-1.5-flash-latest";
        String chiefComplaint = requestBody.path("chiefComplaint").asText();
        String symptomDuration = requestBody.path("symptomDuration").asText();
        int symptomSeverity = requestBody.path("symptomSeverity").asInt();

        String prompt = String.format(
                "You are a Medical Triage Assistant. A patient has provided initial symptoms: " +
                        "Chief Complaint: '%s'. Duration: '%s'. Severity (1-10): '%d'. " +
                        "Generate 3 relevant follow-up questions to help a doctor. " +
                        "IMPORTANT: Respond ONLY with a valid, minified JSON array of strings. " +
                        "Example: [\"Do you have a fever?\",\"Is there any associated rash?\"]",
                chiefComplaint, symptomDuration, symptomSeverity
        );

        ObjectNode rootNode = objectMapper.createObjectNode();
        ObjectNode content = rootNode.putObject("contents").putArray("parts").addObject().put("text", prompt);

        try {
            // --- THIS IS THE NEW, RELIABLE METHOD ---
            // 1. Create a standard Java HttpClient
            HttpClient client = HttpClient.newHttpClient();
            String uri = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName.trim(), apiKey);

            // 2. Build the request, just like our curl command
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(rootNode.toString()))
                    .build();

            // 3. Send the request and get the response
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // 4. Process the response
            if (response.statusCode() == 200) {
                JsonNode responseJson = objectMapper.readTree(response.body());
                String rawText = responseJson.at("/candidates/0/content/parts/0/text").asText();
                String cleanedJson = rawText.replace("```json", "").replace("```", "").trim();
                return Mono.just(ResponseEntity.ok(cleanedJson));
            } else {
                logger.error("Error from Gemini API - Status: {}, Body: {}", response.statusCode(), response.body());
                return Mono.just(ResponseEntity.status(response.statusCode()).body(response.body()));
            }

        } catch (Exception e) {
            logger.error("!!! Critical Error calling Gemini API: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(500).body("Error communicating with AI service."));
        }
    }
}