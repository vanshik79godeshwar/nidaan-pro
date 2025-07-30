package com.nidaanpro.consultationservice.controller;

import com.nidaanpro.consultationservice.service.VideoCallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/consultations/video")
public class VideoCallController {

    private final VideoCallService videoCallService;

    public VideoCallController(VideoCallService videoCallService) {
        this.videoCallService = videoCallService;
    }

    // The endpoint is now simpler as it doesn't need any parameters
    @GetMapping("/code")
    public Mono<ResponseEntity<Map<String, String>>> getRoomCode() {
        return videoCallService.generateRoomCode()
                .map(code -> ResponseEntity.ok(Map.of("code", code)))
                .defaultIfEmpty(ResponseEntity.status(500).build());
    }
}