package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    @Field("user_id")
    private String userId;
    
    private String type;
    private String message;
    
    @Field("action_user_id")
    private String actionUserId;
    
    @Field("post_id")
    private String postId;
    
    @Field("comment_id")
    private String commentId;
    
    private boolean read;
    
    @Field("created_at")
    private Instant createdAt;
}