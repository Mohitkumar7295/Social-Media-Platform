# WriteSpace Features Specification 📝

This document provides the definitive breakdown of all features, capabilities, user controls, and acceptance criteria in WriteSpace.

---

## 1. Feature Matrix & Priority

| Module | Feature | Priority | Implementation Phase |
|---|---|---|---|
| **Auth** | User Registration (Email/Password) | **MVP (P0)** | Phase 3 |
| **Auth** | User Login & JWT Session Management | **MVP (P0)** | Phase 3 |
| **Auth** | Sign Out & Session Teardown | **MVP (P0)** | Phase 3 |
| **Auth** | Password Recovery Flow | P1 | Phase 3 |
| **Profile** | User Profile Setup (`@username`, name, bio) | **MVP (P0)** | Phase 4 |
| **Profile** | Avatar Image Upload (InsForge Storage) | **MVP (P0)** | Phase 4 |
| **Profile** | Public Author Profile View & Tabbed Stories | **MVP (P0)** | Phase 4 |
| **Articles** | Rich/Markdown Article Composer | **MVP (P0)** | Phase 5 |
| **Articles** | Save Draft State & Edit Draft | **MVP (P0)** | Phase 5 |
| **Articles** | Publish Story & Auto-Calculate Reading Time | **MVP (P0)** | Phase 5 |
| **Articles** | Upload Article Cover Image | **MVP (P0)** | Phase 5 |
| **Articles** | Category Classification & Tagging | **MVP (P0)** | Phase 5 |
| **Reading** | Editorial Long-Form Reader Interface | **MVP (P0)** | Phase 6 |
| **Reading** | Author Bio & Follow Shortcut in Article | **MVP (P0)** | Phase 6 |
| **Social** | Atomic Like / Unlike Article | **MVP (P0)** | Phase 7 |
| **Social** | Post Comments & Nested Discussion | **MVP (P0)** | Phase 7 |
| **Social** | Author Follow / Unfollow System | **MVP (P0)** | Phase 8 |
| **Feeds** | Chronological Home Feed | **MVP (P0)** | Phase 9 |
| **Feeds** | Following-Only Subscriber Feed | **MVP (P0)** | Phase 9 |
| **Discovery**| Explore Feed & Topic Pill Filtering | **MVP (P0)** | Phase 9 |
| **Discovery**| Keyword Search (Articles & Writers) | **MVP (P0)** | Phase 10 |
| **Library** | Private Bookmarking & Reading List | P1 | Phase 11 |
| **Alerts** | Notifications Inbox & Realtime Events | P1 | Phase 12 |
| **Writer** | Writer Studio Dashboard & Metrics | P1 | Phase 13 |
| **Settings**| Account Preferences & Profile Management | P1 | Phase 4 / 13 |

---

## 2. Detailed Functional Specifications

### 2.1 Authentication Module
- **Registration**: Allows new users to sign up using email, password (min 8 characters), unique username, and display name.
- **Session Handling**: Utilizes JWT tokens persisted securely in browser storage. Validates session token on application boot.
- **Route Guarding**: Provides `ProtectedRoute` component redirecting unauthenticated users to `/login` with previous location preserved.

### 2.2 User Profiles Module
- **Public Profile (`/u/:username`)**: Shows author avatar, bio, follower count, following count, articles published, and external link.
- **Profile Edit Modal**: In-place editor allowing authors to update biography, display name, and avatar image with live preview.
- **Follower Counter**: Automatically synchronizes counts via database foreign key aggregations.

### 2.3 Article Management & Authoring
- **Editor Studio (`/new-story`, `/edit/:id`)**: Clean editorial canvas with title input, subtitle input, markdown/text body, cover image uploader, and topic selector.
- **Drafting & Publishing**: Author can choose "Save Draft" or "Publish Now". Drafts are strictly private to the author (enforced by RLS).
- **Reading Time**: Calculated dynamically based on average human reading speed of 200 words per minute.
- **Slug Generation**: Generates clean, URL-friendly slugs with collision avoidance.

### 2.4 Editorial Reading Interface
- **Reader View (`/story/:slug`)**: Centered typography with Substack/Medium aesthetic, elegant serif/sans font pairings, large headings, pull quotes, code blocks, and responsive mobile readability.
- **Engagement Bar**: Sticky or fixed interaction bar containing like count/button, comment count/button, bookmark toggle, and share action.

### 2.5 Social Interactions
- **Like System**: One click to like/unlike. Uses optimistic UI updates with database unique constraint `(post_id, user_id)`.
- **Comments Thread**: Chronological comment stream beneath articles. Authenticated users can write comments and delete their own.
- **Follow System**: Allows readers to subscribe to authors. Feeds the "Following" tab.

### 2.6 Feeds & Content Discovery
- **Home Feed**: Curated selection of recent published stories from all categories.
- **Following Feed**: Chronological stream of articles authored by creators the user follows.
- **Explore Feed**: Highlights trending posts (ranked by likes and recent interaction) and topic category pills.
- **Live Search**: Instant client query input filtering stories by title/content and searching author profiles by username.

### 2.7 Bookmarks & Reading Library
- **Private Bookmarks (`/bookmarks`)**: Displays all saved stories. Strictly protected under RLS—users can never view another user's bookmarks.
- **Quick Unsave**: One-click removal from reading list.

### 2.8 Writer Dashboard & Analytics
- **Author Dashboard (`/dashboard`)**: Lists all stories created by the user with status tabs (Published, Drafts).
- **Story Metrics**: Total views, like count, comment count, and publish dates.
- **Quick Actions**: Edit, View live, Unpublish, or Delete.
