import { insforge } from '../lib/insforge';

/**
 * Recommendation Service
 * Fetches real recommended writers from InsForge PostgreSQL 'profiles' table.
 * Excludes current user and users already followed.
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
      let followedIds = new Set();
      if (currentUserId) {
        const { data: followRows } = await insforge.database
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId);

        if (followRows) {
          followRows.forEach((r) => followedIds.add(r.following_id));
        }
      }

      // 2. Fetch profiles from PostgreSQL excluding current user
      let query = insforge.database
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      const { data: profiles, error } = await query;

      if (error) {
        console.error('Error fetching recommended writers:', error);
        return { recommendations: [], error };
      }

      // 3. Filter out writers who are already followed
      const recommendations = (profiles || [])
        .filter((profile) => !followedIds.has(profile.id))
        .slice(0, limit);

      return { recommendations, error: null };
    } catch (err) {
      console.error('RecommendationService error:', err);
      return { recommendations: [], error: err };
    }
  },
};
