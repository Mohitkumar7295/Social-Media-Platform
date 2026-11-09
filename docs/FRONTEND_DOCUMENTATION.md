# WriteSpace: Frontend Architecture & Client Engineering Manual

> **Technology Stack:** HTML5 / Modern CSS3 (Custom Properties & Grid) / Vanilla ES6+ JavaScript  
> **Networking:** Browser Fetch API  
> **Build Requirements:** Zero-build / No Node.js compilation required  
> **Status:** Implementation Baseline Manual

---

## 1. Purpose
This document provides the definitive engineering guide for the **WriteSpace** user interface. It defines the client directory layout, HTML page contracts, modular CSS architecture, JavaScript execution model, REST API integration, state management, and accessibility practices.

---

## 2. Scope
This specification encompasses:
- Single/Multi-Page hybrid client structure across all user views (`index`, `feed`, `article`, `editor`, `profile`, `bookmarks`, `login`, `register`).
- CSS custom properties, responsive breakpoints, and typography system.
- Vanilla JavaScript module architecture (`api.js`, `auth.js`, `ui.js`, page controllers).
- Client-side token storage, authentication guarding, and DOM lifecycle events.
- Component rendering: Article Cards, Markdown/Text Editor, Comment Threads, Like & Follow buttons.

---

## 3. Technical Explanation: Zero-Build Architecture

Modern web development frequently suffers from excessive tooling churn (Webpack, Vite, polyfills, virtual DOM overhead). WriteSpace adopts a **clean, standards-native web approach**:
- **Native ES6 Modules:** Utilizing `<script type="module">` for dependency organization without bundlers.
- **Modern CSS3:** CSS Custom Properties (`--color-...`), Flexbox, and CSS Grid replace bloated CSS utility frameworks.
- **Direct DOM Manipulation:** Fast, predictable DOM rendering using `<template>` cloning and safe `.textContent` assignment.
- **Fast First Paint:** HTML and CSS load immediately with sub-50ms parse times.

---

## 4. Frontend Directory Structure

```
frontend/
├── index.html                  # Public discovery and landing page
├── feed.html                   # Personalized follower feed (Auth required)
├── article.html                # Full article reading interface with comments
├── editor.html                 # Post composition and drafting studio
├── profile.html                # Author profile and catalog
├── bookmarks.html              # Saved reading list (Auth required)
├── login.html                  # Sign in view
├── register.html               # Sign up view
│
├── css/
│   ├── variables.css           # Design tokens, color system, font stacks, spacing
│   ├── base.css                # CSS reset, body typography, containers, links
│   ├── components.css          # Cards, buttons, forms, badges, modals, toasts
│   └── pages/                  # Specialized page styling
│       ├── article.css         # Long-form editorial typography & reading column
│       ├── editor.css          # Distraction-free writing canvas
│       └── profile.css         # Profile header, stats, and tabbed view
│
└── js/
    ├── api.js                  # Centralized Fetch wrapper & error interceptor
    ├── auth.js                 # JWT storage, user identity, session management
    ├── ui.js                   # Notification toasts, formatting, DOM helpers
    └── pages/                  # Page-specific execution logic
        ├── index.js            # Explore feed loading & tag filtering
        ├── feed.js             # Follower feed loading
        ├── article.js          # Article view, like toggle, comment submission
        ├── editor.js           # Draft autosave & post publishing
        ├── profile.js          # Author stats & follow toggle
        └── bookmarks.js        # Bookmark list management
```

---

## 5. CSS Architecture & Design Token System

### 5.1 Design Tokens (`css/variables.css`)
```css
:root {
  /* Color Palette */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6B6B;
  --color-border: #E8E8E8;
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-danger: #DC2626;
  --color-success: #16A34A;

  /* Typography Stacks */
  --font-serif: "Charter", "Merriweather", "Georgia", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  --font-mono: "Fira Code", monospace;

  /* Typography Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1.0rem;    /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 2.0rem;     /* 32px */
  --text-4xl: 2.5rem;     /* 40px */

  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1.0rem;
  --space-6: 1.5rem;
  --space-8: 2.0rem;
  --space-12: 3.0rem;

  /* Layout Widths */
  --max-width-content: 720px;   /* Editorial reading column */
  --max-width-site: 1140px;     /* Global layout container */

  /* Border Radii & Shadows */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

## 6. JavaScript Module Architecture

### 6.1 Authentication Module (`js/auth.js`)
```javascript
const TOKEN_KEY = 'writespace_jwt';
const USER_KEY = 'writespace_user';

export const auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }
};
```

---

### 6.2 REST API Client Module (`js/api.js`)
```javascript
import { auth } from './auth.js';
import { ui } from './ui.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api/v1'
  : 'https://api.writespace.app/api/v1';

export async function request(endpoint, options = {}) {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      auth.clearSession();
      ui.showToast('Session expired. Please sign in again.', 'error');
      setTimeout(() => window.location.href = '/login.html', 1500);
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

### 6.3 UI Utilities & Notification Engine (`js/ui.js`)
```javascript
export const ui = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3500);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  renderArticleCard(post) {
    const template = document.getElementById('article-card-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.card-title').textContent = post.title;
    clone.querySelector('.card-title-link').href = `/article.html?slug=${post.slug}`;
    clone.querySelector('.card-excerpt').textContent = post.excerpt || '';
    clone.querySelector('.card-author-name').textContent = post.author.displayName;
    clone.querySelector('.card-author-avatar').src = post.author.avatarUrl || '/assets/default-avatar.svg';
    clone.querySelector('.card-date').textContent = this.formatDate(post.publishedAt);
    clone.querySelector('.card-read-time').textContent = `${post.readingTimeMinutes} min read`;
    clone.querySelector('.card-likes-count').textContent = post.likesCount;

    return clone;
  }
};

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}
```

---

## 7. Core Component Implementations

### 7.1 Article Card Component (`index.html` & `feed.html`)
- Displays title, author avatar, author display name, publication date, read time estimate, and like count.
- Structured with an accessible `<article>` container and heading links.

### 7.2 Like Button Reactive Toggle (`js/pages/article.js`)
```javascript
async function handleLikeToggle(postId, buttonElement, countElement) {
  if (!auth.isAuthenticated()) {
    ui.showToast('Please sign in to like articles', 'info');
    return;
  }

  try {
    const data = await request(`/posts/${postId}/like`, { method: 'POST' });
    buttonElement.classList.toggle('liked', data.liked);
    countElement.textContent = data.likesCount;
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}
```

### 7.3 Follow Button Reactive Toggle (`js/pages/profile.js`)
```javascript
async function handleFollowToggle(authorId, buttonElement, followersCountElement) {
  if (!auth.isAuthenticated()) {
    ui.showToast('Please sign in to follow writers', 'info');
    return;
  }

  try {
    const data = await request(`/users/${authorId}/follow`, { method: 'POST' });
    buttonElement.textContent = data.following ? 'Following' : 'Follow';
    buttonElement.classList.toggle('btn-secondary', data.following);
    buttonElement.classList.toggle('btn-primary', !data.following);
    followersCountElement.textContent = data.followersCount;
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}
```

---

## 8. Accessibility & Responsive Breakpoints

- **Breakpoints:**
  - Mobile: $\le 640\text{px}$ (Navigation collapses into drawer; single-column article cards).
  - Tablet: $641\text{px} \text{--} 1024\text{px}$ (Reading column centered; condensed metadata).
  - Desktop: $\ge 1025\text{px}$ (Full sidebar, sticky author card on article pages).
- **Accessibility Invariants:**
  - All interactive elements possess `:focus-visible` styles with a high-contrast focus ring.
  - Form controls associate explicitly with `<label>` tags.
  - Buttons contain explicit text or `aria-label` attributes.

---

## 9. Testing Requirements
- Cross-browser functional testing on Chrome, Firefox, Safari, and Edge.
- Screen reader accessibility verification with NVDA/VoiceOver.
- Validation that network failure gracefully renders toast alerts without freezing the client.

---

## 10. Acceptance Criteria
- [ ] No build step required; opening `index.html` through a local HTTP server functions flawlessly.
- [ ] Authentication redirects properly protect `editor.html`, `feed.html`, and `bookmarks.html`.
- [ ] Like and follow actions update the UI reactively without full page reloads.
- [ ] All user-generated text is bound safely without raw HTML injection.
