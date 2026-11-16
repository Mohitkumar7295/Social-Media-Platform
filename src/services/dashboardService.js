import { insforge } from '../lib/insforge';

/**
 * Dashboard Service
 * Provides real PostgreSQL statistics, recent articles with engagement metrics,
 * and recent social activity for the writer dashboard.
 * Zero fabricated numbers or simulated views.
 */
export const dashboardService = {
  /**
   * Fetch all writer overview statistics directly from PostgreSQL records.
   *
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<{ stats: Object, error: any }>}
   */
  async getOverviewStats(userId) {
    if (!userId) {
      return {
        stats: {
          publishedCount: 0,
          draftCount: 0,
          likesCount: 0,
          commentsCount: 0,
          followersCount: 0,
          bookmarksCount: 0,
        },
        error: new Error('User not authenticated'),
      };
    }

    try {
      // 1. Fetch published and draft counts
      const [pubRes, dftRes, followRes, authorPostsRes] = await Promise.all([
        insforge.database
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('status', 'published'),
        insforge.database
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('status', 'draft'),
        insforge.database
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        insforge.database
          .from('posts')
          .select('id')
          .eq('author_id', userId),
      ]);

      const publishedCount = pubRes.count || 0;
      const draftCount = dftRes.count || 0;
      const followersCount = followRes.count || 0;

      const authorPostIds = (authorPostsRes.data || []).map((p) => p.id);

      let likesCount = 0;
      let commentsCount = 0;
      let bookmarksCount = 0;

      // 2. If writer has articles, query aggregate engagement across them
      if (authorPostIds.length > 0) {
        const [likesRes, commentsRes, bookmarksRes] = await Promise.all([
          insforge.database
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .in('post_id', authorPostIds),
          insforge.database
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .in('post_id', authorPostIds),
          insforge.database
            .from('bookmarks')
            .select('id', { count: 'exact', head: true })
            .in('post_id', authorPostIds),
        ]);

        likesCount = likesRes.count || 0;
        commentsCount = commentsRes.count || 0;
        bookmarksCount = bookmarksRes.count || 0;
      }

      return {
        stats: {
          publishedCount,
          draftCount,
          likesCount,
          commentsCount,
          followersCount,
          bookmarksCount,
        },
        error: null,
      };
    } catch (err) {
      console.error('dashboardService.getOverviewStats exception:', err);
      return {
        stats: {
          publishedCount: 0,
          draftCount: 0,
          likesCount: 0,
          commentsCount: 0,
          followersCount: 0,
          bookmarksCount: 0,
        },
        error: err,
      };
    }
  },

  /**
   * Fetch recent articles written by the author with engagement counts.
   *
   * @param {string} userId - Authenticated user UUID
   * @param {Object} [options]
   * @param {number} [options.limit=10] - Max articles
   * @returns {Promise<{ articles: Array, error: any }>}
   */
  async getRecentArticles(userId, { limit = 10 } = {}) {
    if (!userId) return { articles: [], error: null };

    try {
      const { data: posts, error } = await insforge.database
        .from('posts')
        .select('id, title, slug, subtitle, excerpt, category, status, cover_image_url, reading_time, created_at, published_at, updated_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !posts) {
        return { articles: [], error };
      }

      const postIds = posts.map((p) => p.id);
      if (postIds.length === 0) {
        return { articles: [], error: null };
      }

      // Batch query likes, comments, and bookmarks to count engagement per post
      const [likesRes, commentsRes, bookmarksRes] = await Promise.all([
        insforge.database
          .from('likes')
          .select('post_id')
          .in('post_id', postIds),
        insforge.database
          .from('comments')
          .select('post_id')
          .in('post_id', postIds),
        insforge.database
          .from('bookmarks')
          .select('post_id')
          .in('post_id', postIds),
      ]);

      const likesCountMap = {};
      const commentsCountMap = {};
      const bookmarksCountMap = {};

      (likesRes.data || []).forEach((row) => {
        likesCountMap[row.post_id] = (likesCountMap[row.post_id] || 0) + 1;
      });
      (commentsRes.data || []).forEach((row) => {
        commentsCountMap[row.post_id] = (commentsCountMap[row.post_id] || 0) + 1;
      });
      (bookmarksRes.data || []).forEach((row) => {
        bookmarksCountMap[row.post_id] = (bookmarksCountMap[row.post_id] || 0) + 1;
      });

      const enrichedArticles = posts.map((post) => ({
        ...post,
        likesCount: likesCountMap[post.id] || 0,
        commentsCount: commentsCountMap[post.id] || 0,
        bookmarksCount: bookmarksCountMap[post.id] || 0,
      }));

      return { articles: enrichedArticles, error: null };
    } catch (err) {
      console.error('dashboardService.getRecentArticles exception:', err);
      return { articles: [], error: err };
    }
  },

  /**
   * Fetch recent activity alerts for the writer (new followers, likes, comments).
   *
   * @param {string} userId - Authenticated user UUID
   * @param {Object} [options]
   * @param {number} [options.limit=10] - Max items
   * @returns {Promise<{ activity: Array, error: any }>}
   */
  async getRecentActivity(userId, { limit = 10 } = {}) {
    if (!userId) return { activity: [], error: null };

    try {
      const { data, error } = await insforge.database
        .from('notifications')
        .select(`
          id,
          recipient_id,
          actor_id,
          type,
          post_id,
          comment_id,
          is_read,
          created_at,
          actor:profiles!actor_id(id, username, full_name, avatar_url),
          post:posts!post_id(id, title, slug)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('dashboardService.getRecentActivity error:', error);
        return { activity: [], error };
      }

      return { activity: data || [], error: null };
    } catch (err) {
      console.error('dashboardService.getRecentActivity exception:', err);
      return { activity: [], error: err };
    }
  },
};
