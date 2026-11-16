import { insforge } from '../lib/insforge.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPG, JPEG, PNG, WebP, GIF, and AVIF images are supported.' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true, error: null };
  },

  /**
   * Generic image upload to any storage bucket (e.g. 'covers', 'article-images', 'avatars').
   * Returns { url, key, data: { url, key }, error }.
   */
  async uploadImage(file, bucketName = 'article-images', userId = 'common') {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return { url: null, key: null, data: null, error: new Error(validation.error) };
    }

    try {
      const extension = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanUserId = userId || 'writer';
      const path = `${cleanUserId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

      const { data, error } = await insforge.storage
        .from(bucketName)
        .upload(path, file);

      if (error) {
        console.error(`Storage upload error to ${bucketName}:`, error);
        return { url: null, key: null, data: null, error };
      }

      return {
        url: data.url,
        key: data.key,
        data: {
          url: data.url,
          key: data.key,
        },
        error: null,
      };
    } catch (err) {
      console.error(`Storage exception in uploadImage to ${bucketName}:`, err);
      return { url: null, key: null, data: null, error: err };
    }
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
    return this.uploadImage(file, 'covers', userId);
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

  /**
   * Alias for removeFile for backwards compatibility.
   */
  async deleteFile(bucketName, key) {
    return this.removeFile(bucketName, key);
  },
};
