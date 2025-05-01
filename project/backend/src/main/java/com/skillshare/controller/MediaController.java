package com.skillshare.controller;

import com.skillshare.model.MediaItem;
import com.skillshare.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService mediaService;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaItem> uploadMedia(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "description", required = false) String description
    ) {
        try {
            log.info("Uploading media file: {}", file.getOriginalFilename());
            MediaItem savedMedia = mediaService.saveMedia(file, description);
            return ResponseEntity.ok(savedMedia);
        } catch (Exception e) {
            log.error("Error uploading media", e);
            throw new RuntimeException("Failed to upload media: " + e.getMessage());
        }
    }
    
    
}