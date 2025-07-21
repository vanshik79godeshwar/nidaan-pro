package com.nidaanpro.consultation_service.controller;

import com.nidaanpro.consultation_service.dto.ChatValidationRequestDto;
import com.nidaanpro.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/consultations/validate")
public class ValidationController {

    private final ConsultationService consultationService;

    public ValidationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/chat-pairing")
    public ResponseEntity<Map<String, Boolean>> validateChatPairing(@Valid @RequestBody ChatValidationRequestDto dto) {
        boolean isValid = consultationService.validateChatPair(dto.userId1(), dto.userId2());
        return ResponseEntity.ok(Map.of("isValid", isValid));
    }
}