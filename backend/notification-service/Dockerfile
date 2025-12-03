# STAGE 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# 1. Copy ONLY the build definition files first
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 2. Download dependencies. This layer will be CACHED unless pom.xml changes!
# We grant execute permission to mvnw just in case
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# 3. Copy the actual source code
COPY src src

# 4. Build the application (skipping tests for speed)
RUN ./mvnw package -DskipTests

# STAGE 2: Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]