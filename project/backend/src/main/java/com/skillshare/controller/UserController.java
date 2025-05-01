package com.skillshare.controller;

import com.skillshare.model.MediaItem;
import com.skillshare.model.User;
import com.skillshare.repository.UserRepository;
import com.skillshare.service.MediaService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MediaService mediaService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            // Clear sensitive data before returning the users
            users.forEach(user -> {
                user.setPassword(null);
                user.setEmail(null);
                user.setAddress(null);
                user.setBirthday(null);
            });
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching all users", e);
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        try {
            return userRepository.findById(id)
                .map(user -> {
                    // Clear sensitive data
                    user.setPassword(null);
                    user.setEmail(null);
                    user.setAddress(null);
                    user.setBirthday(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user: {}", id, e);
            throw new RuntimeException("Failed to fetch user", e);
        }
    }

    @GetMapping("/{id}/private")
public ResponseEntity<User> getPrivateProfile(@PathVariable String id) {
    try {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        // Users can only access their own private profile
        if (!userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return userRepository.findById(id)
            .map(user -> {
                user.setPassword(null);  // Don't expose the password
                return ResponseEntity.ok(user);
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());  // Return 404 if user is not found
    } catch (Exception e) {
        log.error("Error fetching private profile for user ID: {}", id, e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();  // Return 500 on any error
    }
}


    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
        @PathVariable String id,
        @RequestBody User updatedUser
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();

            if (!userId.equals(id)) {
                return ResponseEntity.status(403).build();
            }

            return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setFirstName(updatedUser.getFirstName());
                    existingUser.setLastName(updatedUser.getLastName());
                    existingUser.setAddress(updatedUser.getAddress());
                    existingUser.setBirthday(updatedUser.getBirthday());
                    existingUser.setAvatarUrl(updatedUser.getAvatarUrl());
                    existingUser.setBio(updatedUser.getBio());
                    existingUser.setUpdatedAt(Instant.now());

                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }

                    User savedUser = userRepository.save(existingUser);
                    savedUser.setPassword(null);
                    return ResponseEntity.ok(savedUser);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating user: {}", id, e);
            throw new RuntimeException("Failed to update user", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();

            if (!userId.equals(id)) {
                return ResponseEntity.status(403).build();
            }

            return userRepository.findById(id)
                .map(user -> {
                    userRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error deleting user: {}", id, e);
            throw new RuntimeException("Failed to delete user", e);
        }
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> followUser(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String followerId = auth.getName();

            if (followerId.equals(id)) {
                return ResponseEntity.badRequest().build();
            }

            User follower = userRepository.findById(followerId).orElse(null);
            User following = userRepository.findById(id).orElse(null);

            if (follower == null || following == null) {
                return ResponseEntity.notFound().build();
            }

            if (!follower.getFollowingIds().contains(id)) {
                follower.getFollowingIds().add(id);
                following.getFollowerIds().add(followerId);

                userRepository.save(follower);
                userRepository.save(following);
            }

            return ResponseEntity.ok(Map.of(
                "following", true,
                "followersCount", following.getFollowerIds().size(),
                "followingCount", following.getFollowingIds().size()
            ));
        } catch (Exception e) {
            log.error("Error following user: {}", id, e);
            throw new RuntimeException("Failed to follow user", e);
        }
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> unfollowUser(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String followerId = auth.getName();

            User follower = userRepository.findById(followerId).orElse(null);
            User following = userRepository.findById(id).orElse(null);

            if (follower == null || following == null) {
                return ResponseEntity.notFound().build();
            }

            follower.getFollowingIds().remove(id);
            following.getFollowerIds().remove(followerId);

            userRepository.save(follower);
            userRepository.save(following);

            return ResponseEntity.ok(Map.of(
                "following", false,
                "followersCount", following.getFollowerIds().size(),
                "followingCount", following.getFollowingIds().size()
            ));
        } catch (Exception e) {
            log.error("Error unfollowing user: {}", id, e);
            throw new RuntimeException("Failed to unfollow user", e);
        }
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String id) {
        try {
            return userRepository.findById(id)
                .map(user -> {
                    List<User> followers = userRepository.findAllById(user.getFollowerIds());
                    followers.forEach(follower -> {
                        follower.setPassword(null);
                        follower.setEmail(null);
                        follower.setAddress(null);
                        follower.setBirthday(null);
                    });
                    return ResponseEntity.ok(followers);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching followers for user: {}", id, e);
            throw new RuntimeException("Failed to fetch followers", e);
        }
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String id) {
        try {
            return userRepository.findById(id)
                .map(user -> {
                    List<User> following = userRepository.findAllById(user.getFollowingIds());
                    following.forEach(followed -> {
                        followed.setPassword(null);
                        followed.setEmail(null);
                        followed.setAddress(null);
                        followed.setBirthday(null);
                    });
                    return ResponseEntity.ok(following);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching following for user: {}", id, e);
            throw new RuntimeException("Failed to fetch following", e);
        }
    }

    @PutMapping("/{id}/profile-picture")
public ResponseEntity<?> uploadProfilePicture(
    @PathVariable String id,
    @RequestParam("image") MultipartFile image,
    @RequestParam(value = "description", required = false) String description
) {
    try {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        if (!userId.equals(id)) {
            return ResponseEntity.status(403).build();
        }

        // Save image via MediaService
        MediaItem mediaItem = mediaService.saveMedia(image, description);

        return userRepository.findById(id)
            .map(user -> {
                user.setAvatarUrl("/api/media/" + mediaItem.getId()); // URL to fetch the image
                user.setUpdatedAt(Instant.now());
                userRepository.save(user);
                return ResponseEntity.ok().body(Map.of("avatarUrl", user.getAvatarUrl()));
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Failed to upload profile picture for user {}", id, e);
        return ResponseEntity.status(500).body("Failed to upload profile picture");
    }
    }
}