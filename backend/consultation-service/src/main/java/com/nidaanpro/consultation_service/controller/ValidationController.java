package com.nidaanpro.consultation_service.controller;
import com.nidaanpro.consultation_service.dto.ChatValidationRequestDto;
import com.nidaanpro.consultation_service.service.ConsultationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(ValidationController.class);

    public ValidationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/chat-pairing")
    public ResponseEntity<Map<String, Boolean>> validateChatPairing(@Valid @RequestBody ChatValidationRequestDto dto) {
        logger.info("this is called...");
        boolean isValid = consultationService.validateChatPair(dto.userId1(), dto.userId2());
        logger.info("this is called done {}",  isValid);
        return ResponseEntity.ok(Map.of("isValid", isValid));
    }
}