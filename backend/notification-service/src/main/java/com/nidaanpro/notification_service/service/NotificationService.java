package com.nidaanpro.notification_service.service;

import com.nidaanpro.notification_service.model.Notification;
import com.nidaanpro.notification_service.repo.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification createAndSendNotification(UUID userId, String message, String link) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setLink(link);
        Notification savedNotification = notificationRepository.save(notification);

        // Send notification to the specific user's WebSocket queue
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                savedNotification
        );
        return savedNotification;
    }

    public List<Notification> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void sendSystemUpdate(UUID userId, String type, String data) {
        // We send this to a different, dedicated queue for system updates
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/system-updates",
                Map.of("type", type, "data", data)
        );
    }
}