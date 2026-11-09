# WriteSpace: System Requirements Specification (SRS)

> **Document Version:** 1.0.0  
> **Classification:** Engineering Specification  
> **Status:** Approved Baseline

---

## 1. Purpose
This document provides a comprehensive, rigorous System Requirements Specification (SRS) for the **WriteSpace** social publishing platform. It enumerates the complete functional, non-functional, security, performance, software, hardware, and user requirements necessary to guide development, integration, and verification.

---

## 2. Scope
The requirements detailed herein govern the implementation of the WriteSpace client application (HTML5/CSS3/Vanilla JS), the backend application service (Java 17+ / Spring Boot 3.x), the relational database (PostgreSQL 15+ managed via InsForge), and external media storage integration.

---

## 3. Technical Explanation
WriteSpace provides an editorial content publishing engine intertwined with a social interaction graph. Every requirement specified in this document is traced to architectural components, validation rules, and acceptance verification criteria.

Requirements are uniquely categorized using standardized identifiers:
- **FR-AUTH-xx:** Authentication & Authorization Requirements
- **FR-USER-xx:** User Management & Profile Requirements
- **FR-POST-xx:** Article Publishing & Lifecycle Requirements
- **FR-SOCL-xx:** Social Interactions (Follow, Like, Comment, Bookmark) Requirements
- **FR-FEED-xx:** Content Discovery & Feed Requirements
- **NFR-PERF-xx:** Performance Requirements
- **NFR-SEC-xx:** Security Requirements
- **NFR-REL-xx:** Reliability & Data Integrity Requirements
- **NFR-ACC-xx:** Accessibility & Usability Requirements

---

## 4. User Requirements

| ID | User Role | Requirement Statement | Business Justification |
|---|---|---|---|
| **UR-01** | Writer | I want to compose, edit, and format long-form articles in a clean interface so that I can publish polished essays. | Core value proposition for content creators. |
| **UR-02** | Writer | I want to save unfinished articles as private drafts so that I can refine my work before making it public. | Protects work-in-progress content from premature discovery. |
| **UR-03** | Writer | I want to view my profile page and see my published articles, bio, and follower statistics. | Provides author branding and social validation. |
| **UR-04** | Reader | I want to browse an un-gated explore feed and search articles by topic tags and keywords. | Enables discovery of high-quality content without paywalls. |
| **UR-05** | Reader | I want to follow writers whose work I admire and see their articles in a personalized chronological feed. | Fosters direct reader-writer connection. |
| **UR-06** | Reader | I want to like, comment on, and bookmark articles to engage with authors and save articles for later reading. | Standard social engagement primitives. |

---

## 5. Functional Requirements (FR)

### 5.1 Authentication & Authorization (FR-AUTH)

| ID | Requirement Description | Validation Rules & Preconditions | Priority |
|---|---|---|---|
| **FR-AUTH-01** | User Registration | Valid email format, username (3–30 alphanumeric + underscore characters), password ($\ge 8$ chars, $\ge 1$ digit, $\ge 1$ special char). | High (MVP) |
| **FR-AUTH-02** | User Login | Correct email/password combination. Returns signed JWT containing user ID, username, and role. | High (MVP) |
| **FR-AUTH-03** | Stateless Authentication | Client includes JWT in `Authorization: Bearer <token>` header on protected endpoints. | High (MVP) |
| **FR-AUTH-04** | User Logout | Client purges token from storage; subsequent protected calls reject with HTTP 401. | High (MVP) |
| **FR-AUTH-05** | Current User Context | `GET /api/v1/auth/me` returns current authenticated user profile and roles. | High (MVP) |
| **FR-AUTH-06** | Role-Based Access Control | Support for `ROLE_USER` and `ROLE_ADMIN` roles enforced via Spring Security annotations. | Medium |

### 5.2 User & Profile Management (FR-USER)

| ID | Requirement Description | Validation Rules & Preconditions | Priority |
|---|---|---|---|
| **FR-USER-01** | Public Author Profile | Retrieve author public profile by username: display name, bio, avatar, follower/following count, joined date. | High (MVP) |
| **FR-USER-02** | Profile Editing | Authenticated user can update display name, bio (max 500 chars), and avatar image URL. | High (MVP) |
| **FR-USER-03** | Avatar Upload | Authenticated user can upload JPG/PNG/WEBP avatar image ($\le 2\text{ MB}$). | Medium |
| **FR-USER-04** | Unique Identity Enforcement | Username and email must be case-insensitively unique across the entire system. | High (MVP) |

### 5.3 Article Publishing & Content Management (FR-POST)

| ID | Requirement Description | Validation Rules & Preconditions | Priority |
|---|---|---|---|
| **FR-POST-01** | Create Draft Article | Authenticated user can save article with title, content, tags, and status `DRAFT`. | High (MVP) |
| **FR-POST-02** | Publish Article | Change status to `PUBLISHED`. Generates unique URL slug, sets `published_at = NOW()`, calculates reading time. | High (MVP) |
| **FR-POST-03** | Automatic Slug Generation | Slugs formatted as `kebab-case` from title. Collisions append a unique 6-character alphanumeric suffix. | High (MVP) |
| **FR-POST-04** | Reading Time Estimation | Computed as $\lceil \text{word\_count} / 200 \rceil$ minutes; persisted on publication. | Medium |
| **FR-POST-05** | Edit Article | Author can update title, content, cover image, and tags. Slug remains immutable after initial publication. | High (MVP) |
| **FR-POST-06** | Delete Article | Author can delete their own article. Deletion cascades to comments, likes, and bookmarks. | High (MVP) |
| **FR-POST-07** | Get Single Article | Retrieve article by slug: includes author details, like count, comment count, and view counts. | High (MVP) |
| **FR-POST-08** | List Author's Articles | Fetch paginated list of published articles authored by a specific user. | High (MVP) |

### 5.4 Social Graph & Reader Engagement (FR-SOCL)

| ID | Requirement Description | Validation Rules & Preconditions | Priority |
|---|---|---|---|
| **FR-SOCL-01** | Follow Author | Authenticated user can follow an author. Enforce constraint: `follower_id <> following_id`. | High (MVP) |
| **FR-SOCL-02** | Unfollow Author | Authenticated user can unfollow an author they currently follow. | High (MVP) |
| **FR-SOCL-03** | List Followers/Following | Paginated retrieval of followers and following lists for any user profile. | High (MVP) |
| **FR-SOCL-04** | Like Article | Authenticated user can like a post. User can like a post only once (composite unique key). | High (MVP) |
| **FR-SOCL-05** | Unlike Article | Authenticated user can remove their like from a previously liked post. | High (MVP) |
| **FR-SOCL-06** | Post Comment | Authenticated user can submit a text comment ($\le 1000$ chars) on a published post. | High (MVP) |
| **FR-SOCL-07** | Delete Comment | Comment author or article author can delete a comment. | High (MVP) |
| **FR-SOCL-08** | Bookmark Article | Authenticated user can save an article to their private reading list. | High (MVP) |
| **FR-SOCL-09** | List Bookmarks | Retrieve paginated list of articles bookmarked by the authenticated user. | High (MVP) |

### 5.5 Feeds & Content Discovery (FR-FEED)

| ID | Requirement Description | Validation Rules & Preconditions | Priority |
|---|---|---|---|
| **FR-FEED-01** | Global Discovery Feed | Paginated feed of published articles sorted by publication date descending. | High (MVP) |
| **FR-FEED-02** | Personalized Following Feed | Paginated feed of published articles authored exclusively by users the current user follows. | High (MVP) |
| **FR-FEED-03** | Tag Filtering | Filter published articles matching a specific tag string (e.g., `?tag=engineering`). | High (MVP) |
| **FR-FEED-04** | Keyword Search | Case-insensitive search matching title or excerpt keywords (`?q=spring`). | High (MVP) |

---

## 6. Non-Functional Requirements (NFR)

### 6.1 Performance Requirements (NFR-PERF)

| ID | Parameter | Requirement Specification |
|---|---|---|
| **NFR-PERF-01** | API Latency | 95th percentile ($P_{95}$) response time $< 200\text{ ms}$ for read endpoints under 100 concurrent requests. |
| **NFR-PERF-02** | Write Latency | Article creation and comment submissions must complete within $< 350\text{ ms}$. |
| **NFR-PERF-03** | Database Query Budget | No single user-facing request shall execute $> 3$ SQL queries (N+1 query strictly forbidden). |
| **NFR-PERF-04** | Client Payload Size | Frontend core static assets (HTML + CSS + JS) must not exceed $200\text{ KB}$ gzipped. |

### 6.2 Security Requirements (NFR-SEC)

| ID | Category | Requirement Specification |
|---|---|---|
| **NFR-SEC-01** | Password Storage | Passwords hashed using standard BCrypt with cost factor 12. Plaintext never stored or logged. |
| **NFR-SEC-02** | Token Security | JWT tokens cryptographically signed using HMAC-SHA256 with 256-bit secret stored in environment. |
| **NFR-SEC-03** | Injection Defense | 100% of database operations parameterized via Spring Data JPA / Hibernate to eliminate SQL injection. |
| **NFR-SEC-04** | XSS Prevention | All user text rendered in the DOM using `.textContent` or safe HTML encoding. No raw `innerHTML` from inputs. |
| **NFR-SEC-05** | CORS Restrictions | Restrictive CORS headers allowing only designated production/local frontend domains. |
| **NFR-SEC-06** | Transport Encryption | All communication mandated over HTTPS with TLS 1.3/1.2; database connections require SSL. |
| **NFR-SEC-07** | IDOR Protection | Backend validates author ownership on all mutation/deletion endpoints before applying changes. |

### 6.3 Reliability & Data Integrity (NFR-REL)

| ID | Parameter | Requirement Specification |
|---|---|---|
| **NFR-REL-01** | ACID Compliance | All multi-step mutating operations wrapped in `@Transactional` to guarantee atomic rollbacks on failure. |
| **NFR-REL-02** | Foreign Key Invariants | Foreign key cascading rules maintain referential integrity with zero orphaned child rows. |
| **NFR-REL-03** | Schema Reproducibility | 100% of database DDL changes managed via Flyway versioned scripts with automated startup validation. |
| **NFR-REL-04** | Connection Fault Tolerance | HikariCP pool configured with automatic reconnection, validation test queries, and timeout thresholds. |

### 6.4 Usability & Accessibility (NFR-ACC)

| ID | Standard | Requirement Specification |
|---|---|---|
| **NFR-ACC-01** | Responsive Viewports | Fully functional across mobile ($320\text{px}+$), tablet ($768\text{px}+$), and desktop ($1024\text{px}+$). |
| **NFR-ACC-02** | Web Accessibility | WCAG 2.1 Level AA compliance, semantic HTML landmarks, and contrast ratios $\ge 4.5:1$ for body text. |
| **NFR-ACC-03** | Typography Readability | Editorial reading line-length constrained to $65\text{--}75$ characters per line for optimal legibility. |

---

## 7. Software & Hardware Requirements

### 7.1 Development Environment
- **Operating System:** Windows 10/11, macOS 13+, or Ubuntu 22.04 LTS.
- **Java Development Kit:** OpenJDK 17 LTS or 21 LTS (Temurin / Corretto).
- **Build Tool:** Apache Maven 3.8.x+.
- **Database Engine:** PostgreSQL 15.x+ (Local or InsForge-managed).
- **Web Browser:** Google Chrome 110+, Mozilla Firefox 110+, or Apple Safari 16+.

### 7.2 Production Hosting Environment
- **Backend Host:** Linux container runtime with $\ge 512\text{ MB}$ RAM and $\ge 1$ vCPU.
- **Database Host:** InsForge Managed PostgreSQL instance with SSL enabled.
- **Frontend Host:** Static file web server or Edge CDN (Netlify, Vercel, Cloudflare Pages, Nginx).

---

## 8. Requirements Traceability Matrix (Sample)

| Req ID | Component | Implementation Class | Verification Test |
|---|---|---|---|
| **FR-AUTH-01** | Backend Security | `AuthServiceImpl.register()` | `AuthServiceTest.shouldRegisterUser()` |
| **FR-POST-02** | Publishing Engine | `PostServiceImpl.publishPost()` | `PostServiceTest.shouldPublishAndGenerateSlug()` |
| **FR-SOCL-01** | Social Graph | `FollowServiceImpl.followUser()` | `FollowServiceTest.shouldPreventSelfFollow()` |
| **FR-SOCL-04** | Social Interactions | `LikeServiceImpl.toggleLike()` | `LikeRepositoryTest.shouldEnforceUniqueUserPostLike()` |
| **FR-FEED-02** | Feed Generation | `FeedServiceImpl.getUserFeed()` | `FeedIntegrationTest.shouldReturnOnlyFollowedPosts()` |

---

## 9. Testing & Acceptance Criteria

A requirement is deemed accepted if and only if:
1. All automated unit tests covering the requirement pass with $0$ errors.
2. Integration tests verify correct HTTP status codes, JSON payload schemas, and database side effects.
3. Database constraints throw expected violation exceptions when tested with adversarial inputs (e.g., self-following or duplicate likes).
4. Frontend manually executes the end-to-end user journey without unhandled JavaScript exceptions in the browser console.
