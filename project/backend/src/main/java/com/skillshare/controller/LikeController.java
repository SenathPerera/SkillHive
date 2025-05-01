package com.skillshare.controller;

import com.skillshare.model.Like;
import com.skillshare.model.Notification;
import com.skillshare.repository.LikeRepository;
import com.skillshare.repository.NotificationRepository;
import com.skillshare.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/posts/{postId}/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Like>> getLikes(@PathVariable String postId) {
        try {
            log.debug("Fetching likes for post: {}", postId);
            List<Like> likes = likeRepository.findByPostId(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            log.error("Error fetching likes for post: {}", postId, e);
            throw new RuntimeException("Failed to fetch likes", e);
        }
    }

    @PostMapping
public ResponseEntity<Like> addLike(@PathVariable String postId) {
    try {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        log.debug("Adding like for post: {} by user: {}", postId, userId);

        // Check if like already exists
        if (likeRepository.findByPostIdAndUserId(postId, userId).isPresent()) {
            throw new RuntimeException("User has already liked this post");
        }

        Like like = Like.builder()
            .postId(postId)
            .userId(userId)
            .createdAt(Instant.now())
            .build();

        Like savedLike = likeRepository.save(like);
        log.debug("Like created with id: {}", savedLike.getId());

        // Notification Logic
        try {
            String postOwnerId = postRepository.findById(postId)
                .map(post -> post.getUserId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

            log.info("Creating Notification for like");

            Notification notification = new Notification();
            notification.setUserId(postOwnerId);
            notification.setActionUserId(userId);
            notification.setMessage("Someone liked your post");
            notification.setPostId(postId);
            notification.setRead(false);
            notification.setCreatedAt(Instant.now());

            notificationRepository.save(notification);

        } catch (Exception e) {
            log.error("Error while creating like notification", e);
        }

        return ResponseEntity.ok(savedLike);

    } catch (Exception e) {
        log.error("Error adding like for post: {}", postId, e);
        throw new RuntimeException("Failed to add like", e);
    }
}


    @DeleteMapping
    public ResponseEntity<Void> removeLike(@PathVariable String postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            log.debug("Removing like for post: {} by user: {}", postId, userId);
            
            likeRepository.findByPostIdAndUserId(postId, userId)
                .ifPresentOrElse(
                    like -> likeRepository.deleteById(like.getId()),
                    () -> {
                        throw new RuntimeException("Like not found");
                    }
                );
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing like for post: {}", postId, e);
            throw new RuntimeException("Failed to remove like", e);
        }
    }
}