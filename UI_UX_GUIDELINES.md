# WriteSpace UI/UX Design Guidelines 🎨

This document defines the visual design system, typography scale, component standards, and user experience patterns for WriteSpace.

---

## 1. Design Philosophy

WriteSpace embodies an **editorial-first, distraction-free** design philosophy inspired by high-caliber publications and modern writing platforms (such as Substack and Medium):

- **Typography Over Chrome**: The written word is the centerpiece. Decorative UI clutter is minimized in favor of generous whitespace, balanced line lengths, and deliberate type hierarchy.
- **Warm & Sophisticated Palette**: Crisp text on soft, eye-friendly backgrounds to prevent reading fatigue.
- **Frictionless Creation**: The writing studio feels calm and spacious, removing cognitive load while drafting.
- **Instant Tactile Feedback**: Micro-interactions (liking, bookmarking, following) provide immediate optimistic visual feedback.

---

## 2. Color System

```css
/* Color Palette Specifications */
:root {
  /* Canvas & Backgrounds */
  --color-bg-primary: #FFFFFF;        /* Pure white for app cards */
  --color-bg-canvas: #FAFAF9;         /* Warm stone/cream page background */
  --color-bg-muted: #F5F5F4;          /* Stone 100 for pills and code blocks */

  /* Typography */
  --color-text-main: #1C1917;         /* Warm black (Stone 900) for headers and reading body */
  --color-text-muted: #78716C;        /* Stone 500 for metadata, timestamps, counters */
  --color-text-subtle: #A8A29E;       /* Stone 400 for placeholders */

  /* Borders & Dividers */
  --color-border-light: #E7E5E4;      /* Stone 200 for subtle borders and card separators */
  --color-border-dark: #D6D3D1;       /* Stone 300 for active focus borders */

  /* Brand Accent & Interactions */
  --color-accent: #0F766E;            /* Editorial Deep Teal / Emerald (Teal 700) */
  --color-accent-hover: #115E59;      /* Teal 800 */
  --color-accent-light: #F0FDFA;      /* Teal 50 for badges and active pills */
  
  /* State Accents */
  --color-like-heart: #E11D48;        /* Rose 600 for active likes */
  --color-bookmark: #0284C7;          /* Sky 600 for active bookmarks */
  --color-danger: #DC2626;            /* Red 600 for destructive actions */
}
```

---

## 3. Typography Scale & Hierarchy

WriteSpace utilizes a dual-font strategy:
1. **Editorial Serif** (e.g. `Merriweather`, `Charter`, or `Lora` via Tailwind `font-serif`): Reserved for article headlines, story subtitles, and long-form article body text.
2. **System Sans-Serif** (e.g. `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`): Used for navigation, buttons, profile handles, metadata, and form controls.

### Reading Text Rules
- **Max Line Width**: 680px – 720px (`max-w-2xl` to `max-w-3xl`) for optimal human eye tracking.
- **Body Font Size**: `text-lg` (18px) on mobile, `text-xl` (20px) on desktop.
- **Line Height**: `leading-relaxed` (1.75 to 1.8) for effortless long-form reading.
- **Letter Spacing**: `-0.011em` for editorial headings.

---

## 4. Reusable Component Standards

### 4.1 Buttons (`components/common/Button.jsx`)
- **Primary**: Solid teal background, white text, subtle hover darkening, rounded-full or rounded-md.
- **Secondary**: Stone-100 background, stone-800 text, hover:bg-stone-200.
- **Outline**: 1px border stone-300, transparent background, text stone-700.
- **Ghost**: Transparent background, text stone-600, hover:bg-stone-100.
- **Destructive**: Red-600 text or red-600 solid for delete actions.

### 4.2 Article Card (`components/articles/ArticleCard.jsx`)
- Horizontal/Vertical layout with clear typographic separation.
- **Author Row**: 24px circular avatar, author name, publish date, category pill.
- **Title**: Serif or bold sans `text-xl font-bold hover:underline`.
- **Excerpt**: 2-line truncated summary (`line-clamp-2`).
- **Footer**: Reading time badge, like counter, comment counter, bookmark button.
- **Thumbnail**: Aspect ratio 16:9 or 1:1, rounded-lg with subtle border.

### 4.3 Editorial Story Reader (`pages/ArticleDetails.jsx`)
- **Sticky Engagement Bar**: Docked at bottom of viewport on mobile, floating on desktop margin.
- **Author Bio Card**: Positioned beneath article body with author avatar, bio, follower count, and primary Follow button.
- **Discussion Drawer / Section**: Clean comment inputs with instant appending.

### 4.4 Form Controls (`components/common/Input.jsx`, `Textarea.jsx`)
- Smooth rounded borders with subtle focus ring (`focus:ring-2 focus:ring-teal-600 focus:border-transparent`).
- Accessible `<label>` associations and inline validation error text in red-600.

---

## 5. Responsive Breakpoint Rules

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| **Mobile** | `< 640px` | Single-column stack, full-width cards, compact bottom navigation bar or hamburger menu, sticky bottom engagement bar. |
| **Tablet** | `640px – 1024px` | Standard top navbar, two-column grid on Explore page, centered article body (680px). |
| **Desktop**| `> 1024px` | Three-column home layout (Nav / Main Feed / Trending Sidebar), sticky author actions, floating engagement bar. |

---

## 6. Accessibility (a11y) Standards

1. **Semantic HTML**: `<article>`, `<main>`, `<header>`, `<footer>`, `<nav>`, and `<section>` tags used exclusively over arbitrary `<div>` nesting.
2. **Keyboard Focus**: Visible high-contrast focus rings for keyboard tab traversal.
3. **Screen Readers**: `aria-label` tags on all icon-only buttons (like, bookmark, search, menu).
4. **Color Independence**: System states (such as active likes or follow status) are communicated via both color and iconography/text changes.
