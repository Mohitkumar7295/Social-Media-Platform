# WriteSpace User Workflows & Journey Maps 🗺️

This document describes the primary user flows, state transitions, and step-by-step journeys for visitors, readers, and authors in WriteSpace.

---

## 1. Visitor / Reader Onboarding Journey

```mermaid
flowchart TD
    A[Visitor arrives at WriteSpace] --> B{Is Authenticated?}
    B -- No --> C[Landing Page: Featured Stories & Value Proposition]
    C --> D[Clicks 'Get Started' or 'Sign In']
    D --> E[Registration Page: Email, Password, Username, Name]
    E --> F[InsForge Auth creates user & Profile trigger activates]
    F --> G[Redirect to Onboarding / Home Feed]
    B -- Yes --> H[Home Feed: Personalized Articles]
```

### Steps:
1. Visitor browses public articles on Landing or Explore feed.
2. Visitor clicks "Sign in" or "Get Started".
3. Form validates:
   - Email format
   - Password length (>= 8 characters)
   - Unique `@username` availability
4. Auth API executes `signUp()`.
5. User is redirected to `/` with immediate session authentication.

---

## 2. Story Authoring & Publishing Workflow

```mermaid
sequenceDiagram
    actor Writer
    participant Editor as CreateArticle View
    participant Storage as InsForge Storage
    participant DB as InsForge PostgreSQL (RLS)

    Writer->>Editor: Enters Title, Subtitle, and Content
    Writer->>Editor: Uploads Cover Image
    Editor->>Storage: uploadImage('covers', file)
    Storage-->>Editor: Returns publicUrl
    
    alt Save as Draft
        Writer->>Editor: Clicks 'Save Draft'
        Editor->>DB: INSERT INTO posts (status='draft', ...)
        DB-->>Editor: Confirms draft saved
    else Publish Story
        Writer->>Editor: Clicks 'Publish Story'
        Editor->>DB: INSERT INTO posts (status='published', published_at=NOW(), ...)
        DB-->>Editor: Confirms story published
        Editor->>Writer: Redirects to /story/:slug
    end
```

### Steps:
1. Author clicks "Write" icon in navigation bar.
2. If unauthenticated, redirected to `/login` with return intent.
3. Author enters:
   - Compelling title
   - Subtitle / summary
   - Markdown or formatted content
   - Selected topic category
   - Optional cover photo (uploaded asynchronously to InsForge Storage)
4. Reading time is dynamically calculated: `ceil(wordCount / 200)`.
5. Author clicks "Publish".
6. Post becomes immediately discoverable in public feeds.

---

## 3. Reader Engagement & Social Interaction Workflow

```mermaid
sequenceDiagram
    actor Reader
    participant Article as ArticleDetails View
    participant DB as InsForge PostgreSQL

    Reader->>Article: Opens /story/:slug
    Article->>DB: SELECT * FROM posts WHERE slug = :slug
    DB-->>Article: Returns Post & Author Profile Data

    Reader->>Article: Clicks 'Like' Button
    Article->>DB: INSERT INTO likes (post_id, user_id)
    Note over Article: Optimistic UI updates like counter (+1)
    DB-->>Article: Confirms like recorded

    Reader->>Article: Types comment and clicks 'Submit'
    Article->>DB: INSERT INTO comments (post_id, author_id, content)
    DB-->>Article: Returns new comment row
    Article->>Reader: Appends comment into discussion stream

    Reader->>Article: Clicks 'Follow' on Author Card
    Article->>DB: INSERT INTO follows (follower_id, following_id)
    Article->>Reader: Updates button to 'Following'
```

---

## 4. Bookmarking & Private Library Workflow

```mermaid
flowchart LR
    A[Reader reads story] --> B[Clicks Bookmark Icon]
    B --> C{Already Bookmarked?}
    C -- No --> D[INSERT INTO bookmarks]
    D --> E[Bookmark Icon turns Active / Filled]
    C -- Yes --> F[DELETE FROM bookmarks]
    F --> G[Bookmark Icon turns Inactive / Outline]
    E --> H[Reader visits /bookmarks]
    H --> I[Post appears in personal saved library]
```

---

## 5. Writer Dashboard Management Workflow

1. Author navigates to `/dashboard`.
2. Dashboard queries `posts` where `author_id = auth.uid()`.
3. Author toggles between **Published Stories** and **Drafts**.
4. Actions available per story:
   - **Edit**: Opens `/edit/:id` populated with existing data.
   - **View**: Opens `/story/:slug` in reader mode.
   - **Delete**: Prompts confirmation modal; executes `DELETE FROM posts WHERE id = :id`.
   - **Unpublish**: Updates status back to `draft`.
