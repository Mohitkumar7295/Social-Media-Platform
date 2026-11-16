import { insforge } from '../lib/insforge';

/**
 * Bookmark Service
 * Manages user reading lists / bookmarks connected to InsForge PostgreSQL 'bookmarks' table.
 * Enforces user isolation, published-only bookmarking, and duplicate prevention.
 */
export const bookmarkService = {
  /**
   * Check whether a post is bookmarked by a specific user.
   * @param {string|null} userId - Current authenticated user UUID
   * @param {string} postId - Post UUID
   * @returns {Promise<{ isBookmarked: boolean, error: any }>}
   */
  async isBookmarked(userId, postId) {
    if (!userId || !postId) return { isBookmarked: false, error: null };

    try {
      const { data, error } = await insforge.database
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) {
        return { isBookmarked: false, error };
      }

      return { isBookmarked: !!data, error: null };
    } catch (err) {
      return { isBookmarked: false, error: err };
    }
  },

  /**
   * Save an article to the user's bookmarks.
   * @param {string} userId - Authenticated user UUID
   * @param {string} postId - Target post UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async bookmarkPost(userId, postId) {
    if (!userId || !postId) {
      return {
        success: false,
        error: new Error('You must be signed in to save articles.'),
      };
    }

    try {
      // Defense-in-depth: Verify post exists and is published
      const { data: targetPost, error: postErr } = await insforge.database
        .from('posts')
        .select('id, status')
        .eq('id', postId)
        .maybeSingle();

      if (postErr || !targetPost) {
        return { success: false, error: new Error('Article not found.') };
      }

      if (targetPost.status !== 'published') {
        return { success: false, error: new Error('Cannot bookmark unpublished drafts.') };
      }

      const { error } = await insforge.database
        .from('bookmarks')
        .insert([
          {
            user_id: userId,
            post_id: postId,
          },
        ]);

      if (error) {
        // Handle duplicate gracefully (code 23505)
        if (error.code === '23505' || error.message?.includes('unique_user_post_bookmark')) {
          return { success: true, error: null };
        }
        console.error('bookmarkService.bookmarkPost error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('bookmarkService.bookmarkPost exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Remove an article from the user's bookmarks.
   * @param {string} userId - Authenticated user UUID
   * @param {string} postId - Target post UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async unbookmarkPost(userId, postId) {
    if (!userId || !postId) {
      return {
        success: false,
        error: new Error('You must be signed in to remove bookmarks.'),
      };
    }

    try {
      const { error } = await insforge.database
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        console.error('bookmarkService.unbookmarkPost error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('bookmarkService.unbookmarkPost exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Toggle bookmark state (save if not saved, remove if saved).
   * @param {string} userId - Authenticated user UUID
   * @param {string} postId - Target post UUID
   * @param {boolean} currentlyBookmarked - Current local state
   * @returns {Promise<{ isBookmarked: boolean, error: any }>}
   */
  async toggleBookmark(userId, postId, currentlyBookmarked) {
    if (!userId || !postId) {
      return {
        isBookmarked: currentlyBookmarked,
        error: new Error('Authentication required to save articles.'),
      };
    }

    try {
      let res;
      if (currentlyBookmarked) {
        res = await this.unbookmarkPost(userId, postId);
      } else {
        res = await this.bookmarkPost(userId, postId);
      }

      if (res.error) {
        return { isBookmarked: currentlyBookmarked, error: res.error };
      }

      return { isBookmarked: !currentlyBookmarked, error: null };
    } catch (err) {
      return { isBookmarked: currentlyBookmarked, error: err };
    }
  },

  /**
   * Get all saved articles for the authenticated user.
   * @param {string} userId - Authenticated user UUID
   * @param {Object} options
   * @param {number} options.page - Page index (1-based)
   * @param {number} options.limit - Max items per page
   * @returns {Promise<{ bookmarks: Array, total: number, error: any }>}
   */
  async getUserBookmarks(userId, { page = 1, limit = 20 } = {}) {
    if (!userId) return { bookmarks: [], total: 0, error: null };

    try {
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      const { data, count, error } = await insforge.database
        .from('bookmarks')
        .select('*, post:posts(*, author:profiles(*))', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (error) {
        console.error('bookmarkService.getUserBookmarks error:', error);
        return { bookmarks: [], total: 0, error };
      }

      // Filter out any bookmarks whose posts are no longer published or have been deleted
      const validBookmarks = (data || []).filter(
        (b) => b.post && b.post.status === 'published'
      );

      return {
        bookmarks: validBookmarks,
        total: count || validBookmarks.length,
        error: null,
      };
    } catch (err) {
      console.error('bookmarkService.getUserBookmarks exception:', err);
      return { bookmarks: [], total: 0, error: err };
    }
  },

  /**
   * Get a Set of all post IDs bookmarked by the user.
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<Set<string>>}
   */
  async getUserBookmarkedPostIds(userId) {
    if (!userId) return new Set();

    try {
      const { data, error } = await insforge.database
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId);

      if (error || !data) return new Set();
      return new Set(data.map((b) => b.post_id));
    } catch (err) {
      return new Set();
    }
  },
};
