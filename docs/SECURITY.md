# WriteSpace Security & Access Control Architecture 🛡️

This document details the security posture, authentication lifecycle, Row Level Security (RLS) rules, data sanitization, and attack mitigation strategies for WriteSpace.

---

## 1. Threat Model & Security Posture

WriteSpace adopts a **Zero-Trust Client** security model. Because the frontend Single Page Application (SPA) runs entirely in untrusted client browsers, the security perimeter is enforced at the database and gateway layer through **PostgreSQL Row Level Security (RLS)** and **InsForge Auth JWT validation**.

```
[Untrusted Client: React SPA]
              │
              │  HTTPS + Authorization: Bearer <JWT>
              ▼
[InsForge Gateway / PostgREST]
              │
              ▼
[PostgreSQL Database Engine]
   ├── 1. Validates JWT signature & extracts auth.uid()
   ├── 2. Evaluates table-specific RLS policies
   └── 3. Rejects unauthorized reads/writes at SQL engine level
```

---

## 2. Row Level Security (RLS) Policy Matrix

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|---|---|---|---|---|
| **`profiles`** | `true` (Public) | `auth.uid() = id` | `auth.uid() = id` | Denied |
| **`categories`** | `true` (Public) | Admin Only | Admin Only | Admin Only |
| **`posts`** | `status = 'published' OR auth.uid() = author_id` | `auth.uid() = author_id` | `auth.uid() = author_id` | `auth.uid() = author_id` |
| **`comments`** | `true` (Public) | `auth.uid() = author_id` | `auth.uid() = author_id` | `auth.uid() = author_id` |
| **`likes`** | `true` (Public) | `auth.uid() = user_id` | Denied | `auth.uid() = user_id` |
| **`follows`** | `true` (Public) | `auth.uid() = follower_id` AND `follower_id != following_id` | Denied | `auth.uid() = follower_id` |
| **`bookmarks`**| `auth.uid() = user_id` (**Strictly Private**) | `auth.uid() = user_id` | Denied | `auth.uid() = user_id` |
| **`notifications`**| `auth.uid() = recipient_id` (**Private**) | `auth.uid() = actor_id` | `auth.uid() = recipient_id` (mark read) | `auth.uid() = recipient_id` |

---

## 3. Critical Security Verification Scenarios

### 3.1 Private Draft Isolation
- **Rule**: Draft posts (`status = 'draft'`) must NEVER be queryable by any user other than the author.
- **Enforcement**:
  ```sql
  CREATE POLICY "Posts view policy" ON public.posts FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);
  ```
- **Test Case**: User B attempts `SELECT * FROM posts WHERE id = '<User A Draft ID>'`. Result: Zero rows returned (`404 Not Found`).

### 3.2 Private Bookmark Isolation
- **Rule**: Reading lists and bookmarks are personal. No user can see what stories another user has bookmarked.
- **Enforcement**:
  ```sql
  CREATE POLICY "Bookmarks view policy" ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);
  ```
- **Test Case**: User B queries `bookmarks` with `user_id = '<User A ID>'`. Result: Zero rows returned.

### 3.3 Author-Only Mutations
- **Rule**: Users cannot modify or delete articles, comments, or profiles created by other accounts.
- **Enforcement**:
  ```sql
  CREATE POLICY "Posts update policy" ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);
  ```
- **Test Case**: User B submits `PATCH /posts?id=eq.<User A Post>` with altered title. Result: Permission denied / 0 rows affected.

### 3.4 Duplicate & Self-Action Invariants
- **Duplicate Likes**: Blocked by PostgreSQL unique constraint: `UNIQUE (post_id, user_id)`.
- **Self-Following**: Blocked by database check constraint: `CHECK (follower_id <> following_id)`.
- **Duplicate Follows**: Blocked by unique constraint: `UNIQUE (follower_id, following_id)`.

---

## 4. Frontend & Application Security

### 4.1 Cross-Site Scripting (XSS) Prevention
- User input in stories is rendered through markdown parsers. All generated HTML is sanitized using **DOMPurify** before rendering.
- No direct injection of raw HTML strings without sanitization.
- React's JSX escaping protects against script injection in titles, names, comments, and biographies.

### 4.2 Credential Protection & Secret Management
- **Public Anon Key**: Only `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` are exposed in client builds. The anon key has only permissions permitted by RLS policies.
- **Service Role Key**: The database `service_role` / admin key is NEVER committed, never referenced in `.env`, and never included in client bundles.
- `.gitignore` strictly excludes `.env`, `.env.local`, and build artifacts.

### 4.3 Input Validation & Content Hygiene
- **Usernames**: Enforced regex format `^[a-zA-Z0-9_]{3,30}$` preventing directory traversal or script tags in handles.
- **Story Titles & Content**: Validated for minimum and maximum byte lengths before submission.
- **File Uploads**: Validated client-side for MIME type (`image/jpeg`, `image/png`, `image/webp`) and file size limit (5MB maximum) before sending to InsForge Storage.
