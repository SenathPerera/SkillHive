package com.skillshare.controller;

import com.skillshare.model.Post;
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
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostRepository postRepository;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        try {
            log.debug("Fetching all posts");
            List<Post> posts = postRepository.findAll();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            log.error("Error fetching posts", e);
            throw new RuntimeException("Failed to fetch posts", e);
        }
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            log.debug("Creating post for user: {}", userId);
            
            Post newPost = Post.builder()
                .userId(userId)
                .title(post.getTitle())
                .content(post.getContent())
                .media(post.getMedia())
                .type(post.getType())
                .progressTemplate(post.getProgressTemplate())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
                
            Post savedPost = postRepository.save(newPost);
            log.debug("Post created successfully with id: {}", savedPost.getId());
            
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            log.error("Error creating post", e);
            throw new RuntimeException("Failed to create post", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable String id) {
        try {
            log.debug("Fetching post with id: {}", id);
            return postRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching post with id: {}", id, e);
            throw new RuntimeException("Failed to fetch post", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        try {
            log.debug("Updating post with id: {}", id);
            return postRepository.findById(id)
                    .map(existingPost -> {
                        Post updatedPost = Post.builder()
                            .id(existingPost.getId())
                            .userId(existingPost.getUserId())
                            .title(post.getTitle())
                            .content(post.getContent())
                            .media(post.getMedia())
                            .type(post.getType())
                            .progressTemplate(post.getProgressTemplate())
                            .createdAt(existingPost.getCreatedAt())
                            .updatedAt(Instant.now())
                            .build();
                            
                        return ResponseEntity.ok(postRepository.save(updatedPost));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating post with id: {}", id, e);
            throw new RuntimeException("Failed to update post", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        try {
            log.debug("Deleting post with id: {}", id);
            postRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting post with id: {}", id, e);
            throw new RuntimeException("Failed to delete post", e);
        }
    }
}
    