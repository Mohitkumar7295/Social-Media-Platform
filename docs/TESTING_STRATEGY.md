# WriteSpace: Quality Assurance & Comprehensive Testing Strategy

> **Testing Frameworks:** JUnit 5 / Mockito / Spring Boot Test / MockMvc  
> **Database Testing:** Testcontainers / H2 In-Memory (Test Profile) / PostgreSQL  
> **Status:** Quality Assurance Baseline Manual

---

## 1. Purpose
This document provides the definitive testing strategy and quality assurance manual for the **WriteSpace** platform. It outlines the testing pyramid, tools, automated test suites, critical test scenarios, and acceptance criteria necessary to guarantee functional correctness, data integrity, security, and performance.

---

## 2. Scope
This strategy encompasses:
- Unit testing for domain services, mappers, and utility classes.
- Repository layer testing and PostgreSQL constraint validation.
- Spring MVC integration testing (endpoint security, validation, error formats).
- Authentication and authorization verification (JWT, BCrypt, IDOR defense).
- Frontend contract testing and cross-browser responsive validation.
- End-to-end user journey verification.

---

## 3. The Testing Pyramid

```
           / \
          /   \         End-to-End Tests (10%)
         / E2E \        Critical User Journeys (Postman / Browser Smoke)
        /-------\
       /         \      Integration & API Tests (30%)
      /  API/MVC  \     @SpringBootTest, MockMvc, Security Barriers
     /-------------\
    /               \   Repository & Constraint Tests (20%)
   /   Repository    \  @DataJpaTest, SQL Constraints, Transactions
  /-------------------\
 /                     \ Unit Tests (40%)
/      Unit Tests       \ JUnit 5, Mockito, Isolated Business Logic
-------------------------
```

---

## 4. Multi-Tier Testing Specifications

### 4.1 Unit Testing (JUnit 5 + Mockito)
- **Target:** Service classes (`PostServiceImpl`, `AuthServiceImpl`, `FollowServiceImpl`) and utility classes (`ReadingTimeCalculator`, `SlugGenerator`).
- **Strategy:** Isolate business logic by mocking external dependencies (`UserRepository`, `PostRepository`, `BCryptPasswordEncoder`) using `@Mock` and `@InjectMocks`.
- **Sample Test (`PostServiceTest.java`):**
  ```java
  @ExtendWith(MockitoExtension.class)
  class PostServiceTest {

      @Mock
      private PostRepository postRepository;

      @Mock
      private UserRepository userRepository;

      @Mock
      private PostMapper postMapper;

      @InjectMocks
      private PostServiceImpl postService;

      @Test
      void createPost_ShouldGenerateUniqueSlugAndPersist() {
          UUID userId = UUID.randomUUID();
          User user = new User();
          user.setId(userId);
          user.setUsername("writer1");

          PostCreateRequest request = new PostCreateRequest(
              "Building Scalable Platforms",
              "Summary excerpt",
              "Article body content...",
              null,
              PostStatus.PUBLISHED
          );

          when(userRepository.findById(userId)).thenReturn(Optional.of(user));
          when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

          PostResponse response = postService.createPost(request, userId);

          verify(postRepository).save(argThat(post -> 
              post.getSlug().startsWith("building-scalable-platforms") &&
              post.getStatus() == PostStatus.PUBLISHED &&
              post.getReadingTimeMinutes() >= 1
          ));
      }
  }
  ```

---

### 4.2 Repository & Database Constraint Testing (`@DataJpaTest`)
- **Target:** Spring Data JPA repositories and PostgreSQL relational constraints.
- **Key Scenarios Tested:**
  1. **Unique Like Constraint:** Attempting to insert two `Like` records with identical `(user_id, post_id)` must throw `DataIntegrityViolationException`.
  2. **Unique Bookmark Constraint:** Inserting duplicate `(user_id, post_id)` into `bookmarks` must throw `DataIntegrityViolationException`.
  3. **Self-Follow Check Constraint:** Inserting a `Follow` where `follower_id == following_id` must violate the `chk_follows_no_self_follow` constraint.
  4. **Cascade Deletions:** Deleting a `Post` must automatically delete linked records in `comments`, `likes`, and `bookmarks`.
  5. **Case-Insensitive Username Lookups:** Confirm `idx_users_username_lower` executes high-speed lookups.

---

### 4.3 REST API & Security Testing (`MockMvc`)
- **Target:** Controller perimeter, request validation, serialization, and Spring Security filters.
- **Key Scenarios Tested:**
  1. `POST /api/v1/posts` without `Authorization` header must yield HTTP `401 Unauthorized`.
  2. `POST /api/v1/auth/register` with invalid email format must yield HTTP `400 Bad Request` with field error details.
  3. `PUT /api/v1/posts/{id}` by User B targeting User A's article must yield HTTP `403 Forbidden` (IDOR defense).
  4. `POST /api/v1/users/{selfId}/follow` must yield HTTP `400 Bad Request` ("Cannot follow yourself").

---

### 4.4 Authentication & JWT Security Testing
- **Key Scenarios Tested:**
  1. Expired JWT tokens must be rejected with HTTP 401.
  2. Tokens with altered payloads or tampered signatures must fail HMAC-SHA256 verification.
  3. Plaintext password comparisons verify that BCrypt matches raw input only against the salted hash.
  4. Passwords with fewer than 8 characters are rejected during registration.

---

### 4.5 Frontend Integration & Contract Testing
- **Target:** `api.js`, `auth.js`, DOM manipulation in `ui.js`.
- **Key Scenarios Tested:**
  1. Successful login updates `localStorage` with token and user profile.
  2. Calling protected pages (`editor.html`, `feed.html`) while unauthenticated immediately triggers redirect to `/login.html`.
  3. API HTTP 401 response automatically triggers session purge and user notification.
  4. Rapid successive clicks on Like button do not produce client desynchronization.

---

## 5. Master Test Scenarios Matrix

| Test ID | Domain | Test Scenario Description | Expected Outcome | Execution Tool |
|---|---|---|---|---|
| **TC-AUTH-01** | Auth | Register user with unique valid credentials | HTTP 201 Created + signed JWT | MockMvc |
| **TC-AUTH-02** | Auth | Register user with duplicate email | HTTP 409 Conflict | MockMvc |
| **TC-AUTH-03** | Auth | Login with incorrect password | HTTP 401 Unauthorized | MockMvc |
| **TC-AUTH-04** | Auth | Access protected feed without token | HTTP 401 Unauthorized | MockMvc |
| **TC-POST-01** | Post | Create published post with valid body | HTTP 201 + Unique Slug | MockMvc |
| **TC-POST-02** | Post | Author edits own published post | HTTP 200 OK + Updated Fields | MockMvc |
| **TC-POST-03** | Post | Non-author attempts to delete post | HTTP 403 Forbidden | MockMvc |
| **TC-SOCL-01** | Social | User likes an unliked article | Like count increments + liked: true | MockMvc |
| **TC-SOCL-02** | Social | User likes an already-liked article | Like count decrements + liked: false | MockMvc |
| **TC-SOCL-03** | Social | User attempts to follow own account | HTTP 400 Bad Request | MockMvc |
| **TC-DB-01** | Database | Direct SQL duplicate insert into likes | DataIntegrityViolationException | @DataJpaTest |
| **TC-DB-02** | Database | Direct SQL self-follow insert | Check constraint violation | @DataJpaTest |
| **TC-DB-03** | Database | Delete author cascade check | Post and comments removed | @DataJpaTest |

---

## 6. End-to-End Smoke Test Suite (Postman / cURL)

A complete automated Postman test collection validates the happy path journey in under 10 seconds:
1. `POST /api/v1/auth/register` (User 1 - Writer)
2. `POST /api/v1/auth/register` (User 2 - Reader)
3. `POST /api/v1/posts` (User 1 publishes article)
4. `POST /api/v1/users/{user1_id}/follow` (User 2 follows User 1)
5. `GET /api/v1/feed` (User 2 sees User 1's article)
6. `POST /api/v1/posts/{post_id}/like` (User 2 likes article)
7. `POST /api/v1/posts/{post_id}/comments` (User 2 comments on article)
8. `POST /api/v1/posts/{post_id}/bookmark` (User 2 bookmarks article)
9. `GET /api/v1/bookmarks` (User 2 verifies saved list)

---

## 7. Performance & Load Testing
- Target: 100 concurrent virtual users browsing the explore feed (`GET /api/v1/posts`).
- Metric: $P_{95}$ response latency $< 200\text{ ms}$; zero connection pool timeouts.

---

## 8. Implementation Guidelines
- Write unit tests alongside feature implementation (Test-Driven Development preferred).
- Never mock database constraints in repository tests; verify actual SQL execution against PostgreSQL/H2.

---

## 9. Testing Requirements
- Build fails if any unit or integration test fails (`mvn clean test`).

---

## 10. Acceptance Criteria
- [ ] 100% of master test scenarios (TC-AUTH-01 through TC-DB-03) execute successfully.
- [ ] No regression bugs discovered during end-to-end smoke verification.
- [ ] Zero unhandled 500 Internal Server Errors under invalid input testing.
