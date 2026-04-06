package com.se73.auth_service.controller;

import com.se73.auth_service.dto.*;
import com.se73.auth_service.model.User;
import com.se73.auth_service.security.JwtTokenProvider;
import com.se73.auth_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        // If userService throws a RuntimeException (e.g., "User already exists"),
        // the GlobalExceptionHandler handles it automatically.
        User user = userService.registerUser(request);
        String token = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request) {
        // If authentication fails, BadCredentialsException is thrown.
        // The GlobalExceptionHandler will catch it and return your custom message.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userService.findByUsername(request.getUsername());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                return ResponseEntity.ok(new TokenValidationResponse(true, username));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new TokenValidationResponse(false, null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new TokenValidationResponse(false, null));
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        // 1. Business logic call (throws exception if not found)
        User user = userService.findByUsername(username);

        // 2. Map and return success
        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        ));
    }
}
