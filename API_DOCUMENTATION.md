# WriteSpace API & SDK Integration Documentation 🔌

This document details the interface contracts, method signatures, parameters, and error handling for the `@insforge/sdk` client layer within WriteSpace.

---

## 1. Client Initialization

The SDK client is centralized in `src/lib/insforge.js`:

```javascript
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});
```

All application services import `insforge` from this module.

---

## 2. Authentication API (`src/services/authService.js`)

Wraps `insforge.auth` for user session management.

### 2.1 Sign Up
```javascript
/**
 * Registers a new user account and triggers profile creation.
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @param {string} fullName
 * @returns {Promise<{ user, session, error }>}
 */
export async function signUp({ email, password, username, fullName }) {
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName }
    }
  });
  return { user: data?.user, session: data?.session, error };
}
```

### 2.2 Sign In with Password
```javascript
/**
 * Authenticates user credentials and establishes a session.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, session, error }>}
 */
export async function signIn({ email, password }) {
  const { data, error } = await insforge.auth.signInWithPassword({
    email,
    password
  });
  return { user: data?.user, session: data?.session, error };
}
```

### 2.3 Sign Out
```javascript
/**
 * Terminates the active session and purges local JWT tokens.
 * @returns {Promise<{ error }>}
 */
export async function signOut() {
  const { error } = await insforge.auth.signOut();
  return { error };
}
```

### 2.4 Get Current User & Session
```javascript
/**
 * Retrieves the active authenticated user record.
 * @returns {Promise<{ user, error }>}
 */
export async function getCurrentUser() {
  const { data, error } = await insforge.auth.getUser();
  return { user: data?.user, error };
}
```

---

## 3. Profile API (`src/services/profileService.js`)

Manages author biographical details and social stats.

### 3.1 Fetch Profile by Username
```javascript
export async function getProfileByUsername(username) {
  const { data, error } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return { profile: data, error };
}
```

### 3.2 Update User Profile
```javascript
export async function updateProfile(userId, updates) {
  const { data, error } = await insforge.database
    .from('profiles')
    .update({
      full_name: updates.fullName,
      bio: updates.bio,
      avatar_url: updates.avatarUrl,
      website: updates.website,
    })
    .eq('id', userId)
    .select()
    .single();
  return { profile: data, error };
}
```

---

## 4. Posts & Articles API (`src/services/postService.js`)

Handles creation, retrieval, updates, and feed aggregation.

### 4.1 Fetch Published Feed (Home / Explore)
```javascript
export async function fetchPublishedPosts({ categorySlug = null, limit = 10, offset = 0 } = {}) {
  let query = insforge.database
    .from('posts')
    .select(`
      id, title, slug, subtitle, cover_image_url, reading_time,
      likes_count, comments_count, published_at,
      profiles:author_id (id, username, full_name, avatar_url),
      categories:category_id (name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug);
  }

  const { data, error } = await query;
  return { posts: data || [], error };
}
```

### 4.2 Fetch Single Article by Slug
```javascript
export async function fetchPostBySlug(slug) {
  const { data, error } = await insforge.database
    .from('posts')
    .select(`
      *,
      profiles:author_id (id, username, full_name, avatar_url, bio),
      categories:category_id (id, name, slug)
    `)
    .eq('slug', slug)
    .single();
  return { post: data, error };
}
```

### 4.3 Create Story / Draft
```javascript
export async function createPost(postData) {
  const { data, error } = await insforge.database
    .from('posts')
    .insert({
      author_id: postData.authorId,
      category_id: postData.categoryId || null,
      title: postData.title,
      slug: postData.slug,
      subtitle: postData.subtitle,
      content: postData.content,
      cover_image_url: postData.coverImageUrl,
      reading_time: postData.readingTime,
      status: postData.status || 'draft',
      published_at: postData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  return { post: data, error };
}
```

### 4.4 Update Story
```javascript
export async function updatePost(postId, updates) {
  const { data, error } = await insforge.database
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  return { post: data, error };
}
```

### 4.5 Delete Story
```javascript
export async function deletePost(postId) {
  const { error } = await insforge.database
    .from('posts')
    .delete()
    .eq('id', postId);
  return { error };
}
```

---

## 5. Comments API (`src/services/commentService.js`)

### 5.1 Fetch Comments for an Article
```javascript
export async function fetchComments(postId) {
  const { data, error } = await insforge.database
    .from('comments')
    .select(`
      id, content, created_at, parent_id,
      profiles:author_id (id, username, full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  return { comments: data || [], error };
}
```

### 5.2 Add Comment
```javascript
export async function addComment({ postId, authorId, content, parentId = null }) {
  const { data, error } = await insforge.database
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      parent_id: parentId,
    })
    .select(`
      id, content, created_at, parent_id,
      profiles:author_id (id, username, full_name, avatar_url)
    `)
    .single();
  return { comment: data, error };
}
```

---

## 6. Social Interaction API (`src/services/socialService.js`)

### 6.1 Like & Unlike Post
```javascript
export async function toggleLike(postId, userId, isLiked) {
  if (isLiked) {
    const { error } = await insforge.database
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return { liked: false, error };
  } else {
    const { error } = await insforge.database
      .from('likes')
      .insert({ post_id: postId, user_id: userId });
    return { liked: true, error };
  }
}
```

### 6.2 Follow & Unfollow Author
```javascript
export async function toggleFollow(followerId, followingId, isFollowing) {
  if (isFollowing) {
    const { error } = await insforge.database
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { following: false, error };
  } else {
    const { error } = await insforge.database
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return { following: true, error };
  }
}
```

### 6.3 Bookmarking
```javascript
export async function toggleBookmark(postId, userId, isBookmarked) {
  if (isBookmarked) {
    const { error } = await insforge.database
      .from('bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return { bookmarked: false, error };
  } else {
    const { error } = await insforge.database
      .from('bookmarks')
      .insert({ post_id: postId, user_id: userId });
    return { bookmarked: true, error };
  }
}
```

---

## 7. Storage API (`src/services/storageService.js`)

Manages file uploads to InsForge S3 storage buckets.

```javascript
/**
 * Uploads an image file to the designated bucket and returns public URL.
 * @param {'avatars'|'covers'} bucket
 * @param {string} filePath
 * @param {File} file
 * @returns {Promise<{ publicUrl, error }>}
 */
export async function uploadImage(bucket, filePath, file) {
  const { error: uploadError } = await insforge.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { publicUrl: null, error: uploadError };

  const { data } = insforge.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { publicUrl: data?.publicUrl, error: null };
}
```
