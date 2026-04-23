# =============================================================
# Multi-stage Dockerfile for Appointment Service
# Stage 1: Build the JAR using Maven
# Stage 2: Run the JAR using a lightweight JRE image
# =============================================================

# ---- Stage 1: Build ----
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for better layer caching (dependencies downloaded rarely change)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn -Dmaven.test.skip=true package -B

# ---- Stage 2: Run ----
FROM eclipse-temurin:17-jre

WORKDIR /app

# Add a non-root user for security best practices
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar appointment-service.jar

# Expose the service port
EXPOSE 8085

# Health check using curl (curl is available in the slim image)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8085/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "appointment-service.jar"]
