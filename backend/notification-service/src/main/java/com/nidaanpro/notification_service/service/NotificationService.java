// backend/notification-service/src/main/java/com/nidaanpro/notification_service/service/NotificationService.java
package com.nidaanpro.notification_service.service;

import com.nidaanpro.notification_service.model.Notification;
import com.nidaanpro.notification_service.repo.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);


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

    // --- THIS IS THE UPDATED METHOD ---
    public void markAllAsRead(UUID userId) {
        logger.info("Attempting to mark all notifications as read for user: {}", userId);
        try {
            notificationRepository.markAllAsReadForUser(userId);
            logger.info("Successfully executed markAllAsReadForUser query for user: {}", userId);
        } catch (Exception e) {
            logger.error("Error executing markAllAsReadForUser for user: {}", userId, e);
        }
    }

    public void sendSystemUpdate(UUID userId, String type, String data) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/system-updates",
                Map.of("type", type, "data", data)
        );
    }
}