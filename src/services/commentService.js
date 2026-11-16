import { insforge } from '../lib/insforge';
import { notificationService } from './notificationService';

/**
 * Comment Service
 * Manages discussion threads, replies, edits, and deletions
 * connected to InsForge PostgreSQL 'comments' table with RLS enforcement.
 */
export const commentService = {
  /**
   * Fetch all comments and replies for a given post.
   * Organizes the flat records into top-level comments and nested replies (1 level).
   * @param {string} postId - Post UUID
   * @returns {Promise<{ comments: Array, total: number, error: any }>}
   */
  async getCommentsByPostId(postId) {
    if (!postId) return { comments: [], total: 0, error: null };

    try {
      const { data, error, count } = await insforge.database
        .from('comments')
        .select('*, user:profiles(id, username, full_name, avatar_url, bio)', {
          count: 'exact',
        })
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('commentService.getCommentsByPostId error:', error);
        return { comments: [], total: 0, error };
      }

      const allRows = data || [];
      const topLevelComments = [];
      const repliesMap = new Map();

      // Separate top-level comments and replies
      for (const row of allRows) {
        if (!row.parent_id) {
          topLevelComments.push({
            ...row,
            replies: [],
          });
        } else {
          if (!repliesMap.has(row.parent_id)) {
            repliesMap.set(row.parent_id, []);
          }
          repliesMap.get(row.parent_id).push(row);
        }
      }

      // Attach replies to their corresponding parent comments
      for (const parent of topLevelComments) {
        if (repliesMap.has(parent.id)) {
          parent.replies = repliesMap.get(parent.id);
        }
      }

      return {
        comments: topLevelComments,
        total: count || allRows.length,
        error: null,
      };
    } catch (err) {
      console.error('commentService.getCommentsByPostId exception:', err);
      return { comments: [], total: 0, error: err };
    }
  },

  /**
   * Get the total count of comments for a post.
   * @param {string} postId - Post UUID
   * @returns {Promise<{ count: number, error: any }>}
   */
  async getCommentCount(postId) {
    if (!postId) return { count: 0, error: null };

    try {
      const { count, error } = await insforge.database
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('commentService.getCommentCount error:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: err };
    }
  },

  /**
   * Create a new top-level comment or reply.
   * @param {Object} params
   * @param {string} params.postId - Post UUID
   * @param {string} params.userId - Authenticated user UUID
   * @param {string} params.content - Raw comment content
   * @param {string|null} [params.parentId=null] - Optional parent comment UUID for replies
   * @returns {Promise<{ comment: Object|null, error: any }>}
   */
  async createComment({ postId, userId, content, parentId = null }) {
    if (!postId || !userId) {
      return {
        comment: null,
        error: new Error('You must be signed in to post a comment.'),
      };
    }

    const cleanContent = (content || '').trim();
    if (!cleanContent) {
      return {
        comment: null,
        error: new Error('Comment cannot be empty.'),
      };
    }

    if (cleanContent.length > 3000) {
      return {
        comment: null,
        error: new Error('Comment exceeds maximum allowed length of 3000 characters.'),
      };
    }

    try {
      // Defense-in-depth: Verify post exists and is published (or author commenting on own post)
      const { data: targetPost, error: postCheckErr } = await insforge.database
        .from('posts')
        .select('id, status, author_id')
        .eq('id', postId)
        .maybeSingle();

      if (postCheckErr || !targetPost) {
        return { comment: null, error: new Error('Article not found.') };
      }

      if (targetPost.status !== 'published' && targetPost.author_id !== userId) {
        return { comment: null, error: new Error('Cannot comment on unpublished drafts.') };
      }

      const payload = {
        post_id: postId,
        user_id: userId,
        content: cleanContent,
        parent_id: parentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await insforge.database
        .from('comments')
        .insert([payload])
        .select('*, user:profiles(id, username, full_name, avatar_url, bio)')
        .single();

      if (error) {
        console.error('commentService.createComment error:', error);
        return { comment: null, error };
      }

      // Generate notifications (non-blocking)
      if (parentId) {
        // Reply notification for the parent comment's author
        insforge.database
          .from('comments')
          .select('id, user_id')
          .eq('id', parentId)
          .maybeSingle()
          .then(({ data: parentComment }) => {
            if (parentComment?.user_id && parentComment.user_id !== userId) {
              notificationService.createNotification({
                recipientId: parentComment.user_id,
                actorId: userId,
                type: 'reply',
                postId: postId,
                commentId: data.id,
              }).catch((nErr) => console.warn('Could not create reply notification:', nErr));
            }
          })
          .catch((pErr) => console.warn('Could not resolve parent comment for notification:', pErr));
      } else {
        // Comment notification for the article's author
        if (targetPost.author_id && targetPost.author_id !== userId) {
          notificationService.createNotification({
            recipientId: targetPost.author_id,
            actorId: userId,
            type: 'comment',
            postId: postId,
            commentId: data.id,
          }).catch((nErr) => console.warn('Could not create comment notification:', nErr));
        }
      }

      return { comment: data, error: null };
    } catch (err) {
      console.error('commentService.createComment exception:', err);
      return { comment: null, error: err };
    }
  },

  /**
   * Update an existing comment owned by the authenticated user.
   * @param {Object} params
   * @param {string} params.commentId - Comment UUID
   * @param {string} params.userId - Authenticated user UUID
   * @param {string} params.content - Updated content
   * @returns {Promise<{ comment: Object|null, error: any }>}
   */
  async updateComment({ commentId, userId, content }) {
    if (!commentId || !userId) {
      return {
        comment: null,
        error: new Error('Missing comment ID or authorization credentials.'),
      };
    }

    const cleanContent = (content || '').trim();
    if (!cleanContent) {
      return {
        comment: null,
        error: new Error('Comment cannot be empty.'),
      };
    }

    if (cleanContent.length > 3000) {
      return {
        comment: null,
        error: new Error('Comment exceeds maximum allowed length of 3000 characters.'),
      };
    }

    try {
      const { data, error } = await insforge.database
        .from('comments')
        .update({
          content: cleanContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select('*, user:profiles(id, username, full_name, avatar_url, bio)')
        .single();

      if (error) {
        console.error('commentService.updateComment error:', error);
        return { comment: null, error };
      }

      if (!data) {
        return { comment: null, error: new Error('Unauthorized or comment not found.') };
      }

      return { comment: data, error: null };
    } catch (err) {
      console.error('commentService.updateComment exception:', err);
      return { comment: null, error: err };
    }
  },

  /**
   * Delete an existing comment owned by the authenticated user.
   * Cascade deletes any child replies automatically.
   * @param {Object} params
   * @param {string} params.commentId - Comment UUID
   * @param {string} params.userId - Authenticated user UUID
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async deleteComment({ commentId, userId }) {
    if (!commentId || !userId) {
      return {
        success: false,
        error: new Error('Missing comment ID or authorization credentials.'),
      };
    }

    try {
      // Authorization check: Verify comment belongs to user
      const { data: existing, error: findErr } = await insforge.database
        .from('comments')
        .select('id, user_id')
        .eq('id', commentId)
        .maybeSingle();

      if (findErr || !existing) {
        return { success: false, error: new Error('Comment not found.') };
      }

      if (existing.user_id !== userId) {
        return {
          success: false,
          error: new Error('Unauthorized: You can only delete your own comments.'),
        };
      }

      const { error } = await insforge.database
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) {
        console.error('commentService.deleteComment error:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('commentService.deleteComment exception:', err);
      return { success: false, error: err };
    }
  },
};
