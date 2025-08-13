# STAGE 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
COPY src ./src
RUN chmod +x ./mvnw
RUN ./mvnw package -DskipTests

# STAGE 2: Create the final lightweight runtime image
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]