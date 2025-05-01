package com.skillshare.service;

import com.skillshare.controller.AuthController.AuthResponse;
import com.skillshare.controller.AuthController.UserResponse;
import com.skillshare.model.User;
import com.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(String email, String password) {
        log.debug("Attempting to login user with email: {}", email);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.debug("Invalid password for user: {}", email);
            throw new RuntimeException("Invalid password");
        }
        
        log.debug("Login successful for user: {}", email);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, mapToUserResponse(user));
    }

    public AuthResponse register(
        String email,
        String password,
        String firstName,
        String lastName,
        String address,
        String birthday
    ) {
        log.debug("Attempting to register new user with email: {}", email);
        
        if (userRepository.existsByEmail(email)) {
            log.debug("Email already registered: {}", email);
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .firstName(firstName)
            .lastName(lastName)
            .address(address)
            .birthday(birthday)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        User savedUser = userRepository.save(user);
        log.debug("Successfully registered user: {}", email);
        
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getAddress(),
            user.getBirthday(),
            user.getAvatarUrl()
        );
    }
}