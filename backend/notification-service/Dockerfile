FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY target/notification-service-0.0.1-SNAPSHOT.jar notification-service.jar

EXPOSE 8088

ENTRYPOINT ["java", "-jar", "notification-service.jar"]
