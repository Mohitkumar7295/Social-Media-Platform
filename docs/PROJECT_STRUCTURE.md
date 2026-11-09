# WriteSpace: Project Directory Structure & Taxonomy

> **Document Version:** 1.0.0  
> **Status:** Implementation Architecture Standard  
> **Target Audience:** All Engineers and Contributors

---

## 1. Purpose
This document provides the definitive directory structure, module taxonomy, and file organization rules for the **WriteSpace** repository. It defines exactly where source code, configuration files, migration scripts, tests, assets, and documentation belong.

---

## 2. Scope
This specification governs:
- Root repository layout and project-level orchestration files.
- Java / Spring Boot backend package hierarchy and test suites.
- Static client directory structure, CSS modularization, and JavaScript modules.
- Database migration directory management (Flyway).
- File naming conventions and dependency placement standards.

---

## 3. High-Level Repository Architecture

```
WriteSpace/
├── README.md                           # Master project documentation & onboarding guide
├── .env.example                        # Template for environment variables
├── .gitignore                          # Standard multi-language Git ignore rules
│
├── docs/                               # Complete project engineering documentation suite
│   ├── DOCUMENTATION_INDEX.md          # Global documentation map and navigation
│   ├── PROJECT_OVERVIEW.md             # Vision, problem space, audience, objectives
│   ├── ARCHITECTURE.md                 # Deep technical architecture manual
│   ├── REQUIREMENTS.md                 # System Requirements Specification (SRS)
│   ├── FEATURES.md                     # Comprehensive feature catalog & MVP matrix
│   ├── DATABASE_SCHEMA.md              # Relational schema, Flyway scripts, constraints
│   ├── API_DOCUMENTATION.md            # REST API endpoints, schemas, status codes
│   ├── AUTHENTICATION_SECURITY.md      # Security filter chain, JWT, BCrypt, hardening
│   ├── BACKEND_DOCUMENTATION.md        # Spring Boot engineering & layer guide
│   ├── FRONTEND_DOCUMENTATION.md       # Vanilla JS & CSS UI architecture
│   ├── USER_WORKFLOWS.md               # User journeys, interaction flows, sequence maps
│   ├── UI_UX_GUIDELINES.md             # Design tokens, typography, component rules
│   ├── PROJECT_STRUCTURE.md            # Directory and file taxonomy (This Document)
│   ├── DEVELOPMENT_ROADMAP.md          # Phased engineering roadmap
│   ├── TESTING_STRATEGY.md             # Quality assurance, test pyramid, test cases
│   ├── DEPLOYMENT_GUIDE.md             # Local, cloud, and InsForge deployment manual
│   ├── CONTRIBUTING.md                 # Git workflows, code reviews, PR standards
│   └── FUTURE_ENHANCEMENTS.md          # Post-MVP capabilities and long-term vision
│
├── backend/                            # Spring Boot Java application
│   ├── pom.xml                         # Maven build configuration & dependencies
│   ├── mvnw                            # Maven wrapper script (Unix/macOS)
│   ├── mvnw.cmd                        # Maven wrapper script (Windows)
│   └── src/
│       ├── main/
│       │   ├── java/com/writespace/    # Application Java source code
│       │   └── resources/
│       │       ├── application.yml     # Application configuration & profiles
│       │       └── db/migration/       # Flyway SQL migrations (V1, V2...)
│       └── test/java/com/writespace/   # Automated unit and integration test suites
│
└── frontend/                           # Responsive Web Client (HTML/CSS/JS)
    ├── index.html                      # Global explore and landing view
    ├── feed.html                       # Authenticated follower feed view
    ├── article.html                    # Article reading view & comments
    ├── editor.html                     # Publishing studio & draft canvas
    ├── profile.html                    # Author profile and catalog view
    ├── bookmarks.html                  # Saved reading list view
    ├── login.html                      # Sign-in view
    ├── register.html                   # Account registration view
    ├── css/                            # Modular stylesheets
    │   ├── variables.css               # Design tokens (colors, typography, spacing)
    │   ├── base.css                    # Global resets, base typography, grid
    │   ├── components.css              # Cards, buttons, forms, badges, modals
    │   └── pages/                      # Specialized page styles
    └── js/                             # Modular JavaScript files
        ├── api.js                      # REST API client & centralized fetch wrapper
        ├── auth.js                     # Token storage & authentication state
        ├── ui.js                       # Reusable UI toasts, formatting, DOM helpers
        └── pages/                      # Page-specific execution controllers
```

---

## 4. Backend Source Taxonomy (`backend/src/main/java/com/writespace/`)

| Package Directory | Layer & Role | Key Responsibilities |
|---|---|---|
| `config/` | Infrastructure | Spring Security filter chain, CORS configuration, JPA auditing listeners, and Jackson JSON serializers. |
| `controller/` | Perimeter / API | REST Controllers handling inbound HTTP requests, path parameters, query strings, and Bean Validation. |
| `dto/` | Contracts | Immutable request records (`RegisterRequest`, `PostCreateRequest`) and response records (`PostResponse`, `UserProfileResponse`). |
| `entity/` | Persistence Domain | JPA Entity classes annotated with `@Entity`, `@Table`, `@ManyToOne`, mapping database tables into Java objects. |
| `exception/` | Error Interception | Custom domain exceptions (`ResourceNotFoundException`, `SelfFollowException`) and central `@RestControllerAdvice`. |
| `mapper/` | Data Transformation | Explicit mapping classes translating entities into outbound DTOs and vice versa. |
| `repository/` | Data Access | Spring Data JPA interfaces declaring derived queries, JPQL statements, and pagination methods. |
| `security/` | Identity Protection | `JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, and principal models. |
| `service/` | Business Domain | Service interfaces and transactional implementations housing all business rules and authorizations. |

---

## 5. Backend Resources Taxonomy (`backend/src/main/resources/`)

| Directory / File | Role & Contents |
|---|---|
| `application.yml` | Master Spring Boot configuration specifying server port, HikariCP pool properties, JPA configurations, and Flyway settings. |
| `application-dev.yml` | Development profile override for local database connections and verbose SQL logging. |
| `application-prod.yml` | Production profile enforcing strict schema validation (`ddl-auto=validate`), high performance logging, and SSL. |
| `db/migration/` | Versioned SQL scripts executed by Flyway in strict numerical sequence (`V1__init_schema.sql`, `V2__add_indexes.sql`). |

---

## 6. Backend Test Taxonomy (`backend/src/test/java/com/writespace/`)

| Package Directory | Test Scope & Technology |
|---|---|
| `controller/` | `@WebMvcTest` verifying HTTP status codes, validation error responses, and endpoint security barriers using `MockMvc`. |
| `service/` | Unit tests using JUnit 5 and Mockito verifying isolated business logic, calculations, and exception triggers. |
| `repository/` | `@DataJpaTest` validating PostgreSQL queries, database constraints, derived queries, and cascading logic. |
| `security/` | Security unit tests validating JWT token generation, signature tampering detection, and expiration parsing. |

---

## 7. Frontend Source Taxonomy (`frontend/`)

### 7.1 Page Structure (`frontend/*.html`)
Each HTML file represents an independent page view containing standard semantic HTML5 tags:
- `<header class="site-header">`: Global navigation.
- `<main class="site-main">`: Unique content container for that view.
- `<footer class="site-footer">`: Legal, copyright, and global links.

### 7.2 Styling Taxonomy (`frontend/css/`)
1. `variables.css`: Must be imported first; defines CSS custom properties for all colors, fonts, spacing, and shadows.
2. `base.css`: CSS reset, root font settings, container widths.
3. `components.css`: Shared UI elements (buttons, inputs, cards, toasts).
4. `pages/*.css`: Specialized page layouts (e.g., `article.css` for reading width and serif styling, `editor.css` for canvas).

### 7.3 JavaScript Taxonomy (`frontend/js/`)
1. `api.js`: Universal fetch wrapper. Exports `request(endpoint, options)`.
2. `auth.js`: Session manager. Exports `auth.getToken()`, `auth.setSession()`, `auth.requireAuth()`.
3. `ui.js`: DOM utilities. Exports `ui.showToast()`, `ui.formatDate()`, `ui.renderArticleCard()`.
4. `pages/*.js`: Dedicated controller executed by `<script type="module" src="js/pages/xxx.js">` inside the respective HTML document.

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
