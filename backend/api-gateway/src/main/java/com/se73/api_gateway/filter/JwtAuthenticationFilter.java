package com.se73.api_gateway.filter;

import com.se73.api_gateway.security.JwtTokenProvider;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

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
        if (path.startsWith("/api/auth/") || path.startsWith("/health") || path.startsWith("/actuator")) {
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

        // Extract identity from token and add headers for downstream services.
        String username = jwtTokenProvider.getUsernameFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);
        Map<String, String> customHeaders = new HashMap<>();
        customHeaders.put("X-User-Id", username);
        if (role != null) {
            customHeaders.put("X-User-Role", role);
        }

        HttpServletRequest wrappedRequest = new HeaderModifyingRequestWrapper(httpRequest, customHeaders);

        chain.doFilter(wrappedRequest, response);
    }
}

class HeaderModifyingRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {
    private final Map<String, String> customHeaders;

    public HeaderModifyingRequestWrapper(HttpServletRequest request, Map<String, String> customHeaders) {
        super(request);
        this.customHeaders = customHeaders;
    }

    @Override
    public String getHeader(String name) {
        if (customHeaders.containsKey(name)) {
            return customHeaders.get(name);
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        if (customHeaders.containsKey(name)) {
            return Collections.enumeration(Collections.singletonList(customHeaders.get(name)));
        }
        return super.getHeaders(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        java.util.List<String> names = Collections.list(super.getHeaderNames());
        for (String customHeaderName : customHeaders.keySet()) {
            if (!names.contains(customHeaderName)) {
                names.add(customHeaderName);
            }
        }
        return Collections.enumeration(names);
    }
}

