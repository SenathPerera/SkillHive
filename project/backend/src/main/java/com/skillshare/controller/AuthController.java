package com.skillshare.controller;

import com.skillshare.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            log.debug("Login attempt for email: {}", request.email());
            AuthResponse response = authService.login(request.email(), request.password());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.email(), e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            log.debug("Registration attempt for email: {}", request.email());
            AuthResponse response = authService.register(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName(),
                request.address(),
                request.birthday()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.email(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public record LoginRequest(String email, String password) {}
    
    public record RegisterRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        String address,
        String birthday
    ) {}
    
    public record AuthResponse(String token, UserResponse user) {}
    
    public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String address,
        String birthday,
        String avatarUrl
    ) {}
}