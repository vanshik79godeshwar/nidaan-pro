# --- STAGE 1: The Build Stage ---
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
COPY src ./src
RUN chmod +x ./mvnw
RUN ./mvnw package -DskipTests

# --- STAGE 2: The Final Runtime Stage ---
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]