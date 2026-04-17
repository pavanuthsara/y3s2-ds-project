package com.se73.api_gateway.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MultipartConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        long maxSize = 50L * 1024L * 1024L;
        return new MultipartConfigElement("", maxSize, maxSize, 0);
    }
}
