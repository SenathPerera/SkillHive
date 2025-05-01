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
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    
    @Field("user_id")
    private String userId;
    
    private String title;
    private String content;
    
    @Builder.Default
    private List<MediaItem> media = new ArrayList<>();
    
    private String type;
    
    @Field("progress_template")
    private ProgressTemplate progressTemplate;
    
    @Builder.Default
    private List<Achievement> achieveents = new ArrayList<>();
    
    @Field("created_at")
    private Instant createdAt;
    
    @Field("updated_at")
    private Instant updatedAt;
}