package com.nidaanpro.chat_service.controller;

import com.nidaanpro.chat_service.dto.ChatMessageDto;
import com.nidaanpro.chat_service.dto.ChatValidationResponseDto;
import com.nidaanpro.chat_service.model.ChatMessage;
import com.nidaanpro.chat_service.repo.ChatMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.UUID;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final WebClient.Builder webClientBuilder;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository, WebClient.Builder webClientBuilder) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.webClientBuilder = webClientBuilder;
    }

    @MessageMapping("/chat")
    public void processMessage(ChatMessageDto chatMessageDto) {
        // 1. VALIDATE if the sender and recipient have an appointment history
        boolean canChat = Boolean.TRUE.equals(webClientBuilder.build().post()
                .uri("http://CONSULTATION-SERVICE/api/consultations/validate/chat-pairing")
                .bodyValue(Map.of(
                        "userId1", chatMessageDto.senderId(),
                        "userId2", chatMessageDto.recipientId()
                ))
                .retrieve()
                .bodyToMono(ChatValidationResponseDto.class)
                .map(ChatValidationResponseDto::isValid)
                .block()); // Use block() to get the result synchronously

        if (!canChat) {
            System.out.println("Chat validation FAILED for sender: " + chatMessageDto.senderId() + " and recipient: " + chatMessageDto.recipientId());
            // In a real app, you might send an error message back to the sender
            return; // Stop processing if validation fails
        }

        System.out.println("Chat validation PASSED. Processing message...");

        // 2. Save the message to the database
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSenderId(chatMessageDto.senderId());
        chatMessage.setRecipientId(chatMessageDto.recipientId());
        chatMessage.setContent(chatMessageDto.content());
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // 3. Send the message to the specific recipient's queue
        messagingTemplate.convertAndSendToUser(
                chatMessageDto.recipientId().toString(),
                "/queue/messages",
                savedMessage
        );
    }

    @GetMapping("/api/chat/validate-test")
    public ResponseEntity<String> validateTest(
            @RequestParam UUID senderId,
            @RequestParam UUID recipientId) {

        System.out.println("--- Running Validation Test ---");
        boolean canChat = Boolean.TRUE.equals(webClientBuilder.build().post()
                .uri("http://CONSULTATION-SERVICE/api/consultations/validate/chat-pairing")
                .bodyValue(Map.of(
                        "userId1", senderId,
                        "userId2", recipientId
                ))
                .retrieve()
                .bodyToMono(ChatValidationResponseDto.class)
                .map(ChatValidationResponseDto::isValid)
                .block());

        if (canChat) {
            System.out.println("--- RESULT: VALID ---");
            return ResponseEntity.ok("VALID: These users are allowed to chat.");
        } else {
            System.out.println("--- RESULT: INVALID ---");
            return ResponseEntity.status(403).body("INVALID: These users are NOT allowed to chat.");
        }
    }
}