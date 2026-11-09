# WriteSpace: Contribution Guidelines & Engineering Standards

> **Document Type:** Developer Standards & Contribution Governance  
> **Status:** Implementation Baseline Standard

---

## 1. Purpose
This document provides the definitive contribution workflow, code quality standards, branching policies, commit message conventions, testing requirements, and pull request procedures for developers working on the **WriteSpace** platform.

---

## 2. Scope
This standard applies to all code and documentation contributions across:
- The Spring Boot Java backend (`backend/`)
- The HTML5/CSS3/Vanilla JS frontend (`frontend/`)
- Relational schema migrations (`backend/src/main/resources/db/migration/`)
- Architectural and technical documentation (`docs/`)

---

## 3. Core Development Principles

1. **Zero Undocumented Behavior:** Every new endpoint, schema change, or major user feature must have corresponding updates in `docs/`.
2. **Layer Discipline:** Strictly adhere to Controller $\rightarrow$ Service $\rightarrow$ Repository separation. Never leak JPA entities into Controller return types.
3. **Fail-Fast Validation:** Validate all inbound payloads using Jakarta Bean Validation at the controller perimeter.
4. **Relational Guarantees First:** Enforce data constraints (unique checks, cascades, check constraints) in PostgreSQL DDL scripts, not solely in application code.

---

## 4. Git Branching Strategy

WriteSpace adheres to a streamlined **Feature Branch Workflow**:

- `main`: Production-ready branch. Direct pushes to `main` are strictly blocked.
- `develop`: Integration branch where completed feature branches merge.
- Feature branches branch off `develop` and follow this naming schema:

```
feature/<issue-number>-<short-description>
fix/<issue-number>-<short-description>
docs/<issue-number>-<short-description>
refactor/<short-description>
```

### Examples
- `feature/102-author-profile-api`
- `fix/145-like-race-condition`
- `docs/108-update-api-specs`

---

## 5. Commit Message Conventions (Conventional Commits)

Commit messages must adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short imperative summary>

[optional detailed description]

[optional issue reference]
```

### Allowed Types
- `feat`: A new feature (e.g., `feat(post): add reading time calculation`)
- `fix`: A bug fix (e.g., `fix(auth): prevent timing attack on bad credentials`)
- `docs`: Documentation changes only (e.g., `docs(api): add bookmarks endpoint payload`)
- `style`: Formatting, missing semicolons, CSS whitespace changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build tasks, package updates, Flyway scripts

---

## 6. Code Quality Standards

### 6.1 Backend (Java / Spring Boot)
- **Formatting:** Follow standard Google Java Style Guide or standard Spring conventions (4 spaces indentation, no tabs).
- **Immutability:** Favor Java 17 `record` types for all DTOs and value objects.
- **Null Safety:** Avoid returning `null` from service methods; use `Optional<T>` or empty collections (`Collections.emptyList()`).
- **Exception Handling:** Never catch `Exception` silently. Use typed domain exceptions routed through `GlobalExceptionHandler`.
- **Query Hygiene:** Ensure all JPA queries bound with `@Param` to eliminate SQL injection risks. Inspect query execution plans to verify indexes are leveraged.

### 6.2 Frontend (HTML5 / CSS3 / Vanilla JS)
- **Zero Frameworks:** Do not introduce React, Vue, jQuery, or third-party bundle managers into the core client.
- **Safe DOM Binding:** Always bind untrusted text using `element.textContent = data.text`. Never assign user-supplied content to `innerHTML` without prior sanitization.
- **CSS Architecture:** Use CSS Custom Properties declared in `variables.css`. Do not hardcode raw hex colors in page stylesheets.

---

## 7. Testing Requirements Prior to Submission

Before submitting any Pull Request, contributors must verify:
1. **Compilation & Packaging:**
   ```bash
   cd backend
   ./mvnw clean compile
   ```
2. **Automated Test Suite:**
   ```bash
   ./mvnw test
   ```
   *100% of unit and integration tests must pass with zero failures.*
3. **Database Migration Verification:**
   Ensure any new migration (`V3__...sql`) executes cleanly against a fresh PostgreSQL database.
4. **No Sensitive Data:**
   Verify that no API keys, JWT secrets, or local database credentials are committed to version control.

---

## 8. Pull Request (PR) Process

1. Rebase your feature branch against the latest `origin/develop`:
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
2. Open a Pull Request targeting `develop`.
3. Provide a clear PR summary using the following checklist:
   - [ ] Problem description and proposed solution.
   - [ ] Summary of backend and/or frontend changes.
   - [ ] Confirmation that `./mvnw test` passes.
   - [ ] Linked Issue (e.g., `Resolves #102`).
4. Solicit at least one code review from a project maintainer.
5. Once approved, squash-merge into `develop`.

---

## 9. Documentation Requirements
If your pull request alters any of the following, the corresponding documentation must be updated in the same PR:
- New or changed REST endpoints $\rightarrow$ `docs/API_DOCUMENTATION.md`
- Database schema or constraint changes $\rightarrow$ `docs/DATABASE_SCHEMA.md`
- New UI components or color changes $\rightarrow$ `docs/UI_UX_GUIDELINES.md`
- Architecture adjustments $\rightarrow$ `docs/ARCHITECTURE.md`

---

## 10. Acceptance Criteria
- [ ] PR adheres to Conventional Commits.
- [ ] All automated tests pass in CI.
- [ ] Code meets style and architectural guidelines.
- [ ] Documentation updated to reflect changes.
