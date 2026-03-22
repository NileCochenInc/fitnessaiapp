FROM eclipse-temurin:21 AS build
WORKDIR /app
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ src/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]