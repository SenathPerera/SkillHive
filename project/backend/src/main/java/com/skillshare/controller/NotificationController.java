package com.skillshare.controller;

import com.skillshare.model.Notification;
import com.skillshare.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
        @RequestParam(required = false) Boolean unreadOnly
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            List<Notification> notifications = unreadOnly != null && unreadOnly
                ? notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
                
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications", e);
            throw new RuntimeException("Failed to fetch notifications", e);
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            long count = notificationRepository.countByUserIdAndRead(userId, false);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("Error fetching unread notification count", e);
            throw new RuntimeException("Failed to fetch unread count", e);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            return notificationRepository.findById(id)
                .filter(notification -> notification.getUserId().equals(userId))
                .map(notification -> {
                    notification.setRead(true);
                    return ResponseEntity.ok(notificationRepository.save(notification));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", id, e);
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            List<Notification> unreadNotifications = 
                notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
                
            unreadNotifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            throw new RuntimeException("Failed to mark all notifications as read", e);
        }
    }
}