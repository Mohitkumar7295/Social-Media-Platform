# WriteSpace: Project Directory Structure & Taxonomy

> **Document Version:** 2.0.0  
> **Status:** Implementation Architecture Standard  
> **Target Audience:** All Engineers, Full-Stack Developers, and Contributors

---

## 1. Purpose
This document provides the definitive, comprehensive directory structure, module taxonomy, and file organization rules for the **WriteSpace** repository. It defines exactly where source code, configuration files, migration scripts, tests, assets, and documentation belong across both backend and frontend tiers.

---

## 2. Scope
This specification governs:
- Root repository layout and project-level orchestration files.
- Complete Java / Spring Boot backend package hierarchy, class layout, resources, and test suites.
- Complete static client directory structure, HTML page contracts, modular CSS stylesheets, assets, and JavaScript modules.
- Database migration directory management (Flyway).
- File naming conventions and dependency placement standards.

---

## 3. Complete Project Structure Tree Map

The following exhaustive tree map illustrates every file, package, directory, and resource in the WriteSpace platform:

```
WriteSpace/
├── .env.example                                    # Environment variables template
├── .gitignore                                      # Git ignore rules for Java, OS, IDEs
├── README.md                                       # Master project documentation & onboarding
│
├── docs/                                           # Complete project documentation suite
│   ├── DOCUMENTATION_INDEX.md                      # Navigation map of all documentation
│   ├── PROJECT_OVERVIEW.md                         # Vision, mission, goals, audience, personas
│   ├── ARCHITECTURE.md                             # Deep technical architecture manual
│   ├── REQUIREMENTS.md                             # System Requirements Specification (SRS)
│   ├── FEATURES.md                                 # Comprehensive feature catalog & MVP matrix
│   ├── DATABASE_SCHEMA.md                          # Relational schema, DDL, Flyway, indexes
│   ├── API_DOCUMENTATION.md                        # REST API specification & JSON payloads
│   ├── AUTHENTICATION_SECURITY.md                  # Spring Security, JWT, BCrypt, hardening
│   ├── BACKEND_DOCUMENTATION.md                    # Spring Boot engineering manual
│   ├── FRONTEND_DOCUMENTATION.md                   # Vanilla JS & CSS UI architecture
│   ├── USER_WORKFLOWS.md                           # User journeys and sequence flowcharts
│   ├── UI_UX_GUIDELINES.md                         # Design tokens, typography, component rules
│   ├── PROJECT_STRUCTURE.md                        # Full repository taxonomy (This Document)
│   ├── DEVELOPMENT_ROADMAP.md                      # 12-phase engineering roadmap
│   ├── TESTING_STRATEGY.md                         # Quality assurance and testing manual
│   ├── DEPLOYMENT_GUIDE.md                         # Local, cloud, and InsForge deployment
│   ├── CONTRIBUTING.md                             # Git workflows, PR standards, code quality
│   └── FUTURE_ENHANCEMENTS.md                      # Long-term feature roadmap
│
├── backend/                                        # Spring Boot Java application
│   ├── pom.xml                                     # Maven dependencies and build configuration
│   ├── mvnw                                        # Maven wrapper script (Unix/macOS)
│   ├── mvnw.cmd                                    # Maven wrapper script (Windows)
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── writespace/
│       │   │           ├── WriteSpaceApplication.java         # Spring Boot entry point
│       │   │           │
│       │   │           ├── config/                            # Infrastructure & framework beans
│       │   │           │   ├── SecurityConfig.java            # SecurityFilterChain & CORS rules
│       │   │           │   ├── WebMvcConfig.java              # WebMvcConfigurer & formatters
│       │   │           │   ├── JpaConfig.java                 # JPA Auditing listener setup
│       │   │           │   ├── OpenApiConfig.java             # Swagger/OpenAPI documentation
│       │   │           │   └── CorsConfig.java                # Cross-origin policy definition
│       │   │           │
│       │   │           ├── controller/                        # REST Controllers (@RestController)
│       │   │           │   ├── AuthController.java            # /api/v1/auth (Register, Login, Me)
│       │   │           │   ├── UserController.java            # /api/v1/users (Profile lookup & edit)
│       │   │           │   ├── PostController.java            # /api/v1/posts (Article CRUD & slugs)
│       │   │           │   ├── CommentController.java         # /api/v1/posts/{id}/comments
│       │   │           │   ├── SocialController.java          # /api/v1/posts/{id}/like
│       │   │           │   ├── FollowController.java          # /api/v1/users/{id}/follow
│       │   │           │   ├── FeedController.java            # /api/v1/feed (Following feed)
│       │   │           │   └── BookmarkController.java        # /api/v1/bookmarks (Saved posts)
│       │   │           │
│       │   │           ├── dto/                               # Data Transfer Objects (Records)
│       │   │           │   ├── request/                       # Inbound request bodies with @Valid
│       │   │           │   │   ├── RegisterRequest.java       # User registration payload
│       │   │           │   │   ├── LoginRequest.java          # User login payload
│       │   │           │   │   ├── ProfileUpdateRequest.java  # Bio & display name update
│       │   │           │   │   ├── PostCreateRequest.java     # Article draft/publish payload
│       │   │           │   │   ├── PostUpdateRequest.java     # Article modification payload
│       │   │           │   │   └── CommentCreateRequest.java  # Comment text payload
│       │   │           │   │
│       │   │           │   └── response/                      # Outbound response bodies
│       │   │           │       ├── AuthResponse.java          # JWT token + user summary
│       │   │           │       ├── UserSummaryResponse.java   # Lightweight user metadata
│       │   │           │       ├── UserProfileResponse.java   # Full profile + follow stats
│       │   │           │       ├── PostResponse.java          # Full article with author & counts
│       │   │           │       ├── PostSummaryResponse.java   # Article card summary for feeds
│       │   │           │       ├── CommentResponse.java       # Comment + author metadata
│       │   │           │       ├── LikeToggleResponse.java    # Boolean liked + total count
│       │   │           │       ├── FollowToggleResponse.java  # Boolean following + follower count
│       │   │           │       ├── BookmarkToggleResponse.java# Boolean bookmarked
│       │   │           │       ├── PageResponse.java          # Generic pagination envelope
│       │   │           │       ├── ErrorResponse.java         # Standard RFC 7807 error format
│       │   │           │       └── ValidationErrorResponse.java# Detailed field-error breakdown
│       │   │           │
│       │   │           ├── entity/                            # JPA / Hibernate database entities
│       │   │           │   ├── BaseAuditEntity.java           # created_at & updated_at base
│       │   │           │   ├── User.java                      # Users table mapping
│       │   │           │   ├── Post.java                      # Posts table mapping
│       │   │           │   ├── Comment.java                   # Comments table mapping
│       │   │           │   ├── Like.java                      # Likes table mapping
│       │   │           │   ├── Follow.java                    # Follows table mapping
│       │   │           │   ├── Bookmark.java                  # Bookmarks table mapping
│       │   │           │   └── enums/
│       │   │           │       ├── Role.java                  # ROLE_USER, ROLE_ADMIN
│       │   │           │       └── PostStatus.java            # DRAFT, PUBLISHED, ARCHIVED
│       │   │           │
│       │   │           ├── repository/                        # Spring Data JPA interfaces
│       │   │           │   ├── UserRepository.java            # User lookups & existence checks
│       │   │           │   ├── PostRepository.java            # Slug queries, feeds, and search
│       │   │           │   ├── CommentRepository.java         # Threaded comments by post_id
│       │   │           │   ├── LikeRepository.java            # Likes by user and post
│       │   │           │   ├── FollowRepository.java          # Social graph relationships
│       │   │           │   └── BookmarkRepository.java        # Saved reading list records
│       │   │           │
│       │   │           ├── service/                           # Business logic service contracts
│       │   │           │   ├── AuthService.java               # Authentication contract
│       │   │           │   ├── UserService.java               # Profile operations contract
│       │   │           │   ├── PostService.java               # Article CRUD contract
│       │   │           │   ├── CommentService.java            # Discussion comments contract
│       │   │           │   ├── SocialService.java             # Likes & interactions contract
│       │   │           │   ├── FollowService.java             # Social graph follow contract
│       │   │           │   ├── FeedService.java               # Following feed query contract
│       │   │           │   ├── BookmarkService.java           # Bookmarking contract
│       │   │           │   │
│       │   │           │   └── impl/                          # Transactional implementations
│       │   │           │       ├── AuthServiceImpl.java       # Registration, login, JWT issuance
│       │   │           │       ├── UserServiceImpl.java       # Profile retrieval & updates
│       │   │           │       ├── PostServiceImpl.java       # Publishing, slugs, read time
│       │   │           │       ├── CommentServiceImpl.java    # Sanitization & comments CRUD
│       │   │           │       ├── SocialServiceImpl.java     # Idempotent like toggling
│       │   │           │       ├── FollowServiceImpl.java     # Follow validation & self-check
│       │   │           │       ├── FeedServiceImpl.java       # Feed generation with joins
│       │   │           │       └── BookmarkServiceImpl.java   # Bookmark toggling & listing
│       │   │           │
│       │   │           ├── security/                          # Spring Security & JWT components
│       │   │           │   ├── JwtTokenProvider.java          # Token generation, claims, signing
│       │   │           │   ├── JwtAuthenticationFilter.java   # Bearer token interception filter
│       │   │           │   ├── JwtAuthenticationEntryPoint.java# 401 Unauthorized handler
│       │   │           │   ├── CustomUserDetailsService.java  # UserDetails resolution from DB
│       │   │           │   └── UserPrincipal.java             # Authenticated principal object
│       │   │           │
│       │   │           ├── mapper/                            # Entity <-> DTO mappers
│       │   │           │   ├── UserMapper.java                # User <-> UserDTO conversions
│       │   │           │   ├── PostMapper.java                # Post <-> PostDTO conversions
│       │   │           │   └── CommentMapper.java             # Comment <-> CommentDTO conversions
│       │   │           │
│       │   │           ├── exception/                         # Centralized exception handlers
│       │   │           │   ├── ResourceNotFoundException.java # 404 entity not found
│       │   │           │   ├── ResourceAlreadyExistsException.java # 409 conflict
│       │   │           │   ├── UnauthorizedActionException.java # 403 forbidden / IDOR
│       │   │           │   ├── SelfFollowException.java       # 400 self-follow violation
│       │   │           │   ├── InvalidTokenException.java     # 401 bad JWT
│       │   │           │   └── GlobalExceptionHandler.java    # Central @RestControllerAdvice
│       │   │           │
│       │   │           └── util/                              # Shared helper utilities
│       │   │               ├── SlugUtils.java                 # Kebab-case slug generator
│       │   │               └── ReadingTimeCalculator.java     # Word-count reading time estimator
│       │   │
│       │   └── resources/
│       │       ├── application.yml                            # Core Spring Boot configuration
│       │       ├── application-dev.yml                        # Local development overrides
│       │       ├── application-prod.yml                       # Production configuration & SSL
│       │       └── db/
│       │           └── migration/                             # Flyway SQL migrations
│       │               ├── V1__init_schema.sql                # Initial schema DDL & constraints
│       │               ├── V2__add_performance_indexes.sql    # B-Tree & composite indexes
│       │               └── V3__seed_initial_data.sql          # Test seed data
│       │
│       └── test/                                              # Automated test suites
│           └── java/
│               └── com/
│                   └── writespace/
│                       ├── controller/                        # Controller & API integration tests
│                       │   ├── AuthControllerTest.java        # Registration & login tests
│                       │   ├── PostControllerTest.java        # Article endpoint security tests
│                       │   └── SocialControllerTest.java      # Likes & comments endpoint tests
│                       ├── service/                           # Unit tests with Mockito
│                       │   ├── AuthServiceTest.java           # Authentication logic unit tests
│                       │   ├── PostServiceTest.java           # Slug & reading time unit tests
│                       │   └── FollowServiceTest.java         # Self-follow validation tests
│                       ├── repository/                        # JPA & constraint tests (@DataJpaTest)
│                       │   ├── UserRepositoryTest.java        # Unique constraint tests
│                       │   ├── PostRepositoryTest.java        # Custom JPQL feed tests
│                       │   └── LikeRepositoryTest.java        # Unique like constraint checks
│                       └── security/                          # Security subsystem tests
│                           └── JwtTokenProviderTest.java      # Token expiration & tampering tests
│
└── frontend/                                       # Responsive Web Client (HTML/CSS/JS)
    ├── index.html                                  # Global explore and landing view
    ├── feed.html                                   # Authenticated follower feed view
    ├── article.html                                # Article reading view & comments thread
    ├── editor.html                                 # Publishing studio & draft canvas
    ├── profile.html                                # Author profile and catalog view
    ├── bookmarks.html                              # Saved reading list view
    ├── login.html                                  # Sign-in view
    ├── register.html                               # Account registration view
    │
    ├── assets/                                     # Static media, icons, and illustrations
    │   ├── icons/
    │   │   ├── heart.svg                           # Unliked heart icon
    │   │   ├── heart-filled.svg                    # Liked active heart icon
    │   │   ├── bookmark.svg                        # Unsaved bookmark icon
    │   │   ├── bookmark-filled.svg                 # Saved bookmark icon
    │   │   ├── comment.svg                         # Comment bubble icon
    │   │   ├── search.svg                          # Search lens icon
    │   │   └── write.svg                           # Pencil compose icon
    │   └── images/
    │       ├── default-avatar.svg                  # Fallback author avatar image
    │       ├── placeholder-cover.webp              # Fallback article cover banner
    │       └── logo.svg                            # WriteSpace logo brand mark
    │
    ├── css/                                        # Modular stylesheets
    │   ├── variables.css                           # Design tokens (colors, typography, spacing)
    │   ├── base.css                                # Global resets, typography, container widths
    │   ├── components.css                          # Cards, buttons, forms, badges, modals, toasts
    │   └── pages/                                  # Specialized page stylesheets
    │       ├── index.css                           # Explore feed layout & hero styling
    │       ├── feed.css                            # Following feed layout & empty-state styling
    │       ├── article.css                         # Editorial reading column (700px) & typography
    │       ├── editor.css                          # Distraction-free writing canvas
    │       ├── profile.css                         # Author header, metrics, and tabs
    │       ├── bookmarks.css                       # Saved reading list card view
    │       └── auth.css                            # Centered authentication card forms
    │
    └── js/                                         # Modular JavaScript client engine
        ├── api.js                                  # REST API client & centralized fetch wrapper
        ├── auth.js                                 # Token storage & authentication state guard
        ├── ui.js                                   # Reusable UI toasts, formatting, DOM helpers
        └── pages/                                  # Page controllers (invoked per HTML view)
            ├── index.js                            # Explore feed loading & tag filtering
            ├── feed.js                             # Follower feed loading & empty state
            ├── article.js                          # Article rendering, like & comment handlers
            ├── editor.js                           # Draft autosave, slug check, publish handler
            ├── profile.js                          # Author stats & follow toggle handler
            ├── bookmarks.js                        # Bookmarks list loading & remove handler
            ├── login.js                            # Login form submission & token storage
            └── register.js                         # Registration form submission & validation
```

---

## 4. Backend Source Taxonomy Details (`backend/src/main/java/com/writespace/`)

| Package Directory | Layer & Role | Key Responsibilities |
|---|---|---|
| `config/` | Infrastructure | Spring Security filter chain, CORS configuration, JPA auditing listeners, and Jackson JSON serializers. |
| `controller/` | Perimeter / API | REST Controllers handling inbound HTTP requests, path parameters, query strings, and Bean Validation. |
| `dto/request/` | Inbound Contracts | Immutable request records (`RegisterRequest`, `PostCreateRequest`) with Jakarta `@Valid` constraints. |
| `dto/response/` | Outbound Contracts | Immutable response records (`PostResponse`, `UserProfileResponse`) hiding entity internals. |
| `entity/` | Persistence Domain | JPA Entity classes annotated with `@Entity`, `@Table`, mapping database tables into Java objects. |
| `entity/enums/` | Enumerations | Domain state types: `Role` (`ROLE_USER`, `ROLE_ADMIN`) and `PostStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`). |
| `repository/` | Data Access | Spring Data JPA interfaces declaring derived queries, JPQL statements, and pagination methods. |
| `service/` | Business Domain | Service interfaces defining pure business logic contracts. |
| `service/impl/` | Business Logic | Transactional service implementations managing persistence orchestration, validation, and authorization. |
| `security/` | Identity Protection | `JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, and principal models. |
| `mapper/` | Data Transformation | Explicit mapping classes translating entities into outbound DTOs and vice versa. |
| `exception/` | Error Interception | Custom domain exceptions (`ResourceNotFoundException`, `SelfFollowException`) and central `@RestControllerAdvice`. |
| `util/` | Utility Tools | Helper utilities: URL slug generator (`SlugUtils`), reading time calculator (`ReadingTimeCalculator`). |

---

## 5. Backend Resources Taxonomy Details (`backend/src/main/resources/`)

| Directory / File | Role & Contents |
|---|---|
| `application.yml` | Master Spring Boot configuration specifying server port, HikariCP pool properties, JPA configurations, and Flyway settings. |
| `application-dev.yml` | Development profile override for local database connections and verbose SQL logging. |
| `application-prod.yml` | Production profile enforcing strict schema validation (`ddl-auto=validate`), high performance logging, and SSL. |
| `db/migration/` | Versioned SQL scripts executed by Flyway in strict numerical sequence (`V1__init_schema.sql`, `V2__add_indexes.sql`, `V3__seed_initial_data.sql`). |

---

## 6. Backend Test Taxonomy Details (`backend/src/test/java/com/writespace/`)

| Package Directory | Test Scope & Technology |
|---|---|
| `controller/` | `@WebMvcTest` verifying HTTP status codes, validation error responses, and endpoint security barriers using `MockMvc`. |
| `service/` | Unit tests using JUnit 5 and Mockito verifying isolated business logic, calculations, and exception triggers. |
| `repository/` | `@DataJpaTest` validating PostgreSQL queries, database constraints, derived queries, and cascading logic. |
| `security/` | Security unit tests validating JWT token generation, signature tampering detection, and expiration parsing. |

---

## 7. Frontend Source Taxonomy Details (`frontend/`)

### 7.1 Page Structure (`frontend/*.html`)
Each HTML file represents an independent page view containing standard semantic HTML5 tags:
- `<header class="site-header">`: Global navigation with search, compose link, and auth triggers.
- `<main class="site-main">`: Unique content container for that view.
- `<footer class="site-footer">`: Legal, copyright, and global links.

### 7.2 Styling Taxonomy (`frontend/css/`)
1. `variables.css`: Must be imported first; defines CSS custom properties for all colors, fonts, spacing, and shadows.
2. `base.css`: CSS reset, root font settings, container widths.
3. `components.css`: Shared UI elements (buttons, inputs, cards, badges, toasts, modals).
4. `pages/*.css`: Specialized page layouts (e.g., `article.css` for reading width and serif styling, `editor.css` for canvas).

### 7.3 JavaScript Taxonomy (`frontend/js/`)
1. `api.js`: Universal fetch wrapper. Exports `request(endpoint, options)` with automatic token injection and error handling.
2. `auth.js`: Session manager. Exports `auth.getToken()`, `auth.setSession()`, `auth.requireAuth()`.
3. `ui.js`: DOM utilities. Exports `ui.showToast()`, `ui.formatDate()`, `ui.renderArticleCard()`.
4. `pages/*.js`: Dedicated controllers executed by `<script type="module" src="js/pages/xxx.js">` inside the respective HTML document.

---

## 8. File Naming Conventions

- **Java Files:** PascalCase (e.g., `PostServiceImpl.java`, `JwtTokenProvider.java`).
- **Flyway Migrations:** `V{Version}__{Description}.sql` (e.g., `V1__init_schema.sql`).
- **HTML Files:** lowercase kebab-case (e.g., `index.html`, `article.html`).
- **CSS Files:** lowercase kebab-case (e.g., `variables.css`, `components.css`).
- **JavaScript Files:** camelCase or lowercase (e.g., `api.js`, `article.js`).
- **Markdown Documentation:** UPPERCASE_SNAKE_CASE (e.g., `DATABASE_SCHEMA.md`).

---

## 9. Testing Requirements
- The repository layout must allow `./mvnw clean compile` and `./mvnw test` to execute with zero path configuration issues.
- Frontend static files must be servable by any standard web server without subpath rewrite complications.

---

## 10. Acceptance Criteria
- [ ] Directory layout matches this specification precisely.
- [ ] Every file resides in its designated architectural layer.
- [ ] No circular dependencies exist across packages.
