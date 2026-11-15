import { insforge } from '../lib/insforge';

/**
 * Subscription Service
 * Manages followed writers and publication subscriptions using real InsForge PostgreSQL tables.
 */
export const subscriptionService = {
  /**
   * Get all writers the current user follows.
   * Joins follows -> profiles in PostgreSQL.
   * @param {string} userId - Current authenticated user UUID
   * @returns {Promise<{ subscriptions: Array, error: any }>}
   */
  async getSubscriptions(userId) {
    if (!userId) {
      return { subscriptions: [], error: null };
    }

    try {
      // 1. Fetch followed user IDs from 'follows' table
      const { data: followRows, error: followError } = await insforge.database
        .from('follows')
        .select('following_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (followError) {
        console.error('Error fetching follows:', followError);
        return { subscriptions: [], error: followError };
      }

      if (!followRows || followRows.length === 0) {
        return { subscriptions: [], error: null };
      }

      const followingIds = followRows.map((row) => row.following_id);

      // 2. Fetch profiles of those followed users
      const { data: profiles, error: profileError } = await insforge.database
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .in('id', followingIds);

      if (profileError) {
        console.error('Error fetching subscription profiles:', profileError);
        return { subscriptions: [], error: profileError };
      }

      // Merge following date with profile
      const subscriptions = (profiles || []).map((prof) => {
        const followMeta = followRows.find((f) => f.following_id === prof.id);
        return {
          ...prof,
          followedAt: followMeta?.created_at || null,
        };
      });

      return { subscriptions, error: null };
    } catch (err) {
      console.error('SubscriptionService error:', err);
      return { subscriptions: [], error: err };
    }
  },

  /**
   * Check if the authenticated user follows a specific target user.
   * @param {string} followerId - Current user UUID
   * @param {string} targetUserId - Target profile UUID
   */
  async isFollowing(followerId, targetUserId) {
    if (!followerId || !targetUserId) {
      return { isFollowing: false, error: null };
    }

    try {
      const { data, error } = await insforge.database
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) return { isFollowing: false, error };
      return { isFollowing: !!data, error: null };
    } catch (err) {
      return { isFollowing: false, error: err };
    }
  },
};
