package com.skillshare.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.skillshare.model.MediaItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;
    
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final Map<String, String[]> ALLOWED_TYPES = new HashMap<>() {{
        put("image", new String[]{"image/jpeg", "image/png", "image/gif"});
        put("video", new String[]{"video/mp4", "video/quicktime"});
    }};
    
    public MediaItem saveMedia(MultipartFile file, String description) throws IOException {
        validateFile(file);
        
        String contentType = file.getContentType();
        String mediaType = getMediaType(contentType);
        
        // Create metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("contentType", contentType);
        metadata.put("type", mediaType);
        if (description != null) {
            metadata.put("description", description);
        }
        metadata.put("originalFilename", file.getOriginalFilename());
        metadata.put("createdAt", Instant.now().toString());
        
        // Store file in GridFS
        ObjectId fileId = gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType(),
            metadata
        );
        
        // Create and return MediaItem
        return MediaItem.builder()
            .id(fileId.toString())
            .filename(file.getOriginalFilename())
            .contentType(contentType)
            .description(description)
            .type(mediaType)
            .size(file.getSize())
            .createdAt(Instant.now().toString())
            .build();
    }
    
    public MediaItem getMedia(String id) throws IOException {
        GridFSFile file = gridFsTemplate.findOne(
            Query.query(Criteria.where("_id").is(new ObjectId(id)))
        );
        
        if (file == null) {
            throw new RuntimeException("Media not found with id: " + id);
        }
        
        // Get metadata
        Map<String, String> metadata = new HashMap<>();
        file.getMetadata().forEach((key, value) -> metadata.put(key, value.toString()));
        
        // Load file data
        byte[] data = gridFsOperations.getResource(file).getContent().readAllBytes();
        
        return MediaItem.builder()
            .id(file.getObjectId().toString())
            .filename(file.getFilename())
            .contentType(metadata.get("contentType"))
            .description(metadata.get("description"))
            .type(metadata.get("type"))
            .size(file.getLength())
            .data(data)
            .createdAt(metadata.get("createdAt"))
            .build();
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 50MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Content type is null");
        }
        
        boolean isValidType = false;
        for (String[] types : ALLOWED_TYPES.values()) {
            for (String type : types) {
                if (contentType.equals(type)) {
                    isValidType = true;
                    break;
                }
            }
        }
        
        if (!isValidType) {
            throw new IllegalArgumentException(
                "Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed"
            );
        }
    }
    
    

    
}