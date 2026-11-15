import { insforge } from '../lib/insforge';

/**
 * Profile Service managing PostgreSQL 'profiles' table operations.
 */
export const profileService = {
  /**
   * Check if a username is available.
   * @param {string} username - Desired username (case-insensitive check)
   * @param {string|null} excludeUserId - Optional user ID to exclude (for editing own profile)
   */
  async checkUsernameAvailable(username, excludeUserId = null) {
    try {
      const cleanUsername = username.trim().toLowerCase();
      let query = insforge.database
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;
      if (error) return { available: false, error };
      return { available: !data || data.length === 0, error: null };
    } catch (err) {
      return { available: false, error: err };
    }
  },

  /**
   * Fetch a user profile by unique username.
   */
  async getProfileByUsername(username) {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      return { profile: data, error };
    } catch (err) {
      return { profile: null, error: err };
    }
  },

  /**
   * Fetch a user profile by user UUID.
   */
  async getProfileById(userId) {
    try {
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      return { profile: data, error };
    } catch (err) {
      return { profile: null, error: err };
    }
  },

  /**
   * Initialize a new profile record in PostgreSQL for an authenticated user.
   * Inserts an array as required by InsForge conventions: insert([{ ... }]).
   */
  async createProfile({
    id,
    username,
    fullName,
    bio = '',
    avatarUrl = null,
    avatarKey = null,
    coverImageUrl = null,
    coverImageKey = null,
    website = null,
    location = null,
  }) {
    try {
      const payload = {
        id,
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        bio: bio?.trim() || null,
        avatar_url: avatarUrl || null,
        avatar_key: avatarKey || null,
        cover_image_url: coverImageUrl || null,
        cover_image_key: coverImageKey || null,
        website: website?.trim() || null,
        location: location?.trim() || null,
      };

      const { data, error } = await insforge.database
        .from('profiles')
        .insert([payload])
        .select()
        .single();

      return { profile: data, error };
    } catch (err) {
      return { profile: null, error: err };
    }
  },

  /**
   * Update an existing profile record in PostgreSQL.
   */
  async updateProfile(userId, updates) {
    try {
      const payload = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
      if (updates.username !== undefined) payload.username = updates.username.trim().toLowerCase();
      if (updates.bio !== undefined) payload.bio = updates.bio?.trim() || null;
      if (updates.website !== undefined) payload.website = updates.website?.trim() || null;
      if (updates.location !== undefined) payload.location = updates.location?.trim() || null;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.avatarKey !== undefined) payload.avatar_key = updates.avatarKey;
      if (updates.coverImageUrl !== undefined) payload.cover_image_url = updates.coverImageUrl;
      if (updates.coverImageKey !== undefined) payload.cover_image_key = updates.coverImageKey;

      const { data, error } = await insforge.database
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      return { profile: data, error };
    } catch (err) {
      return { profile: null, error: err };
    }
  },
};
