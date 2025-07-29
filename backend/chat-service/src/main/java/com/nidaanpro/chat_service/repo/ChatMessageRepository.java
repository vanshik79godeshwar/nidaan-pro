package com.nidaanpro.chat_service.repo;

import com.nidaanpro.chat_service.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampAsc(UUID sender1, UUID recipient1, UUID sender2, UUID recipient2);
}