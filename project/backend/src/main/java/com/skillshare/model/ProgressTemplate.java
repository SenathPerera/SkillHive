package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.List;
import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressTemplate {
    private String type;
    
    @Builder.Default
    private List<String> completed = new ArrayList<>();
    
    @Field("skills_learned")
    @Builder.Default
    private List<String> skillsLearned = new ArrayList<>();
    
    @Field("project_details")
    private ProjectDetails projectDetails;
    
    @Field("certification_details")
    private CertificationDetails certificationDetails;
}