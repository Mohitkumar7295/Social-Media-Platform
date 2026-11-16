import { insforge } from '../lib/insforge';
import { notificationService } from './notificationService';

/**
 * Follow Service
 * Manages social graph relationships (following, followers, and counters)
 * connected directly to InsForge PostgreSQL 'follows' table.
 */
export const followService = {
  /**
   * Get real followers and following counts for a profile from PostgreSQL.
   * @param {string} profileId - User UUID
   * @returns {Promise<{ followersCount: number, followingCount: number, error: any }>}
   */
  async getFollowCounts(profileId) {
    if (!profileId) {
      return { followersCount: 0, followingCount: 0, error: null };
    }

    try {
      // 1. Query followers count (who follows this profile)
      const { count: followersCount, error: followersError } = await insforge.database
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', profileId);

      // 2. Query following count (who this profile follows)
      const { count: followingCount, error: followingError } = await insforge.database
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      return {
        followersCount: followersError ? 0 : followersCount || 0,
        followingCount: followingError ? 0 : followingCount || 0,
        error: followersError || followingError || null,
      };
    } catch (err) {
      console.error('followService.getFollowCounts exception:', err);
      return { followersCount: 0, followingCount: 0, error: err };
    }
  },

  /**
   * Check whether followerId is currently following followingId.
   * @param {string} followerId - Current authenticated user UUID
   * @param {string} followingId - Target user UUID
   * @returns {Promise<{ isFollowing: boolean, error: any }>}
   */
  async isFollowing(followerId, followingId) {
    if (!followerId || !followingId || followerId === followingId) {
      return { isFollowing: false, error: null };
    }

    try {
      const { data, error } = await insforge.database
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (error) {
        return { isFollowing: false, error };
      }

      return { isFollowing: !!data, error: null };
    } catch (err) {
      return { isFollowing: false, error: err };
    }
  },

  /**
   * Follow a user.
   * @param {string} followerId - Authenticated user UUID
   * @param {string} followingId - Target user UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async followUser(followerId, followingId) {
    if (!followerId || !followingId) {
      return {
        success: false,
        error: new Error('You must be signed in to follow writers.'),
      };
    }

    if (followerId === followingId) {
      return {
        success: false,
        error: new Error('You cannot follow yourself.'),
      };
    }

    try {
      const { error } = await insforge.database
        .from('follows')
        .insert([
          {
            follower_id: followerId,
            following_id: followingId,
          },
        ]);

      if (error) {
        // If already following (unique violation code 23505), treat as success
        if (error.code === '23505' || error.message?.includes('unique_follower_following')) {
          return { success: true, error: null };
        }
        console.error('followService.followUser error:', error);
        return { success: false, error };
      }

      // Generate follow notification for recipient
      notificationService
        .createNotification({
          recipientId: followingId,
          actorId: followerId,
          type: 'follow',
        })
        .catch((nErr) => console.warn('Could not create follow notification:', nErr));

      return { success: true, error: null };
    } catch (err) {
      console.error('followService.followUser exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Unfollow a user.
   * @param {string} followerId - Authenticated user UUID
   * @param {string} followingId - Target user UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async unfollowUser(followerId, followingId) {
    if (!followerId || !followingId) {
      return {
        success: false,
        error: new Error('You must be signed in to unfollow writers.'),
      };
    }

    try {
      const { error } = await insforge.database
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        console.error('followService.unfollowUser error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('followService.unfollowUser exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Toggle follow state (follow if not following, unfollow if following).
   * Automatically refreshes target follower counts after operation.
   * @param {string} followerId - Authenticated user UUID
   * @param {string} followingId - Target user UUID
   * @param {boolean} currentlyFollowing - Current local follow status
   * @returns {Promise<{ isFollowing: boolean, followersCount: number, error: any }>}
   */
  async toggleFollow(followerId, followingId, currentlyFollowing) {
    if (!followerId || !followingId) {
      return {
        isFollowing: currentlyFollowing,
        followersCount: 0,
        error: new Error('Authentication required to follow a user.'),
      };
    }

    if (followerId === followingId) {
      return {
        isFollowing: false,
        followersCount: 0,
        error: new Error('You cannot follow yourself.'),
      };
    }

    try {
      let res;
      if (currentlyFollowing) {
        res = await this.unfollowUser(followerId, followingId);
      } else {
        res = await this.followUser(followerId, followingId);
      }

      if (res.error) {
        return {
          isFollowing: currentlyFollowing,
          followersCount: 0,
          error: res.error,
        };
      }

      // Re-fetch updated counts
      const counts = await this.getFollowCounts(followingId);

      return {
        isFollowing: !currentlyFollowing,
        followersCount: counts.followersCount,
        error: null,
      };
    } catch (err) {
      return {
        isFollowing: currentlyFollowing,
        followersCount: 0,
        error: err,
      };
    }
  },

  /**
   * Get list of followers for a profile (users who follow this profile).
   * @param {string} profileId - Target profile UUID
   * @param {Object} options
   * @param {number} options.page - Page index (1-based)
   * @param {number} options.limit - Max items per page
   * @returns {Promise<{ followers: Array, total: number, error: any }>}
   */
  async getFollowers(profileId, { page = 1, limit = 20 } = {}) {
    if (!profileId) return { followers: [], total: 0, error: null };

    try {
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      const { data, count, error } = await insforge.database
        .from('follows')
        .select('*, follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, bio, created_at)', {
          count: 'exact',
        })
        .eq('following_id', profileId)
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (error) {
        console.error('followService.getFollowers error:', error);
        return { followers: [], total: 0, error };
      }

      const followers = (data || [])
        .map((row) => row.follower)
        .filter(Boolean);

      return {
        followers,
        total: count || followers.length,
        error: null,
      };
    } catch (err) {
      console.error('followService.getFollowers exception:', err);
      return { followers: [], total: 0, error: err };
    }
  },

  /**
   * Get list of users followed by a profile.
   * @param {string} profileId - Target profile UUID
   * @param {Object} options
   * @param {number} options.page - Page index (1-based)
   * @param {number} options.limit - Max items per page
   * @returns {Promise<{ following: Array, total: number, error: any }>}
   */
  async getFollowing(profileId, { page = 1, limit = 20 } = {}) {
    if (!profileId) return { following: [], total: 0, error: null };

    try {
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      const { data, count, error } = await insforge.database
        .from('follows')
        .select('*, following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url, bio, created_at)', {
          count: 'exact',
        })
        .eq('follower_id', profileId)
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (error) {
        console.error('followService.getFollowing error:', error);
        return { following: [], total: 0, error };
      }

      const following = (data || [])
        .map((row) => row.following)
        .filter(Boolean);

      return {
        following,
        total: count || following.length,
        error: null,
      };
    } catch (err) {
      console.error('followService.getFollowing exception:', err);
      return { following: [], total: 0, error: err };
    }
  },

  /**
   * Get an array of user IDs followed by the current user.
   * @param {string} followerId - Current authenticated user UUID
   * @returns {Promise<Array<string>>}
   */
  async getFollowedUserIds(followerId) {
    if (!followerId) return [];

    try {
      const { data, error } = await insforge.database
        .from('follows')
        .select('following_id')
        .eq('follower_id', followerId);

      if (error || !data) return [];
      return data.map((r) => r.following_id);
    } catch (err) {
      return [];
    }
  },
};
