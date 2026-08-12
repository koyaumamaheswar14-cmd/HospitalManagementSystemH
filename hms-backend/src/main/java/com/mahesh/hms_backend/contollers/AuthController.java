package com.mahesh.hms_backend.contollers;

import com.mahesh.hms_backend.dto.AuthResponse;
import com.mahesh.hms_backend.dto.LoginRequest;
import com.mahesh.hms_backend.dto.SignupRequest;
import com.mahesh.hms_backend.entity.User;
import com.mahesh.hms_backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final com.mahesh.hms_backend.service.AuthService authService;
    private final UserRepository userRepository;

    public AuthController(
            com.mahesh.hms_backend.service.AuthService authService,
            UserRepository userRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // ============================
    // GET PATIENT PROFILE
    // ============================

    @GetMapping("/profile/{username}")
    public User getProfile(@PathVariable String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ============================
    // UPDATE PATIENT PROFILE
    // ============================

    @PutMapping("/profile/{username}")
    public User updateProfile(
            @PathVariable String username,
            @RequestBody User updatedUser) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Update only editable profile information
        if (updatedUser.getFullName() != null &&
                !updatedUser.getFullName().isBlank()) {

            user.setFullName(updatedUser.getFullName());
        }

        if (updatedUser.getEmail() != null &&
                !updatedUser.getEmail().isBlank()) {

            user.setEmail(updatedUser.getEmail());
        }

        return userRepository.save(user);
    }
    
}