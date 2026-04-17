FROM openjdk:21-jdk-slim

WORKDIR /app

COPY target/notification-service-0.0.1-SNAPSHOT.jar notification-service.jar

EXPOSE 8088

ENTRYPOINT ["java", "-jar", "notification-service.jar"]
