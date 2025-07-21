package com.nidaanpro.chat_service.dto;

import java.util.UUID;

public record ChatMessageDto(
        UUID senderId,
        UUID recipientId,
        String content
) {}