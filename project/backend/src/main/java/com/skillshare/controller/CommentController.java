package com.skillshare.controller;

import com.skillshare.model.Comment;
import com.skillshare.model.Notification;
import com.skillshare.repository.CommentRepository;
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
@RequestMapping("/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository; 
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        try {
            log.debug("Fetching comments for post: {}", postId);
            List<Comment> comments = commentRepository.findByPostId(postId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("Error fetching comments for post: {}", postId, e);
            throw new RuntimeException("Failed to fetch comments", e);
        }
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(@PathVariable String postId, @RequestBody Comment comment) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            log.debug("Creating comment for post: {} by user: {}", postId, userId);

            // Create new comment object
            Comment newComment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .content(comment.getContent())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

            // Save the new comment
            Comment savedComment = commentRepository.save(newComment);
            log.debug("Comment created with id: {}", savedComment.getId());

            // Retrieve the post owner id
            try {
                // Retrieve the post owner id
                String postOwnerId = postRepository.findById(postId)
                    .map(post -> post.getUserId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
                log.info("Creating Notification for comment");
                
                // Create a notification for the post owner
                Notification notification = new Notification();
                notification.setUserId(postOwnerId);
                notification.setActionUserId(userId);  // The user who made the comment
                notification.setMessage("New comment on your post");
                notification.setPostId(postId);
                notification.setRead(false);
                notification.setCreatedAt(Instant.now());
            
                // Save the notification
                notificationRepository.save(notification);
            
            } catch (Exception e) {
                log.error("Error while creating notification", e);
            }            

            // Return the response with the saved comment
            return ResponseEntity.ok(savedComment);

        } catch (Exception e) {
            log.error("Error creating comment for post: {}", postId, e);
            throw new RuntimeException("Failed to create comment", e);
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
        @PathVariable String postId,
        @PathVariable String commentId,
        @RequestBody Comment comment
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            log.debug("Updating comment: {} for post: {} by user: {}", commentId, postId, userId);
            
            return commentRepository.findById(commentId)
                .map(existingComment -> {
                    // Verify ownership
                    if (!existingComment.getUserId().equals(userId)) {
                        throw new RuntimeException("Not authorized to update this comment");
                    }
                    
                    Comment updatedComment = Comment.builder()
                        .id(existingComment.getId())
                        .postId(existingComment.getPostId())
                        .userId(existingComment.getUserId())
                        .content(comment.getContent())
                        .createdAt(existingComment.getCreatedAt())
                        .updatedAt(Instant.now())
                        .build();
                        
                    return ResponseEntity.ok(commentRepository.save(updatedComment));
                })
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        } catch (Exception e) {
            log.error("Error updating comment: {} for post: {}", commentId, postId, e);
            throw new RuntimeException("Failed to update comment", e);
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable String postId,
        @PathVariable String commentId
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            log.debug("Deleting comment: {} for post: {} by user: {}", commentId, postId, userId);
            
            commentRepository.findById(commentId)
                .ifPresentOrElse(
                    comment -> {
                        // Verify ownership
                        if (!comment.getUserId().equals(userId)) {
                            throw new RuntimeException("Not authorized to delete this comment");
                        }
                        commentRepository.deleteById(commentId);
                    },
                    () -> {
                        throw new RuntimeException("Comment not found");
                    }
                );
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting comment: {} for post: {}", commentId, postId, e);
            throw new RuntimeException("Failed to delete comment", e);
        }
    }
}
