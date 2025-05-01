//Lesson.java model
package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.ArrayList;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    private String title;
    private String description;
    
    @Field("video_id")
    private String videoId;
    
    @Builder.Default
    @Field("documents")
    private List<String> documentIds = new ArrayList<>();
}