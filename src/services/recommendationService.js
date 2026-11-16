import { insforge } from '../lib/insforge';

/**
 * Recommendation Service
 * Fetches real recommended writers from InsForge PostgreSQL 'profiles' table.
 * Excludes current user and users already followed.
 * Prioritizes writers who have published articles.
 */
export const recommendationService = {
  /**
   * Get recommended writers to follow.
   * @param {string} currentUserId - The authenticated user's UUID
   * @param {number} limit - Maximum recommendations to return (default 5)
   * @returns {Promise<{ recommendations: Array, error: any }>}
   */
  async getRecommendedWriters(currentUserId, limit = 5) {
    try {
      // 1. Fetch IDs of writers the user already follows
      const followedIds = new Set();
      if (currentUserId) {
        const { data: followRows } = await insforge.database
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId);

        if (followRows) {
          followRows.forEach((r) => followedIds.add(r.following_id));
        }
      }

      // 2. Fetch distinct authors who have published stories to prioritize them
      const publishedAuthorIds = new Set();
      try {
        const { data: publishedPosts } = await insforge.database
          .from('posts')
          .select('author_id')
          .eq('status', 'published')
          .limit(50);

        if (publishedPosts) {
          publishedPosts.forEach((p) => publishedAuthorIds.add(p.author_id));
        }
      } catch (postErr) {
        // Non-blocking fallback if posts query fails
      }

      // 3. Fetch candidate profiles from PostgreSQL
      let query = insforge.database
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      const { data: profiles, error } = await query;

      if (error) {
        console.error('Error fetching recommended writers:', error);
        return { recommendations: [], error };
      }

      // 4. Filter out writers who are already followed
      const candidates = (profiles || []).filter((profile) => !followedIds.has(profile.id));

      // 5. Sort candidates: prioritize writers with published articles first
      candidates.sort((a, b) => {
        const aHasStories = publishedAuthorIds.has(a.id) ? 1 : 0;
        const bHasStories = publishedAuthorIds.has(b.id) ? 1 : 0;
        return bHasStories - aHasStories;
      });

      const recommendations = candidates.slice(0, limit);

      return { recommendations, error: null };
    } catch (err) {
      console.error('RecommendationService error:', err);
      return { recommendations: [], error: err };
    }
  },
};
