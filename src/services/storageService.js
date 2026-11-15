import { insforge } from '../lib/insforge';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Storage Service for uploading and managing images in InsForge Storage buckets.
 */
export const storageService = {
  /**
   * Validates image file type and size.
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPG, JPEG, PNG, and WebP images are supported.' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds 5MB limit.' };
    }
    return { valid: true, error: null };
  },

  /**
   * Upload an avatar image for a user.
   * Path format: user-${userId}-${timestamp}.${ext}
   */
  async uploadAvatar(userId, file) {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return { data: null, error: new Error(validation.error) };
    }

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `user-${userId}-${Date.now()}.${extension}`;

      const { data, error } = await insforge.storage
        .from('avatars')
        .upload(path, file);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          url: data.url,
          key: data.key,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Upload a profile banner cover image.
   * Path format: cover-${userId}-${timestamp}.${ext}
   */
  async uploadCover(userId, file) {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return { data: null, error: new Error(validation.error) };
    }

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `cover-${userId}-${Date.now()}.${extension}`;

      const { data, error } = await insforge.storage
        .from('covers')
        .upload(path, file);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          url: data.url,
          key: data.key,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Delete an object from storage by key.
   */
  async removeFile(bucketName, key) {
    if (!key) return { success: true };
    try {
      const { data, error } = await insforge.storage
        .from(bucketName)
        .remove(key);
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err };
    }
  },
};
