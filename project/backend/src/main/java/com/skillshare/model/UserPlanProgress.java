package com.skillshare.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_plan_progress")
public class UserPlanProgress {
    @Id
    private String id;
    private String userId;
    private String planId;
    private Set<Integer> completedLessons;
    private Map<Integer, Long> timeSpentPerLesson = new HashMap<>();
    private Instant updatedAt;
}

