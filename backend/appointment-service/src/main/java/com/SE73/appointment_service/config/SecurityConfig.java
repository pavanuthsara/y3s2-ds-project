package com.SE73.appointment_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the Appointment Service.
 *
 * <p>Currently configured for open access to all endpoints with stateless sessions.
 * CSRF is disabled since this is a stateless REST API.
 * JWT-based authentication can be layered on top in a future iteration.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configures the security filter chain.
     *
     * <ul>
     *   <li>Disables CSRF protection (appropriate for stateless REST APIs)</li>
     *   <li>Permits all requests (to be restricted per role in future JWT integration)</li>
     *   <li>Uses STATELESS session management (no server-side sessions)</li>
     * </ul>
     *
     * @param http the HttpSecurity builder
     * @return the configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for REST API
            .csrf(AbstractHttpConfigurer::disable)

            // Allow all requests (JWT validation can be added here in future)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )

            // Use stateless sessions - no HTTP session cookies
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }
}
