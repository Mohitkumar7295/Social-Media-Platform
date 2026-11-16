# WriteSpace Testing & Verification Strategy 🧪

This document specifies the testing methodology, automated test suites, Row Level Security (RLS) isolation verification, and manual acceptance test plans for WriteSpace.

---

## 1. Multi-Tier Testing Strategy

```
           ▲
          / \     Tier 4: Production Smoke & Security Audit
         /   \    (Multi-account RLS validation & cross-device verification)
        /     \
       /       \   Tier 3: End-to-End User Journeys
      /         \  (Registration -> Draft -> Publish -> Social Interaction)
     /           \
    /             \ Tier 2: Component & Integration Tests
   /               \(Vitest / Testing Library: Cards, Editors, Forms, Hooks)
  /─────────────────\
 /   Tier 1: Unit    \ (Utilities: readingTime, slugify, date formatting)
/─────────────────────\
```

---

## 2. Row Level Security (RLS) Isolation Test Matrix

Because security in WriteSpace is enforced at the database level, RLS policies must be verified using **three distinct actor contexts**:
1. **Unauthenticated Visitor (Anon)**: No auth token.
2. **User A (Author)**: Authenticated with User A credentials.
3. **User B (Reader / Malicious Actor)**: Authenticated with User B credentials.

| Security Assertion | Actor Context | Executed Query | Expected Result | Pass/Fail |
|---|---|---|---|---|
| **Public Post Visibility** | Unauthenticated | `SELECT * FROM posts WHERE status='published'` | Returns all published posts | Verified |
| **Draft Post Isolation** | User B (Reader) | `SELECT * FROM posts WHERE id = '<User A Draft ID>'` | Returns 0 rows (404) | Verified |
| **Draft Post Self-Access** | User A (Author) | `SELECT * FROM posts WHERE id = '<User A Draft ID>'` | Returns draft row successfully | Verified |
| **Bookmark Privacy** | User B (Reader) | `SELECT * FROM bookmarks WHERE user_id = '<User A ID>'` | Returns 0 rows (Denied) | Verified |
| **Bookmark Self-Access** | User A (Author) | `SELECT * FROM bookmarks WHERE user_id = '<User A ID>'` | Returns User A's bookmarks | Verified |
| **Unauthorized Post Update** | User B | `UPDATE posts SET title='Hacked' WHERE id = '<User A Post>'` | 0 rows affected (Denied) | Verified |
| **Authorized Post Update** | User A | `UPDATE posts SET title='New' WHERE id = '<User A Post>'` | 1 row updated | Verified |
| **Duplicate Like Prevention** | User A | `INSERT INTO likes` twice for same `post_id` | Unique constraint violation | Verified |
| **Self-Follow Prevention** | User A | `INSERT INTO follows (follower_id, following_id) VALUES (A, A)` | Check constraint violation | Verified |
| **Duplicate Follow Prevention**| User A | `INSERT INTO follows (A, B)` twice | Unique constraint violation | Verified |
| **Unauthorized Comment Deletion**| User B | `DELETE FROM comments WHERE id = '<User A Comment>'` | 0 rows affected (Denied) | Verified |

---

## 3. Unit & Utility Testing Suite

Located in `src/utils/__tests__/`:

### 3.1 `readingTime.test.js`
- Calculates 1 minute for texts with < 200 words.
- Correctly calculates 5 minutes for 1,000 words.
- Handles empty or null strings gracefully without throwing errors.

### 3.2 `slugify.test.js`
- Converts `"How to Build Modern Web Apps in 2026!"` into `"how-to-build-modern-web-apps-in-2026"`.
- Strips punctuation, special characters, and multiple consecutive hyphens.
- Handles unicode and accent characters predictably.

---

## 4. Frontend Component & Hook Tests

### 4.1 `ArticleCard.test.jsx`
- Renders author avatar, author full name, and publication date.
- Displays article title and truncated summary.
- Shows reading time badge and engagement counters.
- Executes bookmark and like callbacks on user click.

### 4.2 `AuthContext.test.jsx`
- Initializes with `loading: true` and resolves to authenticated user when session exists.
- Clears user profile upon `signOut()` call.

### 4.3 `CommentSection.test.jsx`
- Renders existing comments list.
- Disables comment submission when input is whitespace-only.
- Dispatches comment submission to `commentService.addComment` upon click.

---

## 6. Phase 3 Authenticated Home Feed Integration Verification

Executed via `scripts/test-phase3.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | PostgreSQL `profiles` table | Verify `profiles` table accessibility and query execution | Returned profile records | **PASSED** |
| **Test 2** | PostgreSQL `follows` table | Verify `follows` table accessibility and RLS read policy | Returned follows records | **PASSED** |
| **Test 3** | `recommendationService` | Verify recommendations query strictly excludes `currentUserId` | Excluded self ID correctly | **PASSED** |
| **Test 4** | `subscriptionService` | Verify followed user resolution through `follows` table | Query executed without error | **PASSED** |
| **Test 5** | `feedService` | Verify feed handles empty or unmigrated `posts` table without crashing | Returned clean empty feed object | **PASSED** |

---

## 7. Phase 4 Article Writing & Publishing Integration Verification

Executed via `scripts/test-phase4.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | PostgreSQL `posts` table | Verify `posts` table schema and RLS query policies | Table verified | **PASSED** |
| **Test 2** | `postService.createPost` | Create draft article with title, subtitle, slug, content | Created draft record | **PASSED** |
| **Test 3** | `postService.getPostBySlug` | Fetch article by unique slug with author profile relation joined | Author relation joined | **PASSED** |
| **Test 4** | `postService.publishPost` | Update status to `published` with `published_at` timestamp | Status updated to published | **PASSED** |
| **Test 5** | `feedService.getForYouFeed` | Query global social feed to verify newly published story appears | Story retrieved in feed query | **PASSED** |
| **Test 6** | `postService.unpublishPost` & `deletePost` | Revert to draft status and cleanly delete test record | Record deleted cleanly | **PASSED** |

Execution Summary:
- **6 of 6 tests passed with 0 errors**.
- Build: `npm run build` completed with exit code 0.
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Phase 5 Test Suite Results (Professional Article Reading Experience)
Executed via `scripts/test-phase5.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | `editorUtils.estimateReadingTime` | Verify dynamic reading time calculation algorithm based on ~200 WPM | Accurately calculated reading minutes | **PASSED** |
| **Test 2** | `ArticleRenderer` & DOMPurify | Verify strict sanitization stripping malicious `<script>` and `onerror` XSS payloads | Stripped scripts and invalid event handlers | **PASSED** |
| **Test 3** | `postService.createPost` | Create test article with headings and HTML content in PostgreSQL | Created test record in `posts` table | **PASSED** |
| **Test 4** | `postService.getPostBySlug` | Verify anonymous public accessibility to published article at `/p/:slug` | Anonymous reader fetched article successfully | **PASSED** |
| **Test 5** | Draft Privacy Isolation | Verify unpublished/draft articles return 404/rejection to unauthenticated readers | Draft access denied to anonymous request | **PASSED** |
| **Test 6** | `postService.getRelatedPosts` | Query real published related stories excluding current post ID | Returned related stories matching category | **PASSED** |

Execution Summary:
- **6 of 6 integration tests passed with 0 errors**.
- Build: `npm run build` completed successfully (exit code 0).
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Phase 6 Test Suite Results (Likes, Comments, Replies and Social Interactions)
Executed via `scripts/test-phase6.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | `likeService.likePost` | User A likes published article; verify record created in `likes` table | Like created, count = 1 | **PASSED** |
| **Test 2** | Database Unique Constraint | Duplicate like attempt by User A on same article | Rejected by `unique_post_user_like` | **PASSED** |
| **Test 3** | `likeService.unlikePost` | User A unlikes article; verify record deleted and count reverted to 0 | Record removed, count = 0 | **PASSED** |
| **Test 4** | User State Isolation | User B likes article; verify independent like state (User B liked, User A not liked) | States properly isolated | **PASSED** |
| **Test 5** | `commentService.createComment` | User A adds top-level response; verify record and profile join | Comment saved, author joined | **PASSED** |
| **Test 6** | `commentService.createComment` | User B replies to User A; verify `parent_id` linked and total count = 2 | Reply nested under parent | **PASSED** |
| **Test 7** | `commentService.updateComment` | User A edits own response; verify content and updated timestamp | Content updated in PostgreSQL | **PASSED** |
| **Test 8** | RLS / Authorization | User B attempts to edit User A's response; verify modification denied | Unauthorized modification blocked | **PASSED** |
| **Test 9** | `commentService.deleteComment` | User B deletes own reply; verify record removed and total count = 1 | Reply deleted cleanly, count = 1 | **PASSED** |
| **Test 10** | Draft Protection | Non-author attempt to interact with unpublished private drafts | Blocked by draft status check | **PASSED** |
| **Test 11** | Database Content Constraint | Empty/whitespace-only comment submission | Rejected by PostgreSQL check constraint | **PASSED** |

Execution Summary:
- **11 of 11 integration tests passed with 0 errors**.
- Regression tests for Phase 3 (5/5), Phase 4 (6/6), Phase 5 (6/6) all passed with 0 errors.
- Build: `npm run build` completed successfully (exit code 0).
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Phase 7 Test Suite Results (Follow/Unfollow and Personalized Feeds)
Executed via `scripts/test-phase7.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | `followService.followUser` | User A follows User B; verify record created in `follows` table | Follow created, follower count = 1 | **PASSED** |
| **Test 2** | Database Check Constraint | Self-follow attempt (User A follows User A) | Rejected by `check_not_self_follow` | **PASSED** |
| **Test 3** | Database Unique Constraint | Duplicate follow attempt (User A follows User B again) | Rejected by `unique_follower_following` | **PASSED** |
| **Test 4** | `followService.getFollowers/Following` | Verify followers and following lists join user profile relations | Author profiles linked correctly | **PASSED** |
| **Test 5** | `recommendationService.getRecommendedWriters` | Verify recommended writers exclude authors already followed | Followed creator filtered out | **PASSED** |
| **Test 6** | `feedService.getFollowingFeed` | Following feed query returns published stories by followed creators | Story retrieved in following feed | **PASSED** |
| **Test 7** | Draft Isolation | Unpublished drafts query test across global feeds | Drafts excluded from feeds | **PASSED** |
| **Test 8** | `followService.unfollowUser` | User A unfollows User B; verify record removed and count returns to 0 | Record deleted, count = 0 | **PASSED** |
| **Test 9** | `feedService.getFollowingFeed` | Following feed query after unfollow confirms stories removed | Empty following stream returned | **PASSED** |

Execution Summary:
- **9 of 9 integration tests passed with 0 errors**.
- Full regression suite for Phases 3–6 (28 tests total) all passed with 0 errors.
- Build: `npm run build` completed successfully (exit code 0).
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Phase 8 Test Suite Results (Search, Explore, and Bookmarks)
Executed via `scripts/test-phase8.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | `searchService.searchArticles` | Search published story by keyword; verify title match and joined author details | Article found with author profile | **PASSED** |
| **Test 2** | `searchService.searchWriters` | Search writer profile by full name / username | Writer profiles found accurately | **PASSED** |
| **Test 3** | Draft Isolation in Search | Search query testing unpublished draft keywords | Drafts strictly excluded from results | **PASSED** |
| **Test 4** | `bookmarkService.bookmarkPost` | Insert bookmark record into PostgreSQL `public.bookmarks` | Record created with user & post IDs | **PASSED** |
| **Test 5** | Database Unique Constraint | Duplicate bookmark insertion attempt on same post | Rejected by `unique_user_post_bookmark` | **PASSED** |
| **Test 6** | `bookmarkService.getUserBookmarks` | Fetch saved articles with joined post and author profiles | Reading list retrieved with metadata | **PASSED** |
| **Test 7** | `bookmarkService.unbookmarkPost` | Delete bookmark record from `public.bookmarks` | Record deleted, reading list empty | **PASSED** |
| **Test 8** | Category Filtering | Filter published stories by category on Explore | Accurate category subset returned | **PASSED** |
| **Test 9** | Draft Bookmark Prevention | Attempt to bookmark an unpublished draft | Blocked / guarded by status rule | **PASSED** |
| **Test 10** | Schema Authentication Guard | Anonymous / null user bookmark attempt | Rejected by database NOT NULL constraint | **PASSED** |

Execution Summary:
- **10 of 10 integration tests passed with 0 errors**.
- Full regression suite for Phases 3–7 (37 tests total) all passed with 0 errors.
- Build: `npm run build` completed successfully (exit code 0).
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Phase 9 Test Suite Results (Notifications System & Writer Dashboard)
Executed via `scripts/test-phase9.mjs`:

| Test # | Target Module | Test Description | Result | Status |
|---|---|---|---|---|
| **Test 1** | `followService.followUser` | User B follows User A; verify follow notification created in PostgreSQL | Record created for User A with actor User B | **PASSED** |
| **Test 2** | `likeService.likePost` | User B likes User A's article; verify like notification created with post ID | Record created with post_id reference | **PASSED** |
| **Test 3** | `commentService.createComment` | User B comments on story; verify comment notification created for author | Record created with comment and post IDs | **PASSED** |
| **Test 4** | Comment Reply Notifications | User A replies to User B's comment; verify notification sent to User B | Reply notification routed to comment author | **PASSED** |
| **Test 5** | Database Check Constraint | Self-notification attempt (User A notifies User A) | Rejected by `check_no_self_notification` | **PASSED** |
| **Test 6** | `notificationService.getNotifications` | Fetch notifications stream with joined actor and post metadata | Resolved with username, full_name, and story | **PASSED** |
| **Test 7** | `notificationService.markAsRead` | Mark single notification as read; verify `is_read = true` in PostgreSQL | Notification status updated | **PASSED** |
| **Test 8** | `notificationService.markAllAsRead` | Mark all notifications as read; verify unread counter returns to 0 | All alerts marked; unread count = 0 | **PASSED** |
| **Test 9** | `dashboardService.getOverviewStats` | Verify published, draft, and follower counts match database records | Real metrics verified against schema | **PASSED** |
| **Test 10** | Engagement Aggregates | Verify aggregate likes and comments across author's articles | Real engagement sums computed accurately | **PASSED** |

Execution Summary:
- **10 of 10 integration tests passed with 0 errors**.
- Full regression suite for Phases 3–8 (47 tests total) all passed with 0 errors.
- Build: `npm run build` completed successfully (exit code 0).
- Production Deployment: Live on `https://u9367zk9.insforge.site`.

### Test Scenario: Complete Publishing & Engagement Lifecycle
1. **Account Registration**:
   - Navigate to `/register`.
   - Complete form with new credentials (`writer1@example.com`, username `@writer1`).
   - Expect automatic redirect to `/` with navbar showing user avatar.
2. **Drafting a Story**:
   - Navigate to `/new-story`.
   - Enter title `"The Future of Social Publishing"` and markdown content.
   - Click "Save Draft".
   - Verify story appears under `/dashboard` -> "Drafts" tab.
3. **Publishing**:
   - Open draft, click "Publish".
   - Verify story status updates to `published` and opens at `/story/the-future-of-social-publishing`.
4. **Reader Interaction**:
   - Log out, sign in as `reader1@example.com`.
   - Navigate to `/story/the-future-of-social-publishing`.
   - Click "Like" (counter increments from 0 to 1).
   - Enter comment `"Insightful article!"` and submit (comment appears in stream).
   - Click "Follow" on author card (button toggles to "Following").
   - Click "Bookmark" (story added to `/bookmarks`).
5. **Feed Verification**:
   - Navigate to `/following`.
   - Verify `"The Future of Social Publishing"` is listed in the chronological feed.
