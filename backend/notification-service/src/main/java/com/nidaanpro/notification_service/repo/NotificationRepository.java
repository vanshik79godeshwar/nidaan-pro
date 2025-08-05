// backend/notification-service/src/main/java/com/nidaanpro/notification_service/repo/NotificationRepository.java
package com.nidaanpro.notification_service.repo;

import com.nidaanpro.notification_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // We can keep this for other potential uses
    List<Notification> findByUserIdAndIsReadFalse(UUID userId);

    // --- ADD THIS NEW, MORE DIRECT METHOD ---
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") UUID userId);
}