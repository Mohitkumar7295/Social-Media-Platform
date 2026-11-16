# WriteSpace ✍️

> A modern, distraction-free social publishing and content platform built for writers and engaged readers. Inspired by the editorial elegance of Substack and Medium, engineered with React 18, Tailwind CSS, and InsForge Backend-as-a-Service (BaaS).

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](#)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](#)
[![InsForge](https://img.shields.io/badge/Backend-InsForge%20BaaS-4F46E5)](#)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20RLS-336791?logo=postgresql&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 1. Project Overview

**WriteSpace** is a complete, production-grade social publishing platform combining long-form editorial storytelling with modern social networking primitives:

- **For Writers**: A distraction-free editorial studio, autosaved drafts, instant publishing, custom slugs, cover image uploads, category classification, estimated reading time, and an analytics-driven Writer Dashboard.
- **For Readers**: Clean three-column authenticated home feed, personalized following feed, explore hub, dynamic category filter pills, instant debounced search for stories and writers, typography-optimized reading view, applauds, discussion responses, nested replies, and private bookmark collections.
- **Pure Serverless Architecture**: Direct client-to-BaaS architecture using **React 18** and **Tailwind CSS** communicating directly with **InsForge** (managed PostgreSQL with Row Level Security, InsForge Auth, and S3-compatible Object Storage).

Live Production URL: **https://u9367zk9.insforge.site**

---

## 2. Platform Architecture & Features (Phases 1–10)

| Phase | Module | Key Features & Implementation |
|---|---|---|
| **Phase 1** | **Public Landing Page** | Public homepage at `/`, hero section, featured articles, benefits showcase, category previews, and guest navigation. Redirects logged-in users to `/home`. |
| **Phase 2** | **Authentication & Profiles** | Email OTP registration, username availability checker, password-only login, session persistence, public profile views (`/profile/:username`), profile editing, avatar uploads, and cover image management. |
| **Phase 3** | **Authenticated Home Feed** | Substack-inspired 3-column layout at `/home` (Left Navigation Sidebar, Center Editorial Feed, Right Discovery Sidebar) with responsive mobile drawer and bottom navigation. |
| **Phase 4** | **Article Writing Studio** | Rich text writing studio at `/write` with TipTap editor, debounced autosave, cover image uploads, modal publishing workflows, slug generation, and draft management. |
| **Phase 5** | **Article Reading View** | Dedicated reading page at `/p/:slug` with DOMPurify sanitization, dynamic reading progress bar, table of contents with scrollspy, author credentials, and responsive typography. |
| **Phase 6** | **Social Interactions** | Post applauds/likes with optimistic updates, unique constraints preventing duplicates, threaded comments, nested replies, author-only editing, and deletion. |
| **Phase 7** | **Social Graph & Feeds** | Author follow/unfollow, check constraints preventing self-following, follower/following counts and modal lists, chronological "For You" feed, and personalized "Following" stream. |
| **Phase 8** | **Search, Explore & Bookmarks** | Real-time 250ms debounced global search dialog across stories and writers, curated `/explore` hub with category filter pills, and private `/bookmarks` reading list. |
| **Phase 9** | **Notifications & Writer Dashboard** | Real-time event notifications for follows, applauds, comments, and replies with unread badge indicators. Comprehensive Writer Studio at `/dashboard` with 6 real database metric cards. |
| **Phase 10** | **Audit, Security & Production** | End-to-end multi-actor security audit, RLS policy verification, XSS prevention, optimized Rollup code splitting, automated regression test suite, and production deployment. |

---

## 3. Technology Stack

### Frontend Tier
- **Framework**: React.js (v18.3.1) with Functional Components & Hooks
- **Styling**: Tailwind CSS (v3.4.16) with `@tailwindcss/typography`
- **Routing**: React Router (v6.28.0)
- **Editor**: TipTap StarterKit with Image, Link, and Underline extensions
- **Sanitization**: DOMPurify (v3.4.18) for strict XSS prevention
- **Icons**: Lucide React
- **Client SDK**: `@insforge/sdk` (v1.5.2)
- **Build Tooling**: Vite (v6.0.1) with custom Rollup code-splitting chunks

### Backend Tier (InsForge BaaS)
- **Platform**: InsForge Backend-as-a-Service (Project ID: `7bc81dc8-fa55-4593-92e4-75e1232f9362`)
- **Database**: PostgreSQL with Row Level Security (RLS) enabled on all 7 tables
- **Authentication**: InsForge Auth (JWT session management, bcrypt password hashing, email OTP verification)
- **Object Storage**: InsForge Storage (S3-compatible buckets: `avatars`, `covers`, `article-images`)
- **CLI**: `@insforge/cli` for migrations, queries, and deployments

---

## 4. Database Schema & Row Level Security

The application uses 7 primary tables in PostgreSQL, all secured with strict Row Level Security (24 policies total):

```
┌──────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
├───────────────┬──────────────────────────────────────────┤
│ profiles      │ User profile, username, bio, avatar      │
│ posts         │ Editorial articles & drafts (status)     │
│ likes         │ Post applauds (unique user + post)       │
│ comments      │ Discussions & nested replies (parent_id) │
│ follows       │ Social graph (non-self-following check)  │
│ bookmarks     │ Private reading list (unique user + post)│
│ notifications │ Event alerts for follows, likes, replies │
└───────────────┴──────────────────────────────────────────┘
```

### Security Highlights
- **Draft Isolation**: Unpublished articles (`status = 'draft'`) are queryable exclusively by their author. Public queries strictly enforce `status = 'published'`.
- **Private Bookmarks**: Bookmarks are strictly private (`auth.uid() = user_id`). Other users cannot query or enumerate saved reading lists.
- **Private Notifications**: Users can only query, mark as read, or delete notifications where `recipient_id = auth.uid()`.
- **Constraint-Enforced Integrity**:
  - `check_not_self_follow`: Rejects attempts by a user to follow themselves.
  - `check_no_self_notification`: Prevents self-alerts when author interacts with own content.
  - `unique_user_post_bookmark`: Prevents duplicate bookmarks.
  - `unique_post_user_like`: Prevents duplicate applauds.
  - `unique_follower_following`: Prevents duplicate follow records.

---

## 5. Project Directory Structure

```
Social Media Platform/
├── migrations/                           # PostgreSQL DDL migrations
│   ├── 20261116080000_phase8-bookmarks.sql
│   └── 20261116090000_phase9-notifications.sql
├── public/                               # Static web assets
├── scripts/                              # Automated integration test suites
│   ├── test-phase3.mjs                   # Authenticated feed tests
│   ├── test-phase4.mjs                   # Article publishing tests
│   ├── test-phase5.mjs                   # Article reading view tests
│   ├── test-phase6.mjs                   # Likes and comments tests
│   ├── test-phase7.mjs                   # Follows and personalized feeds tests
│   ├── test-phase8.mjs                   # Search, explore, and bookmarks tests
│   ├── test-phase9.mjs                   # Notifications and dashboard tests
│   └── test-phase10-master.mjs           # Master end-to-end platform audit
├── src/
│   ├── components/
│   │   ├── articles/                     # FeaturedArticles, StoryPreviewModal
│   │   ├── comments/                     # CommentSection, CommentComposer, CommentItem
│   │   ├── common/                       # Button, UserAvatar, ProtectedRoute
│   │   ├── dashboard/                    # DashboardStatCard, RecentArticles, RecentActivity
│   │   ├── editor/                       # RichTextEditor
│   │   ├── home/                         # AppLayout, Sidebar, RightSidebar, FeedCard, FeedTabs
│   │   ├── interactions/                 # LikeButton, BookmarkButton, ShareButton
│   │   ├── landing/                      # HeroSection, BenefitsSection, CategoriesSection
│   │   ├── layout/                       # Navbar, Footer
│   │   ├── notifications/                # NotificationBadge, NotificationItem
│   │   ├── profile/                      # ProfileHeader, FollowButton, UserFollowList
│   │   ├── reading/                      # ArticleRenderer, TableOfContents, ReadingProgressBar
│   │   └── search/                       # SearchModal
│   ├── context/                          # AuthContext (session state)
│   ├── hooks/                            # useAuth
│   ├── lib/                              # insforge.js (SDK initialization)
│   ├── pages/                            # Landing, Login, Register, Home, Write, Dashboard, etc.
│   ├── services/                         # Database service modules
│   │   ├── authService.js
│   │   ├── bookmarkService.js
│   │   ├── commentService.js
│   │   ├── dashboardService.js
│   │   ├── feedService.js
│   │   ├── followService.js
│   │   ├── likeService.js
│   │   ├── notificationService.js
│   │   ├── postService.js
│   │   ├── profileService.js
│   │   ├── recommendationService.js
│   │   ├── searchService.js
│   │   ├── storageService.js
│   │   └── subscriptionService.js
│   └── utils/                            # editorUtils, slugify, readingTime
├── .env.example                          # Example environment configuration
├── insforge.toml                         # InsForge deployment configuration
├── package.json                          # Dependencies and npm scripts
├── tailwind.config.js                    # Tailwind theme customization
└── vite.config.js                        # Vite build & chunking configuration
```

---

## 6. Getting Started & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Mohitkumar7295/Social-Media-Platform.git
cd "Social Media Platform"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your InsForge project credentials:
```bash
cp .env.example .env.local
```

Inside `.env.local`:
```env
VITE_INSFORGE_URL=https://u9367zk9.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=ik_7a92c79e83bf37e2f2791602c71bb359
VITE_APP_NAME=WriteSpace
VITE_APP_URL=http://localhost:5173
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Automated Testing Suite

WriteSpace includes comprehensive integration test suites verifying all database operations, constraints, RLS policies, and workflows against the live InsForge backend:

```bash
# Run the Master End-to-End Audit (Phase 10)
node scripts/test-phase10-master.mjs

# Run individual phase test suites
node scripts/test-phase3.mjs   # Authenticated home feed & recommendations
node scripts/test-phase4.mjs   # Article writing, autosave & publishing
node scripts/test-phase5.mjs   # Article reading view & 404 isolation
node scripts/test-phase6.mjs   # Applauds, discussion threads & nested replies
node scripts/test-phase7.mjs   # Social graph & personalized feeds
node scripts/test-phase8.mjs   # Search, explore & private bookmarks
node scripts/test-phase9.mjs   # Notifications & writer dashboard
```

All test scripts execute against real InsForge PostgreSQL tables and clean up test records automatically upon completion.

---

## 8. Production Build & Deployment

### Production Build
Compile optimized production assets with Rollup code-splitting:
```bash
npm run build
```

### Production Deployment (InsForge Hosting)
Deploy directly to InsForge's global CDN:
```bash
npx -y @insforge/cli deployments deploy .
```

Verified live production URL: **https://u9367zk9.insforge.site**

---

## 9. Security & Production Checklist

- [x] All database tables protected by Row Level Security (RLS).
- [x] Passwords hashed with bcrypt via InsForge Auth; never stored in application tables.
- [x] Anonymous API key used on client; zero privileged or service-role keys exposed.
- [x] User-generated HTML sanitized with DOMPurify before rendering to prevent stored XSS.
- [x] File uploads validated for MIME type and size limits (< 50MB).
- [x] Unique constraints prevent duplicate likes, bookmarks, and follows.
- [x] Check constraints prevent self-following and self-notification.
- [x] Drafts strictly isolated from public queries and search results.
- [x] Optimized code-splitting eliminates large JavaScript bundle warnings.
- [x] Zero mock or fabricated metrics displayed on feeds or dashboards.

---

## 10. License

This project is licensed under the MIT License. Built with ❤️ for writers and readers worldwide.
