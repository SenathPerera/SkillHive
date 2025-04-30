package com.skillshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableConfigurationProperties
@ComponentScan(basePackages = {
    "com.skillshare",
    "com.skillshare.config",
    "com.skillshare.controller",
    "com.skillshare.service",
    "com.skillshare.repository"
})
public class SkillSharingPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkillSharingPlatformApplication.class, args);
    }
}