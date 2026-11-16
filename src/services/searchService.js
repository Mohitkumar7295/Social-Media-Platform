import { insforge } from '../lib/insforge';

/**
 * Search Service
 * Real-time keyword search for published stories and writer profiles across WriteSpace.
 * Strictly enforces that unpublished drafts never appear in search results.
 */
export const searchService = {
  /**
   * Search published articles by title, subtitle, excerpt, or category.
   * @param {string} rawQuery - Search keyword
   * @param {Object} options
   * @param {number} options.limit - Max results
   * @returns {Promise<{ articles: Array, error: any }>}
   */
  async searchArticles(rawQuery, { limit = 10 } = {}) {
    const q = (rawQuery || '').trim();
    if (!q) return { articles: [], error: null };

    // Escape commas and wildcards in query to keep PostgREST or() filter safe
    const sanitizedQuery = q.replace(/[,()]/g, ' ');

    try {
      const orFilter = `title.ilike.%${sanitizedQuery}%,subtitle.ilike.%${sanitizedQuery}%,excerpt.ilike.%${sanitizedQuery}%,category.ilike.%${sanitizedQuery}%`;

      const { data, error } = await insforge.database
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('status', 'published')
        .or(orFilter)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('searchService.searchArticles error:', error);
        return { articles: [], error };
      }

      return { articles: data || [], error: null };
    } catch (err) {
      console.error('searchService.searchArticles exception:', err);
      return { articles: [], error: err };
    }
  },

  /**
   * Search writers by full name, username, or bio.
   * @param {string} rawQuery - Search keyword
   * @param {Object} options
   * @param {number} options.limit - Max results
   * @returns {Promise<{ writers: Array, error: any }>}
   */
  async searchWriters(rawQuery, { limit = 10 } = {}) {
    const q = (rawQuery || '').trim();
    if (!q) return { writers: [], error: null };

    const sanitizedQuery = q.replace(/[,()]/g, ' ');

    try {
      const orFilter = `full_name.ilike.%${sanitizedQuery}%,username.ilike.%${sanitizedQuery}%,bio.ilike.%${sanitizedQuery}%`;

      const { data, error } = await insforge.database
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .or(orFilter)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('searchService.searchWriters error:', error);
        return { writers: [], error };
      }

      return { writers: data || [], error: null };
    } catch (err) {
      console.error('searchService.searchWriters exception:', err);
      return { writers: [], error: err };
    }
  },

  /**
   * Unified search across articles and writers in parallel.
   * @param {string} rawQuery - Search keyword
   * @param {Object} options
   * @param {number} options.limit - Max results per category
   * @returns {Promise<{ articles: Array, writers: Array, total: number, error: any }>}
   */
  async searchAll(rawQuery, { limit = 10 } = {}) {
    const q = (rawQuery || '').trim();
    if (!q) {
      return { articles: [], writers: [], total: 0, error: null };
    }

    try {
      const [articlesRes, writersRes] = await Promise.all([
        this.searchArticles(q, { limit }),
        this.searchWriters(q, { limit }),
      ]);

      const articles = articlesRes.articles || [];
      const writers = writersRes.writers || [];

      return {
        articles,
        writers,
        total: articles.length + writers.length,
        error: articlesRes.error || writersRes.error || null,
      };
    } catch (err) {
      return { articles: [], writers: [], total: 0, error: err };
    }
  },
};
