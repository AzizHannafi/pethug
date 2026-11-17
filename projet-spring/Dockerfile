# ---------- build stage: no JDK/Maven needed on the host ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependencies first, so edits to src/ do not re-download the world.
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline -DskipTests || true

COPY src ./src
# maven.test.skip (not -DskipTests): the pom pins surefire's skipTests to the
# skip.unit.tests property, which makes -DskipTests a no-op.
RUN mvn -B clean package -Dmaven.test.skip=true

# ---------- runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/target/Pet_REST_CRUD_CI.jar /app/app.jar

EXPOSE 8086
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
