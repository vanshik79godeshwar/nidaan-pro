package com.nidaanpro.api_gateway.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

record DynamicQuestionsRequestDto(String chiefComplaint, int age, String gender) {}
record GeminiRequest(List<Content> contents) {}
record Content(List<Part> parts) {}
record Part(String text) {}
record GeminiResponse(List<Candidate> candidates) {}
record Candidate(Content content) {}


@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    public AIController(@Qualifier("geminiWebClient") WebClient geminiWebClient) {
        this.geminiWebClient = geminiWebClient;
    }

    @PostMapping("/dynamic-questions")
    public Mono<String> getDynamicQuestions(@RequestBody DynamicQuestionsRequestDto requestDto) {
        // A much stricter and more detailed prompt
        String prompt = String.format(
                "You are a medical assistant bot. Your task is to generate 3-4 relevant medical questions based on a patient's chief complaint. " +
                        "The patient's chief complaint is: \"%s\". The patient's age is %d and gender is %s. " +
                        "IMPORTANT RULES: " +
                        "1. ONLY return a raw JSON object. " +
                        "2. Do NOT include ```json markdown wrappers, any explanatory text, or comments. " +
                        "3. The JSON object MUST contain a single key named 'dynamicQuestions'. " +
                        "4. The value of 'dynamicQuestions' MUST be an array of strings, where each string is a question. " +
                        "Example of a perfect response: {\"dynamicQuestions\": [\"How long have you had this symptom?\", \"Is the pain sharp or dull?\"]}",
                requestDto.chiefComplaint(), requestDto.age(), requestDto.gender()
        );

        GeminiRequest geminiRequest = new GeminiRequest(List.of(new Content(List.of(new Part(prompt)))));

        return geminiWebClient.post()
                .bodyValue(geminiRequest)
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .flatMap(this::extractAndCleanJson)
                .doOnError(error -> logger.error("Error calling Gemini API in API Gateway: {}", error.getMessage()));
    }

    // New method to reliably find and parse the JSON from the LLM's response
    private Mono<String> extractAndCleanJson(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            logger.error("Received empty or invalid response from Gemini API.");
            return Mono.error(new RuntimeException("AI service returned an empty response."));
        }

        String rawContent = response.candidates().get(0).content().parts().get(0).text();
        logger.info("Raw response from Gemini: {}", rawContent);

        Pattern pattern = Pattern.compile("```json\\s*([\\s\\S]*?)\\s*```|(\\{[\\s\\S]*\\})");
        Matcher matcher = pattern.matcher(rawContent);

        if (matcher.find()) {
            String jsonString = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);

            try {
                objectMapper.readTree(jsonString); // Validate that it's proper JSON
                logger.info("Successfully extracted and validated JSON: {}", jsonString);
                return Mono.just(jsonString);
            } catch (JsonProcessingException e) {
                logger.error("Failed to parse extracted JSON string: {}", jsonString, e);
                return Mono.error(new RuntimeException("AI service returned malformed JSON."));
            }
        } else {
            logger.error("No JSON block found in the raw Gemini response: {}", rawContent);
            return Mono.error(new RuntimeException("AI service did not return a valid JSON structure."));
        }
    }
}