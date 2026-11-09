# WriteSpace: Phased Engineering Roadmap

> **Lifecycle Model:** Phased Milestone Engineering  
> **Status:** Execution Roadmap Baseline  
> **Target Audience:** Engineering Leads, Full-Stack Developers, QA Engineers

---

## 1. Purpose
This document establishes the step-by-step engineering roadmap for implementing **WriteSpace**. It deconstructs development into 12 disciplined phases (Phase 0 through Phase 11), detailing exact tasks, technical deliverables, prerequisite dependencies, testing gates, and explicit completion criteria for each milestone.

---

## 2. Scope
This roadmap encompasses the complete project build sequence: infrastructure setup, Spring Boot initialization, InsForge database integration, security/JWT subsystem, entity CRUD, social graph mechanics, feed algorithms, frontend client assembly, comprehensive testing, and cloud deployment.

---

## 3. High-Level Phase Overview

```
Phase 0: Environment & Workspace Setup
   ↓
Phase 1: Backend Scaffolding & InsForge PostgreSQL Connection
   ↓
Phase 2: Authentication & Security Subsystem (BCrypt, Spring Security, JWT)
   ↓
Phase 3: User Management & Public Profiles
   ↓
Phase 4: Article Lifecycle Engine (Draft, Publish, Slug, CRUD)
   ↓
Phase 5: Social Engagement: Like System
   ↓
Phase 6: Social Engagement: Threaded Comments
   ↓
Phase 7: Social Graph: Follow & Following Networks
   ↓
Phase 8: Content Feeds (Personalized Following Feed & Explore Discovery)
   ↓
Phase 9: Frontend Client Development & REST Integration
   ↓
Phase 10: Comprehensive Multi-Tier Testing (Unit, Integration, Constraints)
   ↓
Phase 11: Production Deployment & Cloud Verification
```

---

## 4. Detailed Phase Specifications

### Phase 0: Environment & Workspace Setup
- **Tasks:**
  1. Verify local JDK 17+ and Maven 3.8+ installations.
  2. Provision InsForge PostgreSQL instance and capture connection parameters.
  3. Create root repository layout (`backend/`, `frontend/`, `docs/`).
  4. Author `.env.example` and baseline `.gitignore`.
- **Expected Output:** Clean workspace with verified tooling and database network reachability.
- **Dependencies:** None.
- **Testing:** Verify `psql` or JDBC test script successfully connects to InsForge PostgreSQL over SSL.
- **Completion Criteria:** Connection string validated and `.env` template committed.

---

### Phase 1: Spring Boot Initialization & PostgreSQL Connection
- **Tasks:**
  1. Initialize Spring Boot 3.2+ Maven project with Web, Security, Data JPA, and Validation starters.
  2. Configure `application.yml` with HikariCP connection pool properties and SSL settings.
  3. Create `src/main/resources/db/migration/V1__init_schema.sql` with core tables and constraints.
  4. Configure Flyway to run migrations automatically on application startup.
- **Expected Output:** Compiling Spring Boot project that boots up and executes Flyway migrations against InsForge PostgreSQL.
- **Dependencies:** Phase 0.
- **Testing:** Run `./mvnw spring-boot:run`. Confirm all 6 core tables (`users`, `posts`, `comments`, `likes`, `follows`, `bookmarks`) exist in PostgreSQL.
- **Completion Criteria:** Flyway creates schema without errors and Hibernate validates schema with `ddl-auto=validate`.

---

### Phase 2: User Authentication & Security Subsystem
- **Tasks:**
  1. Implement `User` JPA entity and `UserRepository`.
  2. Implement `BCryptPasswordEncoder` bean with cost factor 12.
  3. Author `JwtTokenProvider` for HMAC-SHA256 token generation, signing, and claim verification.
  4. Implement `JwtAuthenticationFilter` and `SecurityFilterChain` in `SecurityConfig`.
  5. Implement `AuthController` with `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, and `GET /api/v1/auth/me`.
- **Expected Output:** Working stateless JWT authentication system.
- **Dependencies:** Phase 1.
- **Testing:** Integration tests verifying successful registration, login token issuance, and rejection of invalid credentials (401).
- **Completion Criteria:** Users can register and login; valid JWT grants access to protected endpoints.

---

### Phase 3: User Management & Public Profiles
- **Tasks:**
  1. Implement `UserService` and `UserController`.
  2. Build `GET /api/v1/users/{username}` returning public author profile, statistics, and follow state.
  3. Build `PUT /api/v1/users/profile` allowing authenticated users to update bio, display name, and avatar.
  4. Implement `UserMapper` converting User entity to `UserProfileResponse`.
- **Expected Output:** User profile viewing and management APIs.
- **Dependencies:** Phase 2.
- **Testing:** Verify updating profile persists in PostgreSQL; verify non-authenticated calls cannot update profiles.
- **Completion Criteria:** Profile endpoints operational with input validation.

---

### Phase 4: Article Lifecycle Engine (Draft, Publish, CRUD)
- **Tasks:**
  1. Implement `Post` entity, `PostStatus` enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and `PostRepository`.
  2. Implement automatic kebab-case slug generator with collision resolution.
  3. Implement reading-time calculation utility.
  4. Implement `PostService` and `PostController`:
     - `POST /api/v1/posts` (Create draft or publish)
     - `GET /api/v1/posts/{slug}` (Retrieve single post)
     - `PUT /api/v1/posts/{id}` (Update article - owner check)
     - `DELETE /api/v1/posts/{id}` (Delete article - cascade)
     - `GET /api/v1/posts/drafts` (Author's private drafts)
- **Expected Output:** Complete article creation, publishing, editing, and deletion engine.
- **Dependencies:** Phase 3.
- **Testing:** Verify slug generation; verify IDOR protection (User A cannot edit User B's post).
- **Completion Criteria:** Authors can draft and publish articles with unique slugs and estimated reading times.

---

### Phase 5: Social Engagement: Like System
- **Tasks:**
  1. Implement `Like` entity and `LikeRepository`.
  2. Implement `LikeService` with idempotent toggle logic (`toggleLike(postId, userId)`).
  3. Expose `POST /api/v1/posts/{id}/like` in `SocialController`.
  4. Ensure composite unique constraint `(user_id, post_id)` prevents duplicate likes.
- **Expected Output:** Like/unlike toggling API with atomic counter updates.
- **Dependencies:** Phase 4.
- **Testing:** Verify toggling like increments and decrements count; verify concurrent like attempts do not create duplicate rows.
- **Completion Criteria:** Endpoints return accurate like status and counts.

---

### Phase 6: Social Engagement: Threaded Comments
- **Tasks:**
  1. Implement `Comment` entity and `CommentRepository`.
  2. Implement `CommentService` with content sanitization (stripping HTML).
  3. Expose `GET /api/v1/posts/{id}/comments`, `POST /api/v1/posts/{id}/comments`, and `DELETE /api/v1/comments/{id}`.
  4. Enforce deletion authorization: comment author OR article author can delete comments.
- **Expected Output:** Working comment discussion system.
- **Dependencies:** Phase 5.
- **Testing:** Test comment creation, character limit validation ($\le 1000$ chars), and deletion permissions.
- **Completion Criteria:** Comments persist, associate correctly with post and user, and delete cleanly.

---

### Phase 7: Social Graph: Follow & Following Networks
- **Tasks:**
  1. Implement `Follow` entity and `FollowRepository`.
  2. Implement `FollowService` with self-follow prevention (`follower_id <> following_id`).
  3. Expose `POST /api/v1/users/{id}/follow`.
  4. Expose `GET /api/v1/users/{username}/followers` and `GET /api/v1/users/{username}/following`.
- **Expected Output:** Directed social graph engine.
- **Dependencies:** Phase 6.
- **Testing:** Attempting to follow oneself returns HTTP 400; duplicate follow toggles to unfollow.
- **Completion Criteria:** Social graph accurately calculates follower and following totals.

---

### Phase 8: Content Feeds (Following Feed & Explore Discovery)
- **Tasks:**
  1. Implement `FeedService` and `FeedController`.
  2. Build `GET /api/v1/feed` with JPQL inner join querying posts by followed authors, sorted by `publishedAt DESC`.
  3. Enhance `GET /api/v1/posts` with pagination (`Pageable`), tag filtering (`?tag=...`), and keyword search (`?q=...`).
  4. Implement `BookmarkService` and `GET /api/v1/bookmarks` for saved reading lists.
- **Expected Output:** Chronological personalized feeds and search discovery endpoints.
- **Dependencies:** Phase 7.
- **Testing:** Feed returns only published posts from followed authors; pagination correctly segments results.
- **Completion Criteria:** Feed and search APIs return expected records within latency budgets.

---

### Phase 9: Frontend Client Development & REST Integration
- **Tasks:**
  1. Build CSS design system (`variables.css`, `base.css`, `components.css`).
  2. Implement `api.js` with centralized fetch and token handling.
  3. Implement `auth.js` session manager and page guard logic.
  4. Implement `index.html` (Explore feed) and `feed.html` (Follower feed).
  5. Implement `article.html` (Reading view, comment thread, like button).
  6. Implement `editor.html` (Writing canvas, draft saving, publishing).
  7. Implement `profile.html` (Author stats, follow button, article catalog).
  8. Implement `login.html`, `register.html`, and `bookmarks.html`.
- **Expected Output:** Fully responsive, zero-build frontend communicating with Spring Boot REST API.
- **Dependencies:** Phase 8.
- **Testing:** Cross-browser verification; form validation checks; responsive layout testing on mobile viewports.
- **Completion Criteria:** All 20 MVP features accessible and interactive via the browser.

---

### Phase 10: Multi-Tier Testing & Hardening
- **Tasks:**
  1. Execute full unit test suite for services and mappers.
  2. Execute `@SpringBootTest` integration tests covering all controller endpoints.
  3. Perform database constraint stress tests (duplicate likes, self-follows).
  4. Run OWASP dependency checks and verify input sanitization against XSS payloads.
  5. Profile database queries to confirm zero N+1 query leaks.
- **Expected Output:** Hardened, fully tested application codebase.
- **Dependencies:** Phase 9.
- **Testing:** Automated Maven test run (`./mvnw test`) achieves 100% pass rate.
- **Completion Criteria:** All test suites pass and security audits report zero critical vulnerabilities.

---

### Phase 11: Production Deployment & Cloud Verification
- **Tasks:**
  1. Package executable backend JAR (`./mvnw clean package`).
  2. Deploy Spring Boot backend to Java runtime host (Railway, Render, VPS).
  3. Deploy static frontend to Edge CDN (Netlify, Vercel, Cloudflare Pages).
  4. Configure production environment variables and verify TLS encryption.
  5. Execute end-to-end smoke testing across live domain.
- **Expected Output:** Live, publicly accessible WriteSpace platform.
- **Dependencies:** Phase 10.
- **Testing:** Execute live registration, publication, like, comment, and follow in production.
- **Completion Criteria:** Production system operates with sub-200ms latency and zero runtime errors.

---

## 5. Implementation Guidelines
- Complete each phase sequentially; do not start subsequent phases until preceding phase test gates pass.
- Maintain atomic Git commits tied to phase milestones.

---

## 6. Testing Requirements
- Every phase requires automated test coverage prior to milestone sign-off.

---

## 7. Acceptance Criteria
- [ ] All 12 phases executed to completion.
- [ ] Working application meets all functional and non-functional requirements.
- [ ] Deployed production instance accessible to public users.
