import { insforge } from '../lib/insforge';

/**
 * Feed Service
 * Prepares the feed query architecture for Phase 4 articles and posts.
 * Queries real posts from PostgreSQL if the table exists, and handles empty states cleanly.
 */
export const feedService = {
  /**
   * Fetch "For You" global feed of published articles/posts.
   * @param {Object} options
   * @param {number} options.page - Page index (1-based)
   * @param {number} options.limit - Posts per page
   * @returns {Promise<{ posts: Array, total: number, error: any }>}
   */
  async getForYouFeed({ page = 1, limit = 10 } = {}) {
    try {
      // Safe query on posts/articles table if present in PostgreSQL
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      const { data, count, error } = await insforge.database
        .from('posts')
        .select('*, author:profiles(*)', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (error) {
        // Table does not exist yet (scheduled for Phase 4) or empty
        // Return clean empty feed without failing the UI
        return { posts: [], total: 0, error: null };
      }

      return { posts: data || [], total: count || 0, error: null };
    } catch (err) {
      // Graceful fallback for Phase 3 when posts table is not yet migrated
      return { posts: [], total: 0, error: null };
    }
  },

  /**
   * Fetch "Following" feed of articles published by authors the user follows.
   * @param {Object} options
   * @param {string} options.currentUserId - Authenticated user UUID
   * @param {number} options.page - Page index (1-based)
   * @param {number} options.limit - Posts per page
   * @returns {Promise<{ posts: Array, total: number, error: any }>}
   */
  async getFollowingFeed({ currentUserId, page = 1, limit = 10 } = {}) {
    if (!currentUserId) {
      return { posts: [], total: 0, error: null };
    }

    try {
      // 1. Fetch followed writer IDs from 'follows' table
      const { data: followRows, error: followError } = await insforge.database
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followError || !followRows || followRows.length === 0) {
        return { posts: [], total: 0, error: null };
      }

      const authorIds = followRows.map((r) => r.following_id);
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      // 2. Query posts published by those followed authors
      const { data, count, error } = await insforge.database
        .from('posts')
        .select('*, author:profiles(*)', { count: 'exact' })
        .in('author_id', authorIds)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (error) {
        return { posts: [], total: 0, error: null };
      }

      return { posts: data || [], total: count || 0, error: null };
    } catch (err) {
      return { posts: [], total: 0, error: null };
    }
  },
};
