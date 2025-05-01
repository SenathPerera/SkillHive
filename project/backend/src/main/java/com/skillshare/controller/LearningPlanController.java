package com.skillshare.controller;

import com.skillshare.model.LearningPlan;
import com.skillshare.repository.LearningPlanRepository;
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
@RequestMapping("/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {
    private final LearningPlanRepository learningPlanRepository;

    @GetMapping
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans(
        @RequestParam(required = false) String skill,
        @RequestParam(required = false) String skillLevel
    ) {
        try {
            List<LearningPlan> plans;
            
            if (skill != null && skillLevel != null) {
                plans = learningPlanRepository.findAll().stream()
                    .filter(plan -> plan.getSkill().equals(skill) && plan.getSkillLevel().equals(skillLevel))
                    .toList();
            } else if (skill != null) {
                plans = learningPlanRepository.findBySkill(skill);
            } else if (skillLevel != null) {
                plans = learningPlanRepository.findBySkillLevel(skillLevel);
            } else {
                plans = learningPlanRepository.findAll();
            }
            
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            log.error("Error fetching learning plans", e);
            throw new RuntimeException("Failed to fetch learning plans", e);
        }
    }

    @GetMapping("/my-plans")
    public ResponseEntity<List<LearningPlan>> getMyLearningPlans() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            List<LearningPlan> plans = learningPlanRepository.findByUserId(userId);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            log.error("Error fetching user's learning plans", e);
            throw new RuntimeException("Failed to fetch learning plans", e);
        }
    }

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@RequestBody LearningPlan plan) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            LearningPlan newPlan = LearningPlan.builder()
                .userId(userId)
                .title(plan.getTitle())
                .thumbnail(plan.getThumbnail())
                .skill(plan.getSkill())
                .skillLevel(plan.getSkillLevel())
                .description(plan.getDescription())
                .lessons(plan.getLessons())
                .duration(plan.getDuration())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
                
            LearningPlan savedPlan = learningPlanRepository.save(newPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            log.error("Error creating learning plan", e);
            throw new RuntimeException("Failed to create learning plan", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlan(@PathVariable String id) {
        try {
            return learningPlanRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching learning plan with id: {}", id, e);
            throw new RuntimeException("Failed to fetch learning plan", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
        @PathVariable String id,
        @RequestBody LearningPlan plan
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            return learningPlanRepository.findById(id)
                .map(existingPlan -> {
                    if (!existingPlan.getUserId().equals(userId)) {
                        throw new RuntimeException("Not authorized to update this learning plan");
                    }
                    
                    LearningPlan updatedPlan = LearningPlan.builder()
                        .id(existingPlan.getId())
                        .userId(existingPlan.getUserId())
                        .title(plan.getTitle())
                        .thumbnail(plan.getThumbnail())
                        .skill(plan.getSkill())
                        .skillLevel(plan.getSkillLevel())
                        .description(plan.getDescription())
                        .lessons(plan.getLessons())
                        .duration(plan.getDuration())
                        .createdAt(existingPlan.getCreatedAt())
                        .updatedAt(Instant.now())
                        .build();
                        
                    return ResponseEntity.ok(learningPlanRepository.save(updatedPlan));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating learning plan with id: {}", id, e);
            throw new RuntimeException("Failed to update learning plan", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            return learningPlanRepository.findById(id)
                .map(plan -> {
                    if (!plan.getUserId().equals(userId)) {
                        throw new RuntimeException("Not authorized to delete this learning plan");
                    }
                    
                    learningPlanRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error deleting learning plan with id: {}", id, e);
            throw new RuntimeException("Failed to delete learning plan", e);
        }
    }
}