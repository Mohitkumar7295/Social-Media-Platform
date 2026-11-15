# WriteSpace Architecture Documentation 🏛️

## 1. High-Level Architectural Vision

WriteSpace is designed as a high-performance, modern Single Page Application (SPA) backed directly by the **InsForge Backend-as-a-Service (BaaS)** platform. It eliminates traditional backend middle-tiers (such as Spring Boot, Express, or Django) in favor of a cloud-native, serverless model where client requests communicate securely with a managed **PostgreSQL** database, **InsForge Auth**, **InsForge Storage**, and **InsForge Realtime** via the official `@insforge/sdk`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WriteSpace Frontend (SPA)                       │
│    React 18 + Tailwind CSS + React Router + Lucide Icons + Vite        │
└──────────────┬──────────────────────────┬──────────────────────────────┘
               │                          │
        (Authentication)            (Data / Query)
               │                          │
               ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    InsForge Platform Services                          │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│   │    InsForge Auth    │  │ InsForge Storage│  │ InsForge Realtime │  │
│   │ (JWT / Session / DB)│  │ (Images / CDN)  │  │(WebSocket Events) │  │
│   └──────────┬──────────┘  └────────┬────────┘  └─────────┬─────────┘  │
│              │                      │                     │            │
│              └──────────────────────┼─────────────────────┘            │
│                                     │                                  │
│                                     ▼                                  │
│               ┌──────────────────────────────────────────┐             │
│               │       InsForge Managed PostgreSQL        │             │
│               │                                          │             │
│               │  • Schema & Foreign Keys                 │             │
│               │  • Row Level Security (RLS) Policies     │             │
│               │  • Triggers & Timestamps                 │             │
│               │  • PostgREST Data Access Layer           │             │
│               └──────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Principles

1. **Zero Monolith Overhead**: No separate application server to maintain, deploy, or serialize/deserialize redundant DTOs.
2. **Database-Enforced Security**: Security policies are not deferred to application controllers; PostgreSQL **Row Level Security (RLS)** acts as the ultimate gatekeeper for every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operation.
3. **Decoupled Presentation & Service Layer**: React components never invoke raw database queries directly. All calls flow through dedicated domain services (`services/postService.js`, `services/profileService.js`, etc.) which wrap the `@insforge/sdk` client.
4. **Optimistic & Responsive UI**: Interactions like liking, bookmarking, and following provide instant UI feedback while synchronizing in the background, with automatic rollback upon error.
5. **Strict Typing & Sanitization**: Markdown and HTML content rendered in the reading interface are sanitized using client-side DOM sanitizers (`DOMPurify`) to prevent XSS.

---

## 3. Frontend Architecture

### 3.1 Layered Directory Breakdown

```
src/
├── lib/
│   └── insforge.js          # Centralized InsForge client singleton
├── context/
│   ├── AuthContext.jsx       # Global user identity, token, profile state
│   └── ToastContext.jsx      # Global alert banner/toast notifications
├── services/                 # Pure async functions wrapping @insforge/sdk
│   ├── authService.js        # signUp, signIn, signOut, getCurrentSession
│   ├── postService.js        # fetchArticles, fetchBySlug, createPost, updatePost
│   ├── profileService.js     # getProfile, updateProfile, getAuthorArticles
│   ├── commentService.js     # getCommentsForPost, createComment, deleteComment
│   ├── socialService.js      # toggleLike, toggleBookmark, followUser, unfollowUser
│   └── storageService.js     # uploadAvatar, uploadCoverImage, getPublicUrl
├── hooks/                    # Reusable React hooks with loading, error, data state
│   ├── useAuth.js            # Consumer of AuthContext
│   ├── useArticles.js        # Feed fetching, pagination, category filtering
│   ├── useArticle.js         # Single article data, like & bookmark statuses
│   ├── useComments.js        # Comment thread fetching & submission
│   ├── useProfile.js         # Author profile and metrics
│   └── useFollow.js          # Following status check and mutation
├── components/
│   ├── common/               # Atoms: Button, Input, Modal, Loader, Avatar, Badge
│   ├── layout/               # Shells: Navbar, Footer, AppLayout, Sidebar
│   ├── articles/             # Molecules: ArticleCard, ArticleList, MarkdownEditor
│   ├── profile/              # Molecules: ProfileHeader, EditProfileModal, StatsBar
│   ├── comments/             # Molecules: CommentList, CommentCard, CommentBox
│   └── navigation/           # Molecules: CategoryPills, SearchInput, Tabs
└── pages/                    # Routed Views
    ├── Landing.jsx           # Guest landing page
    ├── Home.jsx              # Logged-in default feed
    ├── Explore.jsx           # Trending & tag discovery
    ├── Following.jsx         # Chronological articles from followed writers
    ├── ArticleDetails.jsx    # Distraction-free article reader
    ├── CreateArticle.jsx     # Editor & story publishing studio
    ├── EditArticle.jsx       # Story revision editor
    ├── Profile.jsx           # Writer profile & published portfolio
    ├── Dashboard.jsx         # Writer metrics & draft management
    ├── Bookmarks.jsx         # Saved articles
    ├── Notifications.jsx     # Social interaction inbox
    ├── Settings.jsx          # Profile & account configuration
    ├── Login.jsx             # Sign in
    └── Register.jsx          # Sign up
```

---

## 4. InsForge SDK Integration Pattern

All interactions with InsForge originate from a single centralized client instantiated in `src/lib/insforge.js`:

```javascript
import { createClient } from '@insforge/sdk';

const insforgeUrl = import.meta.env.VITE_INSFORGE_URL;
const insforgeAnonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!insforgeUrl || !insforgeAnonKey) {
  console.warn('InsForge credentials missing from environment variables.');
}

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
```

### Service-Layer Abstraction
React components never call `insforge.database` directly. Instead:
- **`postService.js`** encapsulates queries such as `insforge.database.from('posts').select('*, profiles(*)').eq('status', 'published')`.
- Services return `{ data, error }` tuples or throw typed errors caught by hooks.
- Hooks (`useArticles`, `useComments`) manage React state (`loading`, `error`, `data`) and expose mutation methods.

---

## 5. Authentication & Session Architecture

1. **User Sign Up**:
   - `authService.signUp(email, password, username, fullName)` invokes `insforge.auth.signUp()`.
   - The InsForge backend provisions the auth identity and a database trigger or post-signup hook populates the `public.profiles` table with matching `id`.
2. **Session Persistence**:
   - `AuthContext` listens to auth state changes and initial session check via `insforge.auth.getUser()`.
   - The user session token (JWT) is automatically included in subsequent `@insforge/sdk` requests.
3. **Protected Routes**:
   - A wrapper component `ProtectedRoute.jsx` inspects `user` and `loading`.
   - Unauthenticated visitors attempting to access `/new-story`, `/dashboard`, `/bookmarks`, or `/settings` are redirected to `/login` with a `returnTo` state.

---

## 6. Data Flow & Security Boundary

```
[User Action in Browser]
          │
          ▼
[React Component (ArticleCard / CommentBox)]
          │
          ▼
[Domain Hook (useArticle / useComments)]
          │
          ▼
[Domain Service (postService / commentService)]
          │
          ▼
[InsForge SDK Client with User JWT]
          │ (HTTPS POST/GET/PATCH/DELETE)
          ▼
[InsForge Gateway / PostgREST]
          │
          ▼
[PostgreSQL Database Engine]
          ├──> 1. Evaluates Row Level Security (RLS) Policy
          │      USING (auth.uid() = author_id)
          ├──> 2. Enforces Check Constraints & Foreign Keys
          └──> 3. Executes Triggers (updated_at timestamp, notification dispatch)
```

---

## 7. Storage Architecture

InsForge Object Storage houses media assets:
- **`avatars` bucket**: Public read access. Uploads restricted to authenticated users writing to `avatars/{userId}/avatar.jpg`.
- **`covers` bucket**: Public read access for published article covers. Uploads restricted to the article author.
- File uploads are validated on the client for MIME type (`image/jpeg`, `image/png`, `image/webp`) and size limits (< 5MB) before dispatching to `insforge.storage.from('bucket').upload(...)`.

---

## 8. Realtime Architecture

InsForge Realtime utilizes WebSocket subscriptions for instant updates:
- **Notification Inbox**: The client subscribes to inserts on the `notifications` table filtered by `recipient_id = auth.uid()`.
- **Engagement Counters**: Live incrementing of article like counts and comment feeds on active story pages.
