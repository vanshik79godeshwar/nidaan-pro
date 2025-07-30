package com.nidaanpro.consultationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class VideoCallService {

    private final WebClient webClient;

    @Value("${hms.management.token}")
    private String managementToken;

    @Value("${hms.room.id}")
    private String roomId;

    public VideoCallService(@Qualifier("externalWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    // This method now correctly generates a temporary Room Code
    public Mono<String> generateRoomCode() {
        // This is the correct, verified API endpoint from the 100ms documentation
        String url = String.format("/v2/room-codes/room/%s/role/host", this.roomId);

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + managementToken)
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(responseJson -> responseJson.path("code").asText()); // We extract the 'code' from the response
    }
}