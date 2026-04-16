FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src
COPY .mvn .mvn
COPY mvnw .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /app/target/ai-symptom-checker-service-*.jar app.jar

EXPOSE 8087

ENV GEMINI_API_KEY=${GEMINI_API_KEY}

ENTRYPOINT ["java", "-jar", "app.jar"]
