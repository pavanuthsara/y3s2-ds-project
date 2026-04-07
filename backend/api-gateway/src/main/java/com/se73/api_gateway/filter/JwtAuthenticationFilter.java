package com.se73.api_gateway.filter;

import com.se73.api_gateway.security.JwtTokenProvider;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter implements Filter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String authHeader = httpRequest.getHeader("Authorization");
        
        // Routes that don't require authentication
        String path = httpRequest.getRequestURI();
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register") || path.startsWith("/health") || path.startsWith("/actuator")) {
            chain.doFilter(request, response);
            return;
        }

        // Check if Authorization header exists
        if (authHeader == null || authHeader.isEmpty()) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"message\": \"Authorization header missing\"}");
            return;
        }

        // Extract token
        String token;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"message\": \"Invalid token format\"}");
            return;
        }

        // Validate token
        if (!jwtTokenProvider.validateToken(token)) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"message\": \"Invalid token\"}");
            return;
        }

        // Extract username from token and add to headers
        String username = jwtTokenProvider.getUsernameFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);

        HttpServletRequest wrappedRequest = new HeaderModifyingRequestWrapper(httpRequest, "X-User-Id", username);
        wrappedRequest = new HeaderModifyingRequestWrapper(wrappedRequest, "X-User-Role", role);

        chain.doFilter(wrappedRequest, response);
    }
}

class HeaderModifyingRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {
    private String headerName;
    private String headerValue;

    public HeaderModifyingRequestWrapper(HttpServletRequest request, String headerName, String headerValue) {
        super(request);
        this.headerName = headerName;
        this.headerValue = headerValue;
    }

    @Override
    public String getHeader(String name) {
        if (name.equals(headerName)) {
            return headerValue;
        }
        return super.getHeader(name);
    }
}

