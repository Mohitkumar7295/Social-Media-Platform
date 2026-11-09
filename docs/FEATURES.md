# WriteSpace: Features Specification & Product Matrix

> **Document Version:** 1.0.0  
> **Classification:** Product Feature Catalog  
> **Status:** Implementation Baseline

---

## 1. Purpose
This document provides a comprehensive technical catalog of all user-facing and system features of the **WriteSpace** platform. It details functional mechanics, business rules, architectural workflows, dependency graphs, and classification tiers (MVP, Phase 2, and Future Enhancements) to guide software engineering and QA validation.

---

## 2. Scope
This specification encompasses the 20 core platform capabilities spanning user identity, editorial publishing, content consumption, community engagement, and social discovery, as well as downstream Phase 2 and extended enhancements.

---

## 3. Technical Explanation & Classification Matrix

Features are categorized into three delivery phases:
- **Phase 1 (MVP):** Essential capabilities required to deliver an authentic, functional social publishing ecosystem.
- **Phase 2 (Post-MVP):** Experience-refining enhancements that deepen reader engagement, rich content formatting, and administrative moderation.
- **Future Enhancements:** Advanced platform capabilities including monetization, automated newsletter dispatch, and analytical dashboards.

### Feature Classification Matrix

| Feature ID | Feature Name | Delivery Phase | Core Layer Involved | Primary User Persona |
|---|---|---|---|---|
| **FT-01** | User Registration | **MVP** | AuthController, UserService | All New Users |
| **FT-02** | User Login | **MVP** | AuthController, Spring Security, JWT | Registered Users |
| **FT-03** | User Logout | **MVP** | Client Auth Module, Security Filter | Authenticated Users |
| **FT-04** | User Profile Display | **MVP** | UserController, UserRepository | All Users |
| **FT-05** | Profile Editing | **MVP** | UserController, UserService | Authenticated Users |
| **FT-06** | Article Creation | **MVP** | PostController, PostService | Writers |
| **FT-07** | Article Editing | **MVP** | PostController, PostService | Article Authors |
| **FT-08** | Article Deletion | **MVP** | PostController, PostService | Article Authors |
| **FT-09** | Article Publishing | **MVP** | PostController, PostService | Writers |
| **FT-10** | Draft Management | **MVP** | PostController, PostRepository | Writers |
| **FT-11** | Personalized Feed | **MVP** | FeedController, FeedService | Authenticated Readers |
| **FT-12** | Explore & Discovery Page | **MVP** | PostController, PostRepository | All Readers |
| **FT-13** | Like / Unlike Post | **MVP** | LikeController, LikeService | Authenticated Readers |
| **FT-14** | Threaded Comments | **MVP** | CommentController, CommentService | Authenticated Readers |
| **FT-15** | Follow / Unfollow Writer | **MVP** | FollowController, FollowService | Authenticated Users |
| **FT-16** | Followers List | **MVP** | FollowController, FollowRepository | All Users |
| **FT-17** | Following List | **MVP** | FollowController, FollowRepository | All Users |
| **FT-18** | Article Keyword Search | **MVP** | PostController, PostRepository | All Users |
| **FT-19** | Tag Categorization | **MVP** | PostController, TagService | All Users |
| **FT-20** | Personal Bookmarks | **MVP** | BookmarkController, BookmarkService | Authenticated Readers |
| **FT-21** | Media Asset Uploads | **Phase 2** | MediaController, InsForge Storage | Writers |
| **FT-22** | Reading Time Metrics | **Phase 2** | PostService (Calculation Utility) | All Readers |
| **FT-23** | WYSIWYG / Markdown Editor | **Phase 2** | Frontend Editor Module | Writers |
| **FT-24** | Admin Content Moderation | **Phase 2** | AdminController, UserService | Administrators |
| **FT-25** | Email Newsletter Dispatch | **Future** | MailService, Async Queue | Writers & Subscribers |
| **FT-26** | Paid Subscriptions / Stripe | **Future** | BillingService, Stripe Webhooks | Writers & Supporters |
| **FT-27** | Real-Time Notifications | **Future** | WebSocket / SSE Pipeline | All Users |

---

## 4. Detailed Core Feature Breakdown

### FT-01: User Registration
- **Description:** Allows anonymous visitors to create an account by supplying a unique username, unique email address, password, and display name.
- **Workflow:** 
  1. User fills out registration form.
  2. Frontend performs regex validation on email and password.
  3. Backend checks database for collisions.
  4. Password is encrypted using BCrypt ($2^{12}$ iterations).
  5. Account is saved with default role `ROLE_USER`.
  6. Returns a valid JWT and logs the user in immediately.
- **Acceptance Criteria:** Duplicate usernames or emails reject with HTTP 409 Conflict. Valid inputs create a user and return HTTP 201 with a valid JWT token.

### FT-02: User Login
- **Description:** Authenticates returning users with email and password, issuing a signed JSON Web Token (JWT).
- **Workflow:**
  1. User submits email and password.
  2. Spring Security `AuthenticationManager` verifies credentials against stored BCrypt hash.
  3. On success, `JwtTokenProvider` issues a 24-hour HMAC-SHA256 token.
- **Acceptance Criteria:** Returns HTTP 200 with JWT and user summary upon correct credentials; returns HTTP 401 with generic error message upon failure.

### FT-03: User Logout
- **Description:** Clears the client-side authentication session and revokes access to protected views.
- **Workflow:** Client deletes JWT and user objects from `localStorage` and triggers navigation redirect to `/index.html`.
- **Acceptance Criteria:** Subsequent calls to protected endpoints without the token return HTTP 401.

### FT-04: User Profile Display
- **Description:** Public landing page displaying an author's metadata, bio, avatar, follower/following counts, and a paginated feed of their published articles.
- **Workflow:**
  1. Browser accesses `/profile.html?u=username`.
  2. Frontend queries `GET /api/v1/users/{username}` and `GET /api/v1/users/{username}/posts`.
  3. Displays public metrics, with "Follow/Unfollow" or "Edit Profile" (if self) actions.
- **Acceptance Criteria:** Returns author metadata and published posts only. Never displays draft articles of other users.

### FT-05: Profile Editing
- **Description:** Enables authenticated users to update their public display name, biography, and avatar image URL.
- **Workflow:** Submits `PUT /api/v1/users/profile` with sanitized text fields; updates PostgreSQL record.
- **Acceptance Criteria:** Max bio length of 500 characters enforced; unauthorized edits return HTTP 403 or 401.

### FT-06: Article Creation
- **Description:** Allows writers to compose a new post specifying title, subtitle/excerpt, body text, cover image URL, and topical tags.
- **Workflow:**
  1. Writer enters text in editor canvas.
  2. Post is persisted with initial status `DRAFT` or `PUBLISHED`.
  3. A unique URL slug is generated from the title.
- **Acceptance Criteria:** Article is bound to authenticated user's ID; non-authenticated attempts return HTTP 401.

### FT-07: Article Editing
- **Description:** Allows authors to modify the content, title, tags, or cover image of their existing articles.
- **Workflow:**
  1. Author opens editor with existing post ID.
  2. Backend validates that `post.author_id == currentUser.id`.
  3. Updated fields are saved; slug remains permanent to prevent broken links.
- **Acceptance Criteria:** Non-authors attempting to update an article receive HTTP 403 Forbidden.

### FT-08: Article Deletion
- **Description:** Allows authors to permanently delete their articles.
- **Workflow:** Submits `DELETE /api/v1/posts/{id}`. Service deletes the record; database foreign keys cascade to remove linked likes, comments, and bookmarks.
- **Acceptance Criteria:** Returns HTTP 204 No Content. Record is removed from database and subsequent slug lookups return HTTP 404.

### FT-09: Article Publishing
- **Description:** Transitions a post from `DRAFT` to `PUBLISHED` status, generating its timestamp and making it visible across explore feeds and follower feeds.
- **Workflow:** Sets `status = 'PUBLISHED'` and `published_at = NOW()`. Calculates reading time based on total words.
- **Acceptance Criteria:** Only published posts appear in public search and explore feeds.

### FT-10: Draft Management
- **Description:** Writers can view and manage their personal library of unpublished drafts.
- **Workflow:** Querying `GET /api/v1/posts/drafts` returns the authenticated author's unpublished articles.
- **Acceptance Criteria:** Drafts are strictly confidential; any attempt by user A to view user B's drafts returns HTTP 403 or 404.

### FT-11: Personalized Following Feed
- **Description:** Reverse-chronological stream of published articles authored by writers whom the current user follows.
- **Workflow:**
  1. Authenticated user visits `/feed.html`.
  2. Backend performs an inner join between `posts` and `follows` filtered by `follower_id = currentUser.id`.
  3. Returns paginated list of article summaries.
- **Acceptance Criteria:** Feed displays only published articles from followed users; returns empty list if user follows no one or authors have not published.

### FT-12: Explore & Discovery Page
- **Description:** Global homepage presenting trending, recent, and curated published articles for readers and visitors.
- **Workflow:** Public query `GET /api/v1/posts?page=0&size=10&sort=publishedAt,desc` served with high cacheability.
- **Acceptance Criteria:** Accessible to both anonymous visitors and authenticated users without requiring credentials.

### FT-13: Like / Unlike Post
- **Description:** Allows authenticated readers to toggle a like on an article to express appreciation.
- **Workflow:**
  1. Reader clicks heart icon on `/article.html?slug=...`.
  2. Issues `POST /api/v1/posts/{id}/like`.
  3. If like exists, record is deleted; if not, new record is created.
  4. Returns updated like count and boolean `liked` status.
- **Acceptance Criteria:** Enforced by PostgreSQL composite unique key `(user_id, post_id)` to prevent duplicate likes under race conditions.

### FT-14: Threaded Comments
- **Description:** Readers can post text comments under published articles and read community discussions.
- **Workflow:**
  1. User submits comment text ($\le 1000$ characters).
  2. Backend validates, sanitizes HTML, and persists comment with foreign keys to both `post_id` and `user_id`.
  3. Comment author or post author can delete the comment.
- **Acceptance Criteria:** Empty or whitespace comments rejected with HTTP 400. Successful creation returns HTTP 201 with author details.

### FT-15: Follow / Unfollow Writer
- **Description:** Readers can establish a social graph connection with writers to populate their personal feed.
- **Workflow:**
  1. User issues `POST /api/v1/users/{authorId}/follow`.
  2. Backend checks check constraint `follower_id <> following_id`.
  3. Toggles follow relation in `follows` table.
- **Acceptance Criteria:** Attempting to follow oneself returns HTTP 400 Bad Request ("Cannot follow yourself").

### FT-16: Followers List
- **Description:** Retrieves a paginated list of users who follow a given profile.
- **Workflow:** `GET /api/v1/users/{username}/followers?page=0&size=20`.
- **Acceptance Criteria:** Returns user summary objects (username, display name, avatar, bio) with pagination metadata.

### FT-17: Following List
- **Description:** Retrieves a paginated list of writers followed by a given profile.
- **Workflow:** `GET /api/v1/users/{username}/following?page=0&size=20`.
- **Acceptance Criteria:** Returns paginated list of followed users.

### FT-18: Article Keyword Search
- **Description:** Enables readers to search published articles using keyword queries matching titles or excerpts.
- **Workflow:** `GET /api/v1/posts?q=architecture` executes a PostgreSQL `ILIKE` or full-text query matching title, excerpt, or author name.
- **Acceptance Criteria:** Accurately filters published articles matching query substring; ignores drafts.

### FT-19: Tag Categorization
- **Description:** Articles can be tagged with topical labels (e.g., `#technology`, `#essay`, `#design`) to facilitate category browsing.
- **Workflow:** `GET /api/v1/posts?tag=technology` returns published articles containing the specified tag.
- **Acceptance Criteria:** Tag comparisons are case-insensitive and trimmed.

### FT-20: Personal Bookmarks
- **Description:** Allows authenticated readers to save articles to a private "Reading List" for future reference.
- **Workflow:**
  1. Reader clicks bookmark icon on any article card or reader view.
  2. Backend toggles record in `bookmarks` table.
  3. `GET /api/v1/bookmarks` retrieves all saved articles for the authenticated user.
- **Acceptance Criteria:** Bookmarks are strictly private to the user; composite unique constraint prevents duplicates.

---

## 5. Phase 2 Features (Post-MVP)

- **FT-21 (Media Uploads):** Multipart upload to InsForge Storage for post cover images and avatars.
- **FT-22 (Reading Time Engine):** Dynamic word-count analyzer computing minutes to read based on content density.
- **FT-23 (Rich Block Editor):** Inline formatting canvas (bold, italic, code blocks, blockquotes, embedded images).
- **FT-24 (Admin Moderation):** Moderation dashboard allowing administrators to ban abusive accounts and delete flagged posts.

---

## 6. Future Enhancements

- **FT-25 (Email Newsletter Dispatch):** Asynchronous publication triggers delivering full HTML articles to subscriber inboxes.
- **FT-26 (Paid Memberships / Stripe):** Subscriber paywalls and creator tip jars.
- **FT-27 (Real-Time Notifications):** Push alerts or web-socket toasts when users receive likes, comments, or new followers.

---

## 7. Architecture & Workflow Mapping

```
+-------------------------------------------------------------------------------+
| User Actions       | Endpoint                         | Layer Chain           |
|--------------------+----------------------------------+-----------------------|
| Register / Login   | POST /api/v1/auth/*              | AuthCtrl -> AuthSvc   |
| Compose & Publish  | POST /api/v1/posts               | PostCtrl -> PostSvc   |
| Like Post          | POST /api/v1/posts/{id}/like     | LikeCtrl -> LikeSvc   |
| Comment on Post    | POST /api/v1/posts/{id}/comments | CommCtrl -> CommSvc   |
| Follow Author      | POST /api/v1/users/{id}/follow   | FollowCtrl -> FolSvc  |
| Read Following Feed| GET /api/v1/feed                 | FeedCtrl -> FeedSvc   |
+-------------------------------------------------------------------------------+
```

---

## 8. Implementation Guidelines
- Each feature must expose an atomic REST endpoint returning standard JSON schemas.
- Services must validate permissions (e.g., author ownership) before applying mutations.
- Transient calculations (e.g., `isLikedByCurrentUser`, `isFollowedByCurrentUser`) must be populated in DTOs based on the requesting user's identity.

---

## 9. Testing Requirements
- Unit tests for every feature service implementation.
- MockMvc controller tests for authorization status codes (200, 201, 400, 401, 403, 404, 409).
- Database constraint verification for like uniqueness, follow self-check, and bookmark uniqueness.

---

## 10. Acceptance Criteria
- [ ] All 20 MVP features are fully operational according to their defined workflows.
- [ ] Database invariants are rigorously maintained under high concurrency.
- [ ] Unauthorized users are barred from restricted actions.
