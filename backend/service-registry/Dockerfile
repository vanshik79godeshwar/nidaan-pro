# --- STAGE 1: The Build Stage ---
# Use an official Maven image that includes JDK 21 to build the application
FROM maven:3.9-eclipse-temurin-21 AS builder

# Set the working directory for the build
WORKDIR /build

# Copy the Maven wrapper and pom.xml first to leverage Docker's layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Copy the rest of the application source code
COPY src ./src

# --- THIS IS THE FIX ---
# Add execute permissions to the Maven wrapper script
RUN chmod +x ./mvnw

# Run the Maven package command to build the .jar file, skipping tests
RUN ./mvnw package -DskipTests


# --- STAGE 2: The Final Runtime Stage ---
# Use a lightweight JRE image for the final container
FROM openjdk:21-jdk-slim

# Set the working directory for the running application
WORKDIR /app

# Copy ONLY the built .jar file from the 'builder' stage into the final container
COPY --from=builder /build/target/*.jar app.jar

# Expose the port the service runs on
EXPOSE 8761

# The command to run the application
ENTRYPOINT ["java","-jar","app.jar"]