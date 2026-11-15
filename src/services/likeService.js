import { insforge } from '../lib/insforge';

/**
 * Like Service
 * Manages article applauds/likes connected directly to InsForge PostgreSQL 'likes' table.
 * Enforces one like per user per article with RLS.
 */
export const likeService = {
  /**
   * Get the exact total count of likes for a post.
   * @param {string} postId - Post UUID
   * @returns {Promise<{ count: number, error: any }>}
   */
  async getLikesCount(postId) {
    if (!postId) return { count: 0, error: null };
    try {
      const { count, error } = await insforge.database
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('likeService.getLikesCount error:', error);
        return { count: 0, error };
      }
      return { count: count || 0, error: null };
    } catch (err) {
      console.error('likeService.getLikesCount exception:', err);
      return { count: 0, error: err };
    }
  },

  /**
   * Check if a specific user has liked a post.
   * @param {string} postId - Post UUID
   * @param {string|null} userId - Current authenticated user UUID
   * @returns {Promise<{ liked: boolean, error: any }>}
   */
  async hasUserLiked(postId, userId) {
    if (!postId || !userId) return { liked: false, error: null };
    try {
      const { data, error } = await insforge.database
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return { liked: false, error };
      }
      return { liked: !!data, error: null };
    } catch (err) {
      return { liked: false, error: err };
    }
  },

  /**
   * Fetch both the like count and the current user's liked status in parallel.
   * @param {string} postId - Post UUID
   * @param {string|null} userId - Current authenticated user UUID
   * @returns {Promise<{ count: number, liked: boolean, error: any }>}
   */
  async getLikeState(postId, userId = null) {
    if (!postId) return { count: 0, liked: false, error: null };

    try {
      const [countRes, likedRes] = await Promise.all([
        this.getLikesCount(postId),
        this.hasUserLiked(postId, userId),
      ]);

      return {
        count: countRes.count || 0,
        liked: likedRes.liked || false,
        error: countRes.error || likedRes.error || null,
      };
    } catch (err) {
      return { count: 0, liked: false, error: err };
    }
  },

  /**
   * Like a post.
   * Inserts a record into the 'likes' table.
   * @param {string} postId - Post UUID
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async likePost(postId, userId) {
    if (!postId || !userId) {
      return { success: false, error: new Error('Missing post ID or user authentication') };
    }

    try {
      // Defense-in-depth: Verify post exists and is published (or author liking own post)
      const { data: targetPost, error: postCheckErr } = await insforge.database
        .from('posts')
        .select('id, status, author_id')
        .eq('id', postId)
        .maybeSingle();

      if (postCheckErr || !targetPost) {
        return { success: false, error: new Error('Article not found.') };
      }

      if (targetPost.status !== 'published' && targetPost.author_id !== userId) {
        return { success: false, error: new Error('Cannot applaud an unpublished draft.') };
      }

      const { data, error } = await insforge.database
        .from('likes')
        .insert([
          {
            post_id: postId,
            user_id: userId,
          },
        ])
        .select('id')
        .maybeSingle();

      if (error) {
        // If already liked (duplicate key violation code 23505), treat as successful like
        if (error.code === '23505' || error.message?.includes('unique_post_user_like')) {
          return { success: true, error: null };
        }
        console.error('likeService.likePost error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('likeService.likePost exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Unlike a post.
   * Deletes the user's like from the 'likes' table.
   * @param {string} postId - Post UUID
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async unlikePost(postId, userId) {
    if (!postId || !userId) {
      return { success: false, error: new Error('Missing post ID or user authentication') };
    }

    try {
      const { error } = await insforge.database
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error('likeService.unlikePost error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('likeService.unlikePost exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Toggle like state (like if not liked, unlike if liked).
   * Calculates new count and returns updated state.
   * @param {string} postId - Post UUID
   * @param {string} userId - Authenticated user UUID
   * @param {boolean} currentlyLiked - Current local liked state
   * @returns {Promise<{ liked: boolean, count: number, error: any }>}
   */
  async toggleLike(postId, userId, currentlyLiked) {
    if (!postId || !userId) {
      return {
        liked: currentlyLiked,
        count: 0,
        error: new Error('Authentication required to like an article'),
      };
    }

    try {
      let opSuccess = false;
      let opError = null;

      if (currentlyLiked) {
        const res = await this.unlikePost(postId, userId);
        opSuccess = res.success;
        opError = res.error;
      } else {
        const res = await this.likePost(postId, userId);
        opSuccess = res.success;
        opError = res.error;
      }

      if (!opSuccess && opError) {
        return { liked: currentlyLiked, count: 0, error: opError };
      }

      // Re-fetch accurate count from DB
      const { count } = await this.getLikesCount(postId);

      return {
        liked: !currentlyLiked,
        count: count,
        error: null,
      };
    } catch (err) {
      return { liked: currentlyLiked, count: 0, error: err };
    }
  },
};
