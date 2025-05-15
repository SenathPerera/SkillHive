package com.skillshare.controller;

import com.skillshare.model.UserPlanProgress;
import com.skillshare.repository.UserPlanProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/learning-plans/{planId}/progress")
@RequiredArgsConstructor
public class ProgressController {
    private final UserPlanProgressRepository progressRepo;

    @PostMapping("/enroll")
    public ResponseEntity<UserPlanProgress> enroll(@PathVariable String planId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // if any progress exists, return the first one
        List<UserPlanProgress> existing = progressRepo.findByUserIdAndPlanId(userId, planId);
        if (!existing.isEmpty()) {
            return ResponseEntity.ok(existing.get(0));
        }

        // otherwise create a new progress entry
        UserPlanProgress progress = UserPlanProgress.builder()
            .userId(userId)
            .planId(planId)
            .completedLessons(Set.of())
            .updatedAt(Instant.now())
            .build();
        return ResponseEntity.ok(progressRepo.save(progress));
    }

    @GetMapping
    public ResponseEntity<UserPlanProgress> getProgress(@PathVariable String planId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // return only the first matching progress entry
        return progressRepo.findFirstByUserIdAndPlanId(userId, planId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<UserPlanProgress> updateProgress(
        @PathVariable String planId,
        @RequestBody Set<Integer> completedLessons
    ) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // update only the first matching entry
        return progressRepo.findFirstByUserIdAndPlanId(userId, planId)
            .map(progress -> {
                progress.setCompletedLessons(completedLessons);
                progress.setUpdatedAt(Instant.now());
                return ResponseEntity.ok(progressRepo.save(progress));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteProgress(@PathVariable String planId) {
      String userId = SecurityContextHolder.getContext().getAuthentication().getName();
      // remove all progress docs for this user and plan
      progressRepo.findByUserIdAndPlanId(userId, planId)
                  .forEach(progressRepo::delete);
      return ResponseEntity.noContent().build();
}
}
