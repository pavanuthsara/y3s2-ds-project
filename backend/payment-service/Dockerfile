FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /target/payment-service-0.0.1-SNAPSHOT.jar payment-service.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "payment-service.jar"]
