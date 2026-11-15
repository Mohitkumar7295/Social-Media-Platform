import { insforge } from '../lib/insforge';
import { generateSlug, estimateReadingTime, extractExcerpt } from '../utils/editorUtils';
import { storageService } from './storageService';

/**
 * Post Service
 * Manages article creation, auto-saving, updating, publishing, and deletion
 * directly using InsForge PostgreSQL 'posts' table and InsForge Storage.
 */
export const postService = {
  /**
   * Create a new post / article (default status: draft).
   * @param {Object} postData
   */
  async createPost({
    authorId,
    title,
    subtitle = '',
    content = '',
    excerpt = '',
    coverImageUrl = null,
    coverImageKey = null,
    category = 'General',
    status = 'draft',
  }) {
    try {
      const cleanTitle = (title || 'Untitled Story').trim();
      const slug = generateSlug(cleanTitle);
      const readingTime = estimateReadingTime(content);
      const finalExcerpt = excerpt?.trim() || extractExcerpt(content);
      const isPublished = status === 'published';
      const now = new Date().toISOString();

      const payload = {
        author_id: authorId,
        title: cleanTitle,
        subtitle: subtitle?.trim() || null,
        slug,
        content: content || '',
        excerpt: finalExcerpt || null,
        cover_image_url: coverImageUrl || null,
        cover_image_key: coverImageKey || null,
        category: category || 'General',
        status,
        reading_time: readingTime,
        published_at: isPublished ? now : null,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await insforge.database
        .from('posts')
        .insert([payload])
        .select('*, author:profiles(*)')
        .single();

      if (error) {
        console.error('PostService.createPost error:', error);
        return { post: null, error };
      }

      return { post: data, error: null };
    } catch (err) {
      console.error('PostService.createPost exception:', err);
      return { post: null, error: err };
    }
  },

  /**
   * Update an existing post by ID.
   * Only the author can update their own post (enforced by RLS & service).
   * @param {string} postId
   * @param {Object} updates
   */
  async updatePost(postId, updates = {}) {
    try {
      const payload = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) {
        payload.title = updates.title.trim();
      }
      if (updates.subtitle !== undefined) {
        payload.subtitle = updates.subtitle?.trim() || null;
      }
      if (updates.content !== undefined) {
        payload.content = updates.content;
        payload.reading_time = estimateReadingTime(updates.content);
        if (!updates.excerpt) {
          payload.excerpt = extractExcerpt(updates.content);
        }
      }
      if (updates.excerpt !== undefined) {
        payload.excerpt = updates.excerpt?.trim() || null;
      }
      if (updates.coverImageUrl !== undefined) {
        payload.cover_image_url = updates.coverImageUrl;
      }
      if (updates.coverImageKey !== undefined) {
        payload.cover_image_key = updates.coverImageKey;
      }
      if (updates.category !== undefined) {
        payload.category = updates.category;
      }
      if (updates.status !== undefined) {
        payload.status = updates.status;
        if (updates.status === 'published' && !updates.publishedAt) {
          payload.published_at = new Date().toISOString();
        } else if (updates.status === 'draft') {
          payload.published_at = null;
        }
      }

      const { data, error } = await insforge.database
        .from('posts')
        .update(payload)
        .eq('id', postId)
        .select('*, author:profiles(*)')
        .single();

      if (error) {
        console.error('PostService.updatePost error:', error);
        return { post: null, error };
      }

      return { post: data, error: null };
    } catch (err) {
      console.error('PostService.updatePost exception:', err);
      return { post: null, error: err };
    }
  },

  /**
   * Fetch a single post by ID with author profile join.
   * @param {string} postId
   */
  async getPostById(postId) {
    try {
      const { data, error } = await insforge.database
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('id', postId)
        .maybeSingle();

      if (error) return { post: null, error };
      return { post: data, error: null };
    } catch (err) {
      return { post: null, error: err };
    }
  },

  /**
   * Fetch a single post by unique slug with author profile join.
   * @param {string} slug
   */
  async getPostBySlug(slug) {
    try {
      const { data, error } = await insforge.database
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (error) return { post: null, error };
      return { post: data, error: null };
    } catch (err) {
      return { post: null, error: err };
    }
  },

  /**
   * Fetch all posts created by a specific author.
   * @param {string} authorId - Author UUID
   * @param {string|null} status - Optional filter: 'published' or 'draft'
   */
  async getAuthorPosts(authorId, status = null) {
    try {
      let query = insforge.database
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('author_id', authorId)
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('PostService.getAuthorPosts error:', error);
        return { posts: [], error };
      }

      return { posts: data || [], error: null };
    } catch (err) {
      return { posts: [], error: err };
    }
  },

  /**
   * Publish an article.
   * @param {string} postId
   */
  async publishPost(postId) {
    return this.updatePost(postId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
  },

  /**
   * Unpublish an article (reverts to draft).
   * @param {string} postId
   */
  async unpublishPost(postId) {
    return this.updatePost(postId, {
      status: 'draft',
      publishedAt: null,
    });
  },

  /**
   * Delete a post and remove its cover image from InsForge storage if present.
   * @param {string} postId
   * @param {string} coverImageKey - Optional storage key
   */
  async deletePost(postId, coverImageKey = null) {
    try {
      // 1. If cover image exists, remove from storage
      if (coverImageKey) {
        try {
          await storageService.deleteFile('covers', coverImageKey);
        } catch (e) {
          console.warn('Could not delete cover image from storage:', e);
        }
      }

      // 2. Delete post row from PostgreSQL
      const { error } = await insforge.database
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('PostService.deletePost error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Upload an article cover image to InsForge Storage 'covers' bucket.
   * @param {File} file
   * @param {string} authorId
   */
  async uploadCoverImage(file, authorId) {
    return storageService.uploadImage(file, 'covers', authorId);
  },

  /**
   * Upload an inline image to InsForge Storage 'article-images' bucket.
   * @param {File} file
   * @param {string} authorId
   */
  async uploadInlineImage(file, authorId) {
    return storageService.uploadImage(file, 'article-images', authorId);
  },
};
