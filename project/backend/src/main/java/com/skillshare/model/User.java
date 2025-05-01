package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    @Field("first_name")
    private String firstName;
    
    @Field("last_name")
    private String lastName;
    
    private String address;
    
    private String birthday;
    
    @Field("avatar_url")
    private String avatarUrl;
    
    private String bio;
    
    @Builder.Default
    @Field("following_ids")
    private List<String> followingIds = new ArrayList<>();
    
    @Builder.Default
    @Field("follower_ids")
    private List<String> followerIds = new ArrayList<>();
    
    @Field("created_at")
    private Instant createdAt;
    
    @Field("updated_at")
    private Instant updatedAt;
}