import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, MessageSquareOff, RefreshCw } from 'lucide-react';
import { commentService } from '../../services/commentService';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import { useAuth } from '../../context/AuthContext';

/**
 * CommentSection Component
 * Full response discussion view for article reading and engagement.
 * Persists comments and 1-level replies to InsForge PostgreSQL.
 */
export default function CommentSection({ postId, onCommentCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch comments from database
  const loadComments = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await commentService.getCommentsByPostId(postId);
      if (res.error) {
        setErrorMsg('Unable to load responses. Please try refreshing.');
      } else {
        setComments(res.comments || []);
        setTotalCount(res.total || 0);
        if (onCommentCountChange) {
          onCommentCountChange(res.total || 0);
        }
      }
    } catch (err) {
      setErrorMsg('Unable to load responses.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, onCommentCountChange]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Handle new top-level response submission
  const handleCreateTopLevel = async (content) => {
    if (!user || !postId) return;
    setIsSubmitting(true);
    try {
      const { comment, error } = await commentService.createComment({
        postId,
        userId: user.id,
        content,
      });

      if (error) {
        throw new Error(error.message || 'Failed to post response.');
      }

      if (comment) {
        const updated = [{ ...comment, replies: [] }, ...comments];
        setComments(updated);
        const newTotal = totalCount + 1;
        setTotalCount(newTotal);
        if (onCommentCountChange) onCommentCountChange(newTotal);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle inline reply submission
  const handleReply = async (parentId, content) => {
    if (!user || !postId) return;
    const { comment, error } = await commentService.createComment({
      postId,
      userId: user.id,
      content,
      parentId,
    });

    if (error) {
      throw new Error(error.message || 'Failed to post reply.');
    }

    if (comment) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), comment],
            };
          }
          return c;
        })
      );
      const newTotal = totalCount + 1;
      setTotalCount(newTotal);
      if (onCommentCountChange) onCommentCountChange(newTotal);
    }
  };

  // Handle comment/reply edit
  const handleEdit = async (commentId, content) => {
    if (!user) return;
    const { comment, error } = await commentService.updateComment({
      commentId,
      userId: user.id,
      content,
    });

    if (error) {
      throw new Error(error.message || 'Failed to update comment.');
    }

    if (comment) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, content: comment.content, updated_at: comment.updated_at };
          }
          if (c.replies && c.replies.some((r) => r.id === commentId)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, content: comment.content, updated_at: comment.updated_at }
                  : r
              ),
            };
          }
          return c;
        })
      );
    }
  };

  // Handle comment/reply deletion
  const handleDelete = async (commentId) => {
    if (!user) return;
    const { success, error } = await commentService.deleteComment({
      commentId,
      userId: user.id,
    });

    if (error || !success) {
      throw new Error(error?.message || 'Failed to delete comment.');
    }

    // Recalculate accurately from database to reflect cascade deletions
    await loadComments();
  };

  return (
    <section id="responses" className="mt-12 pt-8 border-t border-[#202024] scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <MessageCircle className="w-5 h-5 text-[#FF6719]" />
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
            Responses{' '}
            <span className="font-sans text-sm font-normal text-zinc-400">
              ({totalCount})
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={loadComments}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1a20] transition-colors"
          title="Refresh responses"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top Response Composer */}
      <div className="mb-8">
        <CommentComposer
          onSubmit={handleCreateTopLevel}
          placeholder="Share your thoughts on this story..."
          submitLabel="Respond"
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={loadComments}
            className="underline hover:text-white ml-2 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && comments.length === 0 && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 border-b border-[#202024] space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="h-4 bg-zinc-800 rounded w-28" />
              </div>
              <div className="h-4 bg-zinc-800/80 rounded w-4/5 ml-11" />
              <div className="h-3 bg-zinc-800/60 rounded w-1/2 ml-11" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && comments.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#141416]/50 border border-[#202024]">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquareOff className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200 mb-1">
            No responses yet
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Be the first to share your thoughts, critique, or encouragement with the author.
          </p>
        </div>
      )}

      {/* Comment Discussion List */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
