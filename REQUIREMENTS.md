# WriteSpace System Requirements Specification 📋

This document outlines the functional, non-functional, technical, and compliance requirements for WriteSpace.

---

## 1. Technical Platform Constraints

1. **Backend Exclusivity**:
   - The application MUST rely strictly on **InsForge Backend-as-a-Service**.
   - No independent backends (Spring Boot, Django, Express.js, NestJS, FastAPI, Rails) are permitted.
   - All backend resources (PostgreSQL database, Auth, Storage, Edge Functions, Realtime) must be managed through InsForge.
2. **Frontend Framework**:
   - The user interface MUST be built with **React.js (18+)** and modern JavaScript (ES6+).
   - Component architecture MUST be functional with React Hooks.
   - Styling MUST utilize **Tailwind CSS** with responsive utility classes.
3. **Client Integration**:
   - Data access and authentication MUST utilize the official `@insforge/sdk`.
   - Raw database queries or API tokens must never be exposed outside the SDK configuration.

---

## 2. Functional Requirements (FR)

### FR-1: Authentication & Identity
- **FR-1.1**: The system must allow users to register an account using an email address, password (minimum 8 characters), username, and full name.
- **FR-1.2**: The system must allow users to authenticate using their email and password.
- **FR-1.3**: The system must support persistent session management via JWT tokens.
- **FR-1.4**: The system must allow authenticated users to securely log out.
- **FR-1.5**: Profile creation must occur synchronously or via database trigger upon successful account registration.

### FR-2: Profile Management
- **FR-2.1**: Every registered user must have a unique `@username` consisting of alphanumeric characters and underscores (3–30 chars).
- **FR-2.2**: Users must be able to view their own profile and any other user's public profile.
- **FR-2.3**: Users must be able to edit their display name, biography, website, and avatar image.
- **FR-2.4**: Public profiles must display the user's published articles, follower count, and following count.

### FR-3: Article Authoring & Publishing
- **FR-3.1**: Authenticated users must be able to draft, edit, and publish articles.
- **FR-3.2**: Authors must be able to save unpublished articles as "drafts".
- **FR-3.3**: Drafts must be strictly invisible to all other users.
- **FR-3.4**: Authors must be able to upload a cover image for each article.
- **FR-3.5**: The system must calculate and display an estimated reading time based on word count.
- **FR-3.6**: Authors must be able to edit and delete only their own articles.

### FR-4: Article Consumption & Reading
- **FR-4.1**: Any visitor (authenticated or unauthenticated) must be able to read published articles.
- **FR-4.2**: The reading view must present clean, distraction-free typography with proper headings, paragraphs, and media.
- **FR-4.3**: Each article page must display the author's card with a one-click follow action.

### FR-5: Social Interactions & Community
- **FR-5.1**: Authenticated users must be able to like and unlike published articles.
- **FR-5.2**: The database must enforce that a user cannot like a post more than once.
- **FR-5.3**: Authenticated users must be able to post comments on published articles.
- **FR-5.4**: Users must be able to delete only their own comments.
- **FR-5.5**: Authenticated users must be able to follow and unfollow authors.
- **FR-5.6**: A user cannot follow themselves, and cannot duplicate follow relationships.
- **FR-5.7**: Authenticated users must be able to save articles to their private bookmarks.

### FR-6: Feeds & Discovery
- **FR-6.1**: The Home Feed must present the latest published articles from all authors.
- **FR-6.2**: The Following Feed must display articles published exclusively by authors the user follows.
- **FR-6.3**: The Explore Feed must highlight trending stories and allow filtering by category.
- **FR-6.4**: Real-time search must filter articles by title and writers by username/name.

---

## 3. Non-Functional Requirements (NFR)

### NFR-1: Performance & Speed
- **Initial Load Time**: First Contentful Paint (FCP) must be under 1.5 seconds on standard 4G connections.
- **Interaction Latency**: Optimistic UI updates for likes and bookmarks must respond in under 50 milliseconds.
- **Bundle Optimization**: Production bundles must use code-splitting and asset minification via Vite.

### NFR-2: Security & Privacy
- **Row Level Security (RLS)**: Enforced on all PostgreSQL tables.
- **Credential Protection**: Service role keys or admin API keys must NEVER be bundled in client JavaScript.
- **XSS Prevention**: User-generated markdown/HTML content must be sanitized before DOM injection.
- **Private Data Protection**: Drafts and bookmarks must be inaccessible to unauthorized users even with manipulated API requests.

### NFR-3: Accessibility (a11y) & Usability
- **Contrast**: Text contrast ratios must meet WCAG 2.1 AA standards (minimum 4.5:1 for body copy).
- **Responsive Design**: Flawless visual rendering on mobile screens (320px+), tablets (768px+), and desktops (1024px+).
- **Keyboard Navigation**: All interactive elements (buttons, inputs, links, dropdowns) must be keyboard accessible with visible focus rings.

---

## 4. Acceptance Criteria Summary

1. User can register, log in, and view their personalized profile.
2. User can write a post with title, content, cover image, and save as draft.
3. User can publish the post and verify it immediately displays on Home and Author Profile.
4. Another user can view the post, like it once, leave a comment, and follow the author.
5. The author can see the follower count increment and read comments.
6. A user's private bookmarks and drafts are completely invisible to any other account.
