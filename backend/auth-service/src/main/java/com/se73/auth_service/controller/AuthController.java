package com.se73.auth_service.controller;

import com.se73.auth_service.dto.AuthRequest;
import com.se73.auth_service.dto.AuthResponse;
import com.se73.auth_service.model.Role;
import com.se73.auth_service.model.User;
import com.se73.auth_service.repository.UserRepository;
import com.se73.auth_service.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration and login APIs")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user with PATIENT role by default")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Username or email already exists")
    public ResponseEntity<?> register(@RequestBody User user) {  // or use DTO
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Default role if not provided
        if (user.getRole() == null) user.setRole(Role.PATIENT);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
    }
}
