# WriteSpace: UI/UX Guidelines & Visual Design System

> **Brand Identity:** WriteSpace  
> **Aesthetic Archetype:** Modern Editorial Minimalism  
> **Inspiration:** Substack & Medium editorial excellence, refined with an original digital identity  
> **Status:** Approved Design System Specification

---

## 1. Purpose
This document provides the definitive visual design system, interaction guidelines, component patterns, and accessibility standards for the **WriteSpace** web platform. It establishes the design tokens, layout grids, typography hierarchies, and component styling required to deliver a cohesive, premium reading and writing experience.

---

## 2. Scope
This specification encompasses:
- Brand identity, logo treatment, and visual personality.
- Color palette with explicit hex codes, functional roles, and contrast ratios.
- Typography scale, font pairings, reading column widths, and line-heights.
- Spacing rhythm, grid system, and responsive breakpoints.
- Component anatomy: Navigation bar, Article Cards, Editor Canvas, Profile Header, Buttons, Forms, Modals, and Toasts.
- Accessibility standards (WCAG 2.1 AA) and mobile interaction design.

---

## 3. Brand Identity & Personality

WriteSpace is designed as a **quiet sanctuary for written ideas**. Its identity avoids the aggressive color saturation, flashing indicators, and visual chaos typical of algorithmic microblogging platforms.

### Personality Attributes
- **Thoughtful & Dignified:** High-contrast serif typography for long-form text, generous whitespace, and muted accents.
- **Distraction-Free:** The interface recedes into the background, ensuring author words and ideas command undivided attention.
- **Fast & Responsive:** Snappy transitions ($150\text{--}200\text{ ms}$ ease-out), instant feedback, and zero layout shift.

---

## 4. Color Palette & Functional Roles

WriteSpace employs a disciplined neutral palette complemented by an intellectual cobalt accent:

```
+-----------------------------------------------------------------------------------+
| Color Role             | Hex Code   | Usage                                       |
|------------------------+------------+---------------------------------------------|
| Primary Background     | #FFFFFF    | Main reading canvas, page background        |
| Secondary Background   | #F9FAFB    | Cards, sidebars, code blocks, borders       |
| Primary Text (Ink)     | #111827    | Headings, article body text, primary labels |
| Secondary Text (Muted) | #6B7280    | Metadata, timestamps, read times, subtitles |
| Accent (Cobalt)        | #2563EB    | Primary buttons, active tabs, author links  |
| Accent Hover           | #1D4ED8    | Hover state for links and primary buttons   |
| Accent Light           | #EFF6FF    | Tag pills, subtle badge backgrounds         |
| Border / Divider       | #E5E7EB    | Card dividers, input borders, hairline rules|
| Danger / Destructive   | #DC2626    | Delete actions, form error messages         |
| Success                | #16A34A    | Success toasts, saved status badges         |
+-----------------------------------------------------------------------------------+
```

### Contrast Ratios (WCAG AA Compliance)
- Primary Text (`#111827`) on White (`#FFFFFF`): **16.1:1** (Exceeds WCAG AAA requirement of 7:1).
- Secondary Text (`#6B7280`) on White (`#FFFFFF`): **4.6:1** (Passes WCAG AA requirement of 4.5:1).
- Accent Button (`#FFFFFF` text on `#2563EB`): **4.6:1** (Passes WCAG AA).

---

## 5. Typography System

WriteSpace utilizes a dual-font pairing strategy:
- **Serif Stack (The Reader):** For article titles, excerpts, and long-form narrative body text.
- **Sans-Serif Stack (The Interface):** For navigation, metadata, buttons, labels, and forms.

### Font Stacks
```css
/* Editorial Narrative Typography */
--font-serif: "Charter", "Merriweather", "Georgia", serif;

/* Interface System Typography */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;

/* Code & Syntax */
--font-mono: "Fira Code", "Courier New", monospace;
```

### Type Scale Hierarchy

| Element | Font Stack | Size (rem / px) | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Article Title (H1)** | Serif | `2.5rem` (40px) | 700 (Bold) | 1.2 | `-0.02em` |
| **Section Heading (H2)**| Serif | `1.75rem` (28px)| 700 (Bold) | 1.3 | `-0.01em` |
| **Sub-heading (H3)** | Sans-Serif | `1.25rem` (20px)| 600 (Semibold)| 1.4 | `normal` |
| **Article Body Text** | Serif | `1.125rem` (18px)| 400 (Regular) | 1.7 | `0.005em` |
| **Feed Card Title** | Serif | `1.25rem` (20px)| 700 (Bold) | 1.3 | `-0.01em` |
| **Interface Body** | Sans-Serif | `0.9375rem` (15px)| 400 (Regular)| 1.5 | `normal` |
| **Metadata & Badges** | Sans-Serif | `0.8125rem` (13px)| 500 (Medium) | 1.4 | `0.01em` |

### The Golden Reading Column
To prevent eye fatigue during sustained reading, article body content is strictly constrained to a maximum width of **700px** (`--max-width-content`), yielding between **65 and 75 characters per line** at $18\text{px}$ font size.

---

## 6. Spacing Scale & Grid Layout

The spacing system is derived from an 8-point base grid:
- `space-1`: $4\text{px}$ (Micro spacing, badge padding)
- `space-2`: $8\text{px}$ (Button internal padding, icon gaps)
- `space-3`: $12\text{px}$ (Input padding, compact card gaps)
- `space-4`: $16\text{px}$ (Standard component spacing)
- `space-6`: $24\text{px}$ (Card padding, feed gaps)
- `space-8`: $32\text{px}$ (Section headers, form clusters)
- `space-12`: $48\text{px}$ (Major layout block divisions)
- `space-16`: $64\text{px}$ (Page hero and footer top margins)

---

## 7. Component Anatomy & Design Guidelines

### 7.1 Global Navigation Bar
- **Position:** Sticky top (`position: sticky; top: 0; z-index: 100`).
- **Background:** Semi-transparent white with backdrop blur (`background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px)`).
- **Border:** $1\text{px}$ solid `#E5E7EB` bottom border.
- **Left:** Minimalist logo ("WriteSpace" in bold serif) + Explore / Feed links.
- **Center:** Search input with search icon.
- **Right (Anonymous):** "Sign In" link and "Get Started" primary pill button.
- **Right (Authenticated):** "Write" button (pencil icon) + User Avatar with dropdown menu.

### 7.2 Article Card Component
```
+---------------------------------------------------------------------------------+
| [Avatar] Elena Rostova  ·  Nov 9, 2026  ·  6 min read                           |
|                                                                                 |
| Architecting Scalable Social Platforms with Spring Boot                         |
| A deep dive into decoupled layered architectures, relational guarantees, and   |
| zero-build web clients...                                                       |
|                                                                                 |
| [#Architecture]  [#Engineering]               [Heart Icon] 42   [Bookmark Icon] |
+---------------------------------------------------------------------------------+
```
- Flat card on white background with $1\text{px}$ hairline border (`#E5E7EB`).
- Hover state elevates card with a subtle shadow (`0 4px 12px rgba(0,0,0,0.06)`) and transitions smoothly over $150\text{ ms}$.

### 7.3 Buttons & Actions
- **Primary Button:** Background `#2563EB`, text `#FFFFFF`, border-radius $6\text{px}$, font-weight 500. Hover: `#1D4ED8`.
- **Secondary Button:** Background `#FFFFFF`, text `#111827`, border $1\text{px}$ solid `#E5E7EB`. Hover: `#F9FAFB`.
- **Text / Ghost Button:** Transparent background, text `#6B7280`. Hover: text `#111827`.
- **Danger Button:** Background `#DC2626`, text `#FFFFFF`. Hover: `#B91C1C`.

### 7.4 Input Forms
- Border: $1\text{px}$ solid `#D1D5DB`, border-radius $6\text{px}$, font-size $15\text{px}$, padding $10\text{px} \times 14\text{px}$.
- Focus State: Border color `#2563EB`, outline $2\text{px}$ ring with color `#BFDBFE`.
- Error State: Border color `#DC2626`, descriptive error message below in red $13\text{px}$.

---

## 8. Responsive Breakpoints & Mobile Optimization

WriteSpace enforces three primary responsive viewports:
1. **Mobile (`max-width: 640px`):**
   - Navigation links collapse into an off-canvas drawer or simplified header.
   - Article card cover images move to top rather than beside text.
   - Font size for article body scales slightly from $18\text{px}$ to $17\text{px}$ with $1.65$ line-height.
   - Touch targets for like buttons, bookmarks, and author links enforce a minimum size of $44\text{px} \times 44\text{px}$.
2. **Tablet (`641px - 1024px`):**
   - Two-column feed layout or single column with condensed sidebar.
3. **Desktop (`min-width: 1025px`):**
   - Main container centered at max-width $1140\text{px}$.
   - Side rail displays trending articles, recommended writers to follow, and topic tags.

---

## 9. Accessibility Invariants (WCAG 2.1 AA)
- Focus rings (`:focus-visible`) are prominent and never stripped via `outline: none` without replacement.
- Color is never used as the sole indicator of state (e.g., error messages include text icons and descriptive copy).
- Semantic headings follow strict nesting (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>`) without skipping levels.

---

## 10. Acceptance Criteria
- [ ] Typography renders sharply across Retina, 4K, and standard DPI displays.
- [ ] Contrast ratios for all text combinations meet or exceed 4.5:1.
- [ ] Mobile viewports under $400\text{px}$ width render without horizontal overflow scrolling.
- [ ] All interactive buttons and forms support full keyboard navigation (Tab, Enter, Space).
