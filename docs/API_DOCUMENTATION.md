# WriteSpace: RESTful API Specification (v1)

> **API Base URL:** `http://localhost:8080/api/v1` (Local) / `https://api.writespace.app/api/v1` (Production)  
> **Content-Type:** `application/json`  
> **Security Protocol:** HTTP Bearer Authentication (JWT RFC 7519)  
> **Status:** Implementation Baseline Specification

---

## 1. Purpose
This document provides the definitive OpenAPI/REST contract for all endpoints exposed by the **WriteSpace** backend. It establishes exact URI paths, HTTP verbs, request/response JSON schemas, query parameters, validation rules, and error response models to guide frontend-backend integration.

---

## 2. Scope
This specification documents 10 API domains:
1. Authentication APIs
2. User & Identity APIs
3. Profile Management APIs
4. Article (Post) APIs
5. Comment APIs
6. Like APIs
7. Follow / Social Graph APIs
8. Feed APIs
9. Search & Filter APIs
10. Bookmark APIs

---

## 3. Technical Explanation & Global Conventions

### 3.1 Authentication Header
Endpoints requiring authentication mandate the standard HTTP `Authorization` header:
```http
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...>
```
If an unauthenticated request targets a protected endpoint, the server responds with HTTP `401 Unauthorized`.

### 3.2 Standard Error Response Model (RFC 7807)
All 4xx and 5xx responses conform to the following schema:
```json
{
  "timestamp": "2026-11-09T10:15:30.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/v1/posts",
  "errors": [
    {
      "field": "title",
      "rejectedValue": "",
      "message": "Title must not be blank"
    }
  ]
}
```

### 3.3 Standard Pagination Envelope
Collection endpoints return a standard pagination schema:
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 48,
  "totalPages": 5,
  "last": false
}
```

---

## 4. Authentication APIs (`/api/v1/auth`)

### 4.1 Register User
- **Method / URL:** `POST /api/v1/auth/register`
- **Description:** Registers a new author/reader account.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "elena_writes",
    "email": "elena@example.com",
    "password": "Password123!",
    "displayName": "Elena Rostova"
  }
  ```
- **Validation Rules:**
  - `username`: Required, 3–30 characters, alphanumeric + underscore.
  - `email`: Required, valid email format.
  - `password`: Required, $\ge 8$ characters, at least 1 digit and 1 special character.
  - `displayName`: Required, 2–80 characters.
- **Success Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": "7f8c12a4-56b1-4c92-9381-12a456b12345",
      "username": "elena_writes",
      "email": "elena@example.com",
      "displayName": "Elena Rostova",
      "avatarUrl": null,
      "role": "ROLE_USER"
    }
  }
  ```
- **Error Codes:** `400 Bad Request` (validation failed), `409 Conflict` (username or email taken).

---

### 4.2 Login User
- **Method / URL:** `POST /api/v1/auth/login`
- **Description:** Authenticates credentials and issues a signed JWT.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "elena@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": "7f8c12a4-56b1-4c92-9381-12a456b12345",
      "username": "elena_writes",
      "email": "elena@example.com",
      "displayName": "Elena Rostova",
      "avatarUrl": "https://storage.writespace.app/avatars/elena.webp",
      "role": "ROLE_USER"
    }
  }
  ```
- **Error Codes:** `400 Bad Request`, `401 Unauthorized` (invalid email or password).

---

### 4.3 Get Current User Profile
- **Method / URL:** `GET /api/v1/auth/me`
- **Description:** Retrieves the authenticated user's current session state.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "id": "7f8c12a4-56b1-4c92-9381-12a456b12345",
    "username": "elena_writes",
    "email": "elena@example.com",
    "displayName": "Elena Rostova",
    "bio": "Essayist exploring distributed systems and human behavior.",
    "avatarUrl": "https://storage.writespace.app/avatars/elena.webp",
    "role": "ROLE_USER"
  }
  ```
- **Error Codes:** `401 Unauthorized`.

---

## 5. User & Profile APIs (`/api/v1/users`)

### 5.1 Get Public Author Profile
- **Method / URL:** `GET /api/v1/users/{username}`
- **Description:** Fetches public profile metadata, social metrics, and follow state.
- **Auth Required:** Optional (if authenticated, `isFollowing` returns viewer context).
- **Success Response (200 OK):**
  ```json
  {
    "id": "7f8c12a4-56b1-4c92-9381-12a456b12345",
    "username": "elena_writes",
    "displayName": "Elena Rostova",
    "bio": "Essayist exploring distributed systems and human behavior.",
    "avatarUrl": "https://storage.writespace.app/avatars/elena.webp",
    "followersCount": 428,
    "followingCount": 112,
    "publishedPostsCount": 19,
    "isFollowing": false,
    "joinedAt": "2026-01-15T09:30:00Z"
  }
  ```
- **Error Codes:** `404 Not Found`.

---

### 5.2 Update Profile
- **Method / URL:** `PUT /api/v1/users/profile`
- **Description:** Updates the authenticated user's display name, bio, and avatar.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "displayName": "Elena Rostova, Ph.D.",
    "bio": "Writer & computer scientist. Author of 'Systems in Harmony'.",
    "avatarUrl": "https://storage.writespace.app/avatars/elena_updated.webp"
  }
  ```
- **Success Response (200 OK):** Returns updated User Profile JSON.
- **Error Codes:** `400 Bad Request` (bio $> 500$ chars), `401 Unauthorized`.

---

## 6. Article (Post) APIs (`/api/v1/posts`)

### 6.1 Create Article (Draft or Published)
- **Method / URL:** `POST /api/v1/posts`
- **Description:** Creates a new post or draft.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "Architecting Scalable Social Platforms with Spring Boot",
    "excerpt": "A deep dive into decoupled layered architectures, relational guarantees, and zero-build web clients.",
    "content": "Full Markdown or article body text goes here...",
    "coverImageUrl": "https://storage.writespace.app/covers/spring-arch.webp",
    "status": "PUBLISHED"
  }
  ```
- **Validation Rules:**
  - `title`: Required, 3–255 characters.
  - `content`: Required, non-empty.
  - `status`: Must be `'DRAFT'` or `'PUBLISHED'`.
- **Success Response (201 Created):**
  ```json
  {
    "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "title": "Architecting Scalable Social Platforms with Spring Boot",
    "slug": "architecting-scalable-social-platforms-with-spring-boot",
    "excerpt": "A deep dive into decoupled layered architectures...",
    "content": "Full Markdown or article body text goes here...",
    "coverImageUrl": "https://storage.writespace.app/covers/spring-arch.webp",
    "status": "PUBLISHED",
    "readingTimeMinutes": 6,
    "likesCount": 0,
    "commentsCount": 0,
    "publishedAt": "2026-11-09T10:30:00Z",
    "createdAt": "2026-11-09T10:30:00Z",
    "author": {
      "id": "7f8c12a4-56b1-4c92-9381-12a456b12345",
      "username": "elena_writes",
      "displayName": "Elena Rostova",
      "avatarUrl": "https://storage.writespace.app/avatars/elena.webp"
    }
  }
  ```

---

### 6.2 Get Single Article by Slug
- **Method / URL:** `GET /api/v1/posts/{slug}`
- **Description:** Retrieves article content, metrics, and author details.
- **Auth Required:** Optional (if authenticated, includes `hasLiked` and `hasBookmarked` flags).
- **Success Response (200 OK):** Returns full Article JSON.
- **Error Codes:** `404 Not Found`.

---

### 6.3 List Public Articles (Explore Feed)
- **Method / URL:** `GET /api/v1/posts`
- **Query Parameters:**
  - `page`: default `0`
  - `size`: default `10`
  - `sort`: default `publishedAt,desc`
  - `tag`: filter by topic tag
  - `q`: keyword search
- **Success Response (200 OK):**
  ```json
  {
    "content": [
      {
        "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
        "title": "Architecting Scalable Social Platforms with Spring Boot",
        "slug": "architecting-scalable-social-platforms-with-spring-boot",
        "excerpt": "A deep dive into decoupled layered architectures...",
        "coverImageUrl": "https://storage.writespace.app/covers/spring-arch.webp",
        "readingTimeMinutes": 6,
        "likesCount": 42,
        "commentsCount": 8,
        "publishedAt": "2026-11-09T10:30:00Z",
        "author": {
          "username": "elena_writes",
          "displayName": "Elena Rostova",
          "avatarUrl": "https://storage.writespace.app/avatars/elena.webp"
        }
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
  ```

---

### 6.4 Update Article
- **Method / URL:** `PUT /api/v1/posts/{id}`
- **Description:** Updates an article owned by the authenticated author.
- **Auth Required:** Yes (Owner only)
- **Request Body:** Partial or complete article fields.
- **Success Response (200 OK):** Returns updated Article JSON.
- **Error Codes:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (not owner), `404 Not Found`.

---

### 6.5 Delete Article
- **Method / URL:** `DELETE /api/v1/posts/{id}`
- **Description:** Permanently removes an article and cascades to likes, comments, and bookmarks.
- **Auth Required:** Yes (Owner only)
- **Success Response (204 No Content):** Empty body.
- **Error Codes:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## 7. Comment APIs (`/api/v1/posts/{postId}/comments`)

### 7.1 List Comments for Post
- **Method / URL:** `GET /api/v1/posts/{postId}/comments`
- **Description:** Retrieves all comments for a post in chronological order.
- **Auth Required:** No
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "content": "Incisive analysis of why layered architecture wins for content platforms.",
      "createdAt": "2026-11-09T11:00:00Z",
      "author": {
        "id": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
        "username": "marcus_dev",
        "displayName": "Marcus Thorne",
        "avatarUrl": "https://storage.writespace.app/avatars/marcus.webp"
      }
    }
  ]
  ```

---

### 7.2 Post Comment
- **Method / URL:** `POST /api/v1/posts/{postId}/comments`
- **Description:** Submits a comment on an article.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "content": "Fascinating write-up! How do you handle connection pool sizing with HikariCP?"
  }
  ```
- **Success Response (201 Created):** Returns created Comment JSON.
- **Error Codes:** `400 Bad Request` (blank or $> 1000$ chars), `401 Unauthorized`, `404 Not Found`.

---

### 7.3 Delete Comment
- **Method / URL:** `DELETE /api/v1/comments/{commentId}`
- **Description:** Deletes a comment. Only the comment author or article author can delete it.
- **Auth Required:** Yes
- **Success Response (204 No Content)**
- **Error Codes:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## 8. Social Interaction APIs: Likes, Follows, Bookmarks

### 8.1 Toggle Article Like
- **Method / URL:** `POST /api/v1/posts/{postId}/like`
- **Description:** Toggles the like status of a post for the authenticated user.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "liked": true,
    "likesCount": 43
  }
  ```
- **Error Codes:** `401 Unauthorized`, `404 Not Found`.

---

### 8.2 Toggle Follow Author
- **Method / URL:** `POST /api/v1/users/{authorId}/follow`
- **Description:** Toggles the follow status for a target writer.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "following": true,
    "followersCount": 429
  }
  ```
- **Error Codes:** `400 Bad Request` (cannot follow self), `401 Unauthorized`, `404 Not Found`.

---

### 8.3 Toggle Article Bookmark
- **Method / URL:** `POST /api/v1/posts/{postId}/bookmark`
- **Description:** Saves or removes an article from the user's private library.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "bookmarked": true
  }
  ```

---

### 8.4 List User Bookmarks
- **Method / URL:** `GET /api/v1/bookmarks`
- **Description:** Retrieves paginated list of articles bookmarked by the caller.
- **Auth Required:** Yes
- **Success Response (200 OK):** Standard paginated post summary envelope.

---

## 9. Personalized Feed API (`/api/v1/feed`)

### 9.1 Get Personalized Following Feed
- **Method / URL:** `GET /api/v1/feed`
- **Description:** Chronological feed of published articles from followed authors.
- **Auth Required:** Yes
- **Query Parameters:** `page` (default 0), `size` (default 10).
- **Success Response (200 OK):** Standard paginated post summary envelope.

---

## 10. Testing & Verification Guidelines
- All endpoint contracts must be verified using Postman and automated MockMvc tests.
- Payloads must strictly adhere to the defined schemas without undeclared fields.
- HTTP status codes must faithfully reflect operational outcomes (200, 201, 204, 400, 401, 403, 404, 409).
