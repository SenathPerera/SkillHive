package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "learning_plans")
public class LearningPlan {
    @Id
    private String id;
    
    @Field("user_id")
    private String userId;
    
    private String title;
    private String thumbnail;
    private String skill;
    
    @Field("skill_level")
    private String skillLevel;
    
    private String description;
    
    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();
    
    private String duration;
    
    @Field("created_at")
    private Instant createdAt;
    
    @Field("updated_at")
    private Instant updatedAt;
}
