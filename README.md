# WriteSpace ✍️

> A modern, distraction-free social publishing and content platform built for writers and engaged readers. Inspired by the editorial elegance of Substack and Medium, backed by React, Tailwind CSS, and InsForge Backend-as-a-Service (BaaS).

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](#)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](#)
[![InsForge](https://img.shields.io/badge/Backend-InsForge%20BaaS-4F46E5)](#)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20RLS-336791?logo=postgresql&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 1. Project Overview

**WriteSpace** is a complete, production-minded social media and content publishing web application. It combines long-form editorial publishing with modern social networking primitives:

- **For Writers**: A distraction-free editorial interface, draft/publish lifecycle, cover image uploads, tag and category assignment, estimated reading time, and reader feedback metrics.
- **For Readers**: Personalized chronological home feeds, following feeds, explore streams, category browsing, full-text article search, responsive mobile-first typography, bookmarks, likes, and nested commentary.
- **For the Architecture**: A pure, decoupled, serverless frontend-to-BaaS architecture using **React** and **Tailwind CSS** communicating directly with **InsForge** (managed PostgreSQL, Row Level Security, InsForge Auth, S3-compatible Storage, and Realtime).

No traditional monolithic backends (Spring Boot, Django, Express.js) are used. Security and access controls are enforced at the database layer via PostgreSQL **Row Level Security (RLS)** and InsForge Auth session tokens.

---

## 2. Key Features

| Category | Features |
|---|---|
| **Authentication** | Email & password registration, secure login, persistent session management, user profile bootstrap trigger, logout, password recovery. |
| **User Profiles** | Custom handles (`@username`), full name, bio, avatar upload via InsForge Storage, follower/following counts, author tabs (Published / Liked / Saved). |
| **Article Management** | Markdown/Rich editor, draft saving, instant publishing, auto-calculated reading time, cover image uploads, category tags, slug generation, edit/delete controls. |
| **Social Graph** | One-click author follow/unfollow, mutual follower tracking, non-self-following database constraints. |
| **Engagement** | One-click post likes (atomic unique constraint), nested comment threads, personal bookmark library with private reading list access. |
| **Feeds & Discovery** | Chronological home feed, subscriber-only following feed, explore trending stream, category filters, real-time keyword search for articles and writers. |
| **Notifications** | Real-time event notifications for new followers, comments on authored posts, and likes. |
| **Security & Privacy** | Rigorous PostgreSQL Row Level Security (RLS) guaranteeing that private drafts and personal bookmarks remain inaccessible to other users. |

---

## 3. Technology Stack

### Frontend Tier
- **Framework**: React.js (v18+) with Functional Components & Hooks
- **Styling**: Tailwind CSS with custom editorial typography plugins (`@tailwindcss/typography`)
- **Routing**: React Router (v6+)
- **Icons**: Lucide React
- **Client Integration**: Official `@insforge/sdk`
- **Build Tooling**: Vite for lightning-fast HMR and optimized production bundles

### Backend & Persistence Tier (InsForge BaaS)
- **Platform**: InsForge Backend-as-a-Service
- **Database**: PostgreSQL 15+ with Row Level Security (RLS)
- **Identity & Auth**: InsForge Auth (JWT-based session management, bcrypt password hashing, secure cookie/bearer token exchange)
- **Object Storage**: InsForge Storage (S3-compatible buckets for avatars and article cover images)
- **Realtime**: InsForge Realtime (WebSockets/Socket.io event bus for notifications and live interactions)
- **API Gateway**: PostgREST / InsForge Data Layer

---

## 4. Architecture Summary

```
┌───────────────────────────────────────────────────────────┐
│                    WriteSpace Client                      │
│     (React 18 + Tailwind CSS + React Router + Vite)       │
└──────────────┬─────────────────────────────┬──────────────┘
               │                             │
    [InsForge Auth SDK]           [@insforge/sdk Data]
               │                             │
               ▼                             ▼
┌───────────────────────────────────────────────────────────┐
│                 InsForge BaaS Platform                    │
│                                                           │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────┐ │
│  │  InsForge Auth  │  │ Storage Bucket │  │  Realtime   │ │
│  │ (JWT & Sessions)│  │ (Cover/Avatars)│  │ (WebSocket) │ │
│  └────────┬────────┘  └───────┬────────┘  └──────┬──────┘ │
│           │                   │                  │        │
│           ▼                   ▼                  ▼        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │             InsForge Managed PostgreSQL             │  │
│  │                                                     │  │
│  │  • profiles    • posts       • comments   • likes   │  │
│  │  • follows     • bookmarks   • categories • notifs  │  │
│  │                                                     │  │
│  │  [Row Level Security (RLS) & Relational Integrity]  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 5. Directory Structure

```
writespace/
├── README.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
├── FEATURES.md
├── REQUIREMENTS.md
├── USER_WORKFLOWS.md
├── UI_UX_GUIDELINES.md
├── SECURITY.md
├── DEVELOPMENT_ROADMAP.md
├── TESTING.md
├── DEPLOYMENT.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── assets/
    ├── lib/
    │   └── insforge.js             # Centralized InsForge SDK client
    ├── context/
    │   ├── AuthContext.jsx          # User session & profile state
    │   └── ToastContext.jsx         # Global notifications & alerts
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useArticles.js
    │   ├── useArticle.js
    │   ├── useComments.js
    │   ├── useProfile.js
    │   └── useFollow.js
    ├── services/
    │   ├── authService.js
    │   ├── postService.js
    │   ├── profileService.js
    │   ├── commentService.js
    │   ├── socialService.js
    │   └── storageService.js
    ├── components/
    │   ├── common/                  # Buttons, Inputs, Loaders, Badges, Modals
    │   ├── layout/                  # Navbar, Footer, Sidebar, Container
    │   ├── articles/                # ArticleCard, ArticleList, Editor, ReadingProgress
    │   ├── profile/                 # ProfileHeader, EditProfileModal, FollowButton
    │   ├── comments/                # CommentItem, CommentSection, CommentForm
    │   └── navigation/              # NavTabs, CategoryFilter, SearchBar
    ├── pages/
    │   ├── Landing.jsx              # Hero & editorial preview
    │   ├── Home.jsx                 # Personalized home feed
    │   ├── Explore.jsx              # Trending articles & categories
    │   ├── Following.jsx            # Articles from followed creators
    │   ├── Login.jsx                # Authentication entry
    │   ├── Register.jsx             # New account onboarding
    │   ├── ArticleDetails.jsx       # Long-form article reading view
    │   ├── CreateArticle.jsx        # Story composer & draft editor
    │   ├── EditArticle.jsx          # Edit existing story
    │   ├── Profile.jsx              # Author page & public portfolio
    │   ├── Dashboard.jsx            # Writer analytics & story management
    │   ├── Bookmarks.jsx            # Personal saved stories
    │   ├── Notifications.jsx        # Activity feed
    │   └── Settings.jsx             # Account & preferences
    └── utils/
        ├── readingTime.js
        ├── formatDate.js
        └── slugify.js
```

---

## 6. Quick Start & Setup

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9+ or pnpm
- An active InsForge Project URL and Anonymous Public Key

### Installation

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd writespace
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   VITE_INSFORGE_URL=https://your-project.insforge.app
   VITE_INSFORGE_ANON_KEY=your-insforge-anon-key
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 7. Documentation Index

Comprehensive engineering and architectural documentation is maintained in the [`docs/`](docs/) directory:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Full component, state, and BaaS interaction architecture.
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)**: Complete PostgreSQL tables, RLS policies, indexes, and triggers.
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**: InsForge SDK client methods and data contracts.
- **[FEATURES.md](docs/FEATURES.md)**: Detailed feature catalogue and module specifications.
- **[REQUIREMENTS.md](docs/REQUIREMENTS.md)**: Functional, non-functional, and technical requirements.
- **[USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md)**: Step-by-step user journey maps.
- **[UI_UX_GUIDELINES.md](docs/UI_UX_GUIDELINES.md)**: Design system, typography scale, and responsive layout rules.
- **[SECURITY.md](docs/SECURITY.md)**: Security matrix, RLS policy enforcement, and XSS prevention.
- **[DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)**: Phase 0 through Phase 15 step-by-step plan.
- **[TESTING.md](docs/TESTING.md)**: Test strategy, component testing, and RLS verification.
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Production build, CDN hosting, and environment configuration.

---

## 8. License

This project is licensed under the MIT License.
