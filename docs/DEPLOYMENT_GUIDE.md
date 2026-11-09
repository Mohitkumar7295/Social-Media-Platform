# WriteSpace: Production Operations & Deployment Guide

> **Target Architecture:** Decoupled Edge Frontend + Containerized Java Backend + InsForge Managed PostgreSQL  
> **Status:** Operations & Deployment Specification

---

## 1. Purpose
This document provides complete, operational guidelines for deploying the **WriteSpace** platform across local development, staging, and production cloud environments. It details database provisioning on InsForge, Spring Boot container configuration, Edge static hosting, environment variable injection, and production verification.

---

## 2. Scope
This guide distinguishes between two independent runtime components:
1. **Static Frontend Client:** Deployed to Edge Content Delivery Networks (Netlify, Vercel, Cloudflare Pages, or AWS S3 + CloudFront).
2. **Dynamic Backend API Service:** Deployed to a Java 17+ compatible container host (Railway, Render, AWS ECS, Fly.io, or Linux VPS).
3. **Database Tier:** Managed PostgreSQL provisioned via **InsForge**.

---

## 3. High-Level Deployment Topology

```mermaid
graph TD
    subgraph ClientDelivery ["Edge Static Delivery Tier"]
        Users["Global Web Browsers"] --> CDN["Global Edge CDN (Netlify / Vercel / Cloudflare)"]
        CDN --> StaticFiles["Static Frontend (HTML5 / CSS3 / Vanilla JS)"]
    end

    subgraph BackendCompute ["Backend Compute Tier"]
        Users -->|HTTPS REST API /api/v1/*| CloudHost["Java 17 Host (Railway / Render / VPS)"]
        CloudHost --> AppJAR["Spring Boot Embedded Tomcat :8080"]
    end

    subgraph DataTier ["Data & Storage Tier"]
        AppJAR -->|Encrypted JDBC (TLS 1.3)| InsForgeDB[("InsForge Managed PostgreSQL")]
        AppJAR -.->|Presigned URLs / Direct Upload| InsForgeStorage["InsForge Media Storage"]
    end
```

---

## 4. Managed PostgreSQL Setup on InsForge

InsForge provisions dedicated PostgreSQL instances with high availability and SSL enforcement.

### 4.1 Provisioning Procedure
1. Navigate to the [InsForge Console](https://insforge.app) and create a project named `writespace-prod`.
2. Select **PostgreSQL 15+** in your designated geographic region.
3. Once the database instance status reaches `Healthy`, copy the connection parameters from **Database Settings**:
   - **Host:** e.g., `db.insforge.app`
   - **Port:** `5432`
   - **Database Name:** `writespace_db`
   - **Username:** `writespace_user`
   - **Password:** `<SECURE_GENERATED_PASSWORD>`
   - **SSL Mode:** `require`

### 4.2 JDBC Connection String Assembly
```
jdbc:postgresql://db.insforge.app:5432/writespace_db?sslmode=require
```

---

## 5. Backend Deployment (Spring Boot Application)

Because Spring Boot requires a persistent Java Virtual Machine (JVM 17+), it must run on a platform supporting long-running Java services.

### 5.1 Docker Container Packaging
Create a `backend/Dockerfile` for universal container deployment:

```dockerfile
# Multi-stage Docker build for Spring Boot
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/target/writespace-backend-*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```

### 5.2 Deployment on Railway / Render
1. Connect your GitHub repository to Railway or Render.
2. Select the `backend/` root directory.
3. Choose the **Docker** runtime or **Java 17** Native buildpack:
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/writespace-backend-1.0.0-SNAPSHOT.jar`
4. Configure all environment variables in the host dashboard (see Section 6).
5. Trigger deployment and observe the startup log:
   - Verify: `Flyway Community Edition ... Successfully applied 2 migrations`.
   - Verify: `Tomcat started on port 8080 (http) with context path ''`.

---

## 6. Frontend Deployment (Static Edge Hosting)

Because the frontend is built entirely on native HTML5, CSS3, and ES6 modules, **it requires zero server-side compilation**.

### 6.1 Deployment on Netlify / Vercel / Cloudflare Pages
1. Link your GitHub repository in Netlify or Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to empty (or leave blank).
4. Set **Publish Directory** to `.`.
5. Configure single-page redirection / headers if needed (`_redirects` or `netlify.toml`):
   ```
   /*    /index.html   200
   ```
6. In `frontend/js/api.js`, verify that the production API URL resolves to your deployed backend domain:
   `https://api.writespace.app/api/v1` (or your Render/Railway backend URL).

---

## 7. Master Production Environment Variables

Configure the following variables in your backend hosting dashboard:

| Variable Name | Production Value Example | Purpose |
|---|---|---|
| `PORT` | `8080` | Internal HTTP listening port |
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.insforge.app:5432/writespace_db?sslmode=require` | InsForge DB connection |
| `SPRING_DATASOURCE_USERNAME` | `writespace_user` | InsForge DB user |
| `SPRING_DATASOURCE_PASSWORD` | `<SECURE_PASSWORD>` | InsForge DB password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit token secret |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime (24 hours) |
| `FRONTEND_URL` | `https://writespace.app` | Restrictive CORS authorization |

---

## 8. Cross-Origin Resource Sharing (CORS) & HTTPS

- **HTTPS Mandate:** Both frontend and backend domains must run under HTTPS. Browsers will block requests as "Mixed Content" if an HTTPS frontend attempts to contact an HTTP API.
- **CORS Allowed Origins:** Ensure `FRONTEND_URL` exactly matches the public origin of your static frontend (including protocol and port, without trailing slash).

---

## 9. Post-Deployment Verification Checklist (Smoke Test)

Execute the following verification steps on the live production environment:

- [ ] **Health Check:** `curl -I https://api.writespace.app/api/v1/posts` returns HTTP 200.
- [ ] **SSL Verification:** Browser displays a secure lock icon on both frontend and backend domains.
- [ ] **Database Persistence:** Register a test account on the production web interface; verify record in InsForge PostgreSQL.
- [ ] **Article Publishing:** Compose an article with cover image; confirm unique slug resolves at `/article.html?slug=...`.
- [ ] **Social Interactions:** Execute like, comment, and follow actions; verify immediate UI state changes and persistent counts.
- [ ] **CORS Verification:** Inspect browser network tab: preflight `OPTIONS` requests respond with HTTP 200 and valid `Access-Control-Allow-Origin`.

---

## 10. Rollback & Disaster Recovery Procedures
1. **Application Rollback:** Both Netlify and Railway support one-click rollbacks to previous build commits.
2. **Database Point-In-Time Recovery:** InsForge automatically captures continuous WAL logs and daily database snapshots. In the event of catastrophic data corruption, initiate point-in-time restoration through the InsForge Console.
