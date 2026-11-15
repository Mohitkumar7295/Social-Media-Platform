# WriteSpace Phased Development Roadmap 🗺️

This document details the phase-by-phase implementation schedule, deliverables, verification criteria, and transition gates for WriteSpace.

---

## Roadmap Overview & Progress

```
[Phase 0: Docs & Planning] ──► [Phase 1: React & InsForge Setup] ──► [Phase 2: PostgreSQL & RLS]
           │                                                                 │
           ▼                                                                 ▼
[Phase 5: Article Management] ◄── [Phase 4: User Profiles] ◄── [Phase 3: Authentication]
           │
           ▼
[Phase 6: Reading View] ──► [Phase 7: Likes & Comments] ──► [Phase 8: Follow Graph]
                                                                     │
                                                                     ▼
[Phase 11: Bookmarks] ◄── [Phase 10: Search & Discovery] ◄── [Phase 9: Content Feeds]
           │
           ▼
[Phase 12: Realtime & Notifs] ──► [Phase 13: Dashboard] ──► [Phase 14: Audit] ──► [Phase 15: Deployment]
```

---

## Phase Details

### Phase 0: Project Documentation and Planning
- **Status**: **IN PROGRESS / COMPLETE**
- **Objective**: Establish complete technical blueprint, documentation suite, schema definitions, and API specifications.
- **Deliverables**:
  - `README.md`
  - `ARCHITECTURE.md`
  - `DATABASE_SCHEMA.md`
  - `API_DOCUMENTATION.md`
  - `FEATURES.md`
  - `REQUIREMENTS.md`
  - `USER_WORKFLOWS.md`
  - `UI_UX_GUIDELINES.md`
  - `SECURITY.md`
  - `DEVELOPMENT_ROADMAP.md`
  - `TESTING.md`
  - `DEPLOYMENT.md`
- **Validation**: User reviews and approves the blueprint before code execution begins.

---

### Phase 1: React Environment and InsForge Setup
- **Status**: PENDING
- **Objective**: Scaffold clean React 18 Single Page Application with Vite, Tailwind CSS, Lucide icons, and centralize `@insforge/sdk` client.
- **Deliverables**:
  - `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
  - Environment configuration (`.env.example`)
  - `src/lib/insforge.js` singleton client
  - Base routing and layout skeleton (`Navbar`, `Footer`, `AppLayout`)
- **Validation**: `npm run build` passes with zero errors; dev server renders empty layout shell.

---

### Phase 2: PostgreSQL Schema and RLS Policies
- **Status**: PENDING
- **Objective**: Apply relational database schema, indexes, constraints, triggers, and Row Level Security policies to InsForge PostgreSQL.
- **Deliverables**:
  - `public.profiles`, `public.categories`, `public.posts`, `public.comments`, `public.likes`, `public.follows`, `public.bookmarks`, `public.notifications`
  - RLS policies configured and active on all 8 tables
  - Trigger functions for timestamps and user profile auto-creation
- **Validation**: Schema inspection confirms all tables, constraints, and RLS policies are enabled and verified.

---

### Phase 3: Authentication Subsystem
- **Status**: PENDING (MVP P0)
- **Objective**: Implement user registration, login, logout, and persistent session state.
- **Deliverables**:
  - `src/services/authService.js`
  - `src/context/AuthContext.jsx` and `src/hooks/useAuth.js`
  - `src/pages/Login.jsx` and `src/pages/Register.jsx`
  - `src/components/common/ProtectedRoute.jsx`
- **Validation**: User can register, session persists across page reloads, and logout clears state.

---

### Phase 4: User Profiles
- **Status**: PENDING (MVP P0)
- **Objective**: Author profile viewing, biography editing, and avatar image uploads via InsForge Storage.
- **Deliverables**:
  - `src/services/profileService.js`
  - `src/services/storageService.js`
  - `src/pages/Profile.jsx` (`/u/:username`)
  - `src/components/profile/ProfileHeader.jsx`, `EditProfileModal.jsx`
- **Validation**: Profile updates persist, avatar uploads to storage, and counts render accurately.

---

### Phase 5: Article Management (Authoring & Drafting)
- **Status**: PENDING (MVP P0)
- **Objective**: Story creation studio with cover image uploads, draft saving, publishing, and reading time estimation.
- **Deliverables**:
  - `src/services/postService.js`
  - `src/pages/CreateArticle.jsx` and `src/pages/EditArticle.jsx`
  - `src/utils/readingTime.js` and `src/utils/slugify.js`
- **Validation**: Authors can create drafts, upload cover images, publish stories, and verify drafts remain private.

---

### Phase 6: Article Reading Interface
- **Status**: PENDING (MVP P0)
- **Objective**: Build an editorial reading view with responsive typography, author bio card, and sticky engagement bar.
- **Deliverables**:
  - `src/pages/ArticleDetails.jsx` (`/story/:slug`)
  - `src/components/articles/ReadingProgress.jsx`
  - `src/components/articles/AuthorCard.jsx`
- **Validation**: Published articles render smoothly with proper typography hierarchy on mobile and desktop.

---

### Phase 7: Likes and Comments
- **Status**: PENDING (MVP P0)
- **Objective**: Enable readers to like stories and participate in discussion threads.
- **Deliverables**:
  - `src/services/commentService.js`
  - `src/components/comments/CommentSection.jsx`, `CommentItem.jsx`
  - Optimistic like toggle in engagement bar
- **Validation**: Likes cannot be duplicated, users can delete only their own comments, and counters update accurately.

---

### Phase 8: Follow System
- **Status**: PENDING (MVP P0)
- **Objective**: Social graph enabling readers to follow favorite writers.
- **Deliverables**:
  - `src/hooks/useFollow.js`
  - `src/components/profile/FollowButton.jsx`
  - Self-follow prevention and follow state sync
- **Validation**: Follow state updates immediately; follower and following counters increment appropriately.

---

### Phase 9: Home, Following, and Explore Feeds
- **Status**: PENDING (MVP P0)
- **Objective**: Multi-stream feed aggregation (Curated Home, Subscriber-only Following feed, Topic Explore).
- **Deliverables**:
  - `src/pages/Home.jsx`, `src/pages/Following.jsx`, `src/pages/Explore.jsx`
  - `src/components/articles/ArticleCard.jsx` and `src/components/articles/ArticleList.jsx`
  - Topic category filter bar
- **Validation**: Following feed only shows articles from creators the user follows; Explore displays trending stories.

---

### Phase 10: Search and Discovery
- **Status**: PENDING (MVP P0)
- **Objective**: Real-time keyword search for stories and author profiles.
- **Deliverables**:
  - Search input with debounce
  - Filtered results view with story and writer tabs
- **Validation**: Typing matches keywords in titles and usernames without latency.

---

### Phase 11: Bookmarks & Reading Library
- **Status**: PENDING (P1)
- **Objective**: Private saved reading list.
- **Deliverables**:
  - `src/pages/Bookmarks.jsx`
  - Bookmark toggle actions across all article cards and reading views
- **Validation**: Bookmarks are strictly private to each user; RLS prevents cross-account queries.

---

### Phase 12: Notifications and Realtime
- **Status**: PENDING (P1)
- **Objective**: In-app activity notifications and live engagement updates.
- **Deliverables**:
  - `src/pages/Notifications.jsx`
  - Realtime subscriptions on `notifications` table
- **Validation**: New likes, comments, and follows trigger real-time badge updates.

---

### Phase 13: Writer Dashboard & Story Studio
- **Status**: PENDING (P1)
- **Objective**: Dedicated author dashboard for story analytics, draft management, and quick editing.
- **Deliverables**:
  - `src/pages/Dashboard.jsx`
  - Metrics cards (views, likes, comments) and quick action modals
- **Validation**: Author can manage all stories in one centralized location.

---

### Phase 14: Testing and Security Audit
- **Status**: PENDING
- **Objective**: Full end-to-end testing, RLS policy verification with multiple accounts, and build audits.
- **Deliverables**:
  - Test suite verification (`npm test`, build checks)
  - Multi-account RLS isolation audit report
- **Validation**: Zero console errors, zero build warnings, 100% RLS security compliance.

---

### Phase 15: Production Deployment
- **Status**: PENDING
- **Objective**: Production build optimization, environment variable configuration, and hosting deployment.
- **Deliverables**:
  - Optimized static build artifacts in `dist/`
  - Production CDN deployment guide
- **Validation**: Live production URL operational and verified across devices.
