import { insforge } from '../lib/insforge';

/**
 * Notification Service
 * Manages user activity alerts for follows, likes, comments, and replies.
 * Backed by InsForge PostgreSQL 'notifications' table with strict RLS and zero fake data.
 */
export const notificationService = {
  /**
   * Create a notification record in PostgreSQL.
   * Defensively prevents self-notifications and handles errors gracefully.
   *
   * @param {Object} params
   * @param {string} params.recipientId - User UUID receiving the alert
   * @param {string} params.actorId - User UUID performing the action
   * @param {'follow'|'like'|'comment'|'reply'} params.type - Alert event type
   * @param {string|null} [params.postId=null] - Related post UUID
   * @param {string|null} [params.commentId=null] - Related comment UUID
   * @returns {Promise<{ success: boolean, notification?: Object, error: any }>}
   */
  async createNotification({ recipientId, actorId, type, postId = null, commentId = null }) {
    if (!recipientId || !actorId || !type) {
      return { success: false, error: new Error('Missing required notification fields') };
    }

    // Never notify a user about their own actions
    if (recipientId === actorId) {
      return { success: true, notification: null, error: null };
    }

    try {
      const payload = {
        recipient_id: recipientId,
        actor_id: actorId,
        type,
        post_id: postId || null,
        comment_id: commentId || null,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await insforge.database
        .from('notifications')
        .insert([payload])
        .select('id, recipient_id, actor_id, type, post_id, comment_id, is_read, created_at')
        .single();

      if (error) {
        console.error('notificationService.createNotification error:', error);
        return { success: false, error };
      }

      return { success: true, notification: data, error: null };
    } catch (err) {
      console.error('notificationService.createNotification exception:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Get paginated notifications for the recipient with joined actor and post metadata.
   *
   * @param {string} recipientId - Authenticated user UUID
   * @param {Object} [options]
   * @param {number} [options.page=1] - 1-based page index
   * @param {number} [options.limit=20] - Max items per page
   * @param {boolean} [options.unreadOnly=false] - Filter only unread
   * @returns {Promise<{ notifications: Array, total: number, unreadCount: number, error: any }>}
   */
  async getNotifications(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    if (!recipientId) {
      return { notifications: [], total: 0, unreadCount: 0, error: null };
    }

    try {
      const fromOffset = (page - 1) * limit;
      const toOffset = fromOffset + limit - 1;

      let query = insforge.database
        .from('notifications')
        .select(
          `
          id,
          recipient_id,
          actor_id,
          type,
          post_id,
          comment_id,
          is_read,
          created_at,
          actor:profiles!actor_id(id, username, full_name, avatar_url, bio),
          post:posts!post_id(id, title, slug, status)
        `,
          { count: 'exact' }
        )
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .range(fromOffset, toOffset);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, count, error } = await query;

      if (error) {
        console.error('notificationService.getNotifications error:', error);
        return { notifications: [], total: 0, unreadCount: 0, error };
      }

      // Also get unread count
      const { count: unreadCount } = await insforge.database
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      return {
        notifications: data || [],
        total: count || (data ? data.length : 0),
        unreadCount: unreadCount || 0,
        error: null,
      };
    } catch (err) {
      console.error('notificationService.getNotifications exception:', err);
      return { notifications: [], total: 0, unreadCount: 0, error: err };
    }
  },

  /**
   * Get unread notification count for the authenticated user.
   *
   * @param {string} recipientId - User UUID
   * @returns {Promise<{ count: number, error: any }>}
   */
  async getUnreadCount(recipientId) {
    if (!recipientId) return { count: 0, error: null };

    try {
      const { count, error } = await insforge.database
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (error) {
        console.error('notificationService.getUnreadCount error:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: err };
    }
  },

  /**
   * Mark a single notification as read.
   *
   * @param {string} notificationId - Notification UUID
   * @param {string} recipientId - User UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async markAsRead(notificationId, recipientId) {
    if (!notificationId || !recipientId) {
      return { success: false, error: new Error('Missing IDs') };
    }

    try {
      const { error } = await insforge.database
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', recipientId);

      if (error) {
        console.error('notificationService.markAsRead error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Mark all notifications as read for a user.
   *
   * @param {string} recipientId - User UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async markAllAsRead(recipientId) {
    if (!recipientId) return { success: false, error: new Error('Missing recipientId') };

    try {
      const { error } = await insforge.database
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (error) {
        console.error('notificationService.markAllAsRead error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Delete a notification.
   *
   * @param {string} notificationId - Notification UUID
   * @param {string} recipientId - User UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async deleteNotification(notificationId, recipientId) {
    if (!notificationId || !recipientId) {
      return { success: false, error: new Error('Missing IDs') };
    }

    try {
      const { error } = await insforge.database
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', recipientId);

      if (error) {
        console.error('notificationService.deleteNotification error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  },
};
