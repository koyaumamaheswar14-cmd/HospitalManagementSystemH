package com.mahesh.hms_backend.service;

import com.mahesh.hms_backend.dto.LoginRequest;
import com.mahesh.hms_backend.dto.SignupRequest;
import com.mahesh.hms_backend.dto.AuthResponse;
import com.mahesh.hms_backend.entity.User;
import com.mahesh.hms_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService; // ✅ add this

    public AuthService(UserRepository userRepository, JwtService jwtService) { // ✅ add this
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse("Username already exists", null, null, null);
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        userRepository.save(user);

        return new AuthResponse("Signup successful", user.getUsername(), user.getRole(), null);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        if (user == null) {
            return new AuthResponse("User not found", null, null, null);
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return new AuthResponse("Invalid password", null, null, null);
        }

        if (!user.getRole().equalsIgnoreCase(request.getRole())) {
            return new AuthResponse("Role mismatch", null, null, null);
        }

        String token = ((JwtService) jwtService).generateToken(user.getUsername(), user.getRole()); // ✅ no brackets needed

        return new AuthResponse("Login successful", user.getUsername(), user.getRole(), token);
    }
}
