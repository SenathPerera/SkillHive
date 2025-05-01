package com.skillshare.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaItem {
    private String id;
    private String filename;
    private String contentType;
    private String description;
    private String type;
    private long size;
    private String createdAt;
    
    @Transient
    private byte[] data;
}