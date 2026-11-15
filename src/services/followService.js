import { insforge } from '../lib/insforge';

/**
 * Follow Service handling social graph relations and count calculations.
 */
export const followService = {
  /**
   * Get real followers and following counts for a profile from PostgreSQL.
   */
  async getFollowCounts(profileId) {
    try {
      // 1. Query followers count (where following_id = profileId)
      const { count: followersCount, error: followersError } = await insforge.database
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);

      // 2. Query following count (where follower_id = profileId)
      const { count: followingCount, error: followingError } = await insforge.database
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      return {
        followersCount: followersError ? 0 : followersCount || 0,
        followingCount: followingError ? 0 : followingCount || 0,
        error: followersError || followingError || null,
      };
    } catch (err) {
      return { followersCount: 0, followingCount: 0, error: err };
    }
  },
};
