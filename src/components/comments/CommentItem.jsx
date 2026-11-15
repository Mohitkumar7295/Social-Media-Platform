import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Edit2,
  Trash2,
  MoreHorizontal,
  CornerDownRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import CommentComposer from './CommentComposer';
import { useAuth } from '../../context/AuthContext';

/**
 * Format timestamp into relative or concise date.
 */
function formatCommentDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * CommentItem Component
 * Renders an individual response or reply with author credentials, inline editing,
 * deletion confirmation, and 1-level reply threading.
 */
export default function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!comment) return null;

  const author = comment.user || {};
  const isOwner = user?.id && comment.user_id === user.id;
  const isEdited =
    comment.updated_at &&
    new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 2000;

  const handleReplySubmit = async (content) => {
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, content);
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (content) => {
    setIsSubmittingEdit(true);
    try {
      await onEdit(comment.id, content);
      setIsEditing(false);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`relative group ${
        isReply ? 'ml-6 sm:ml-12 mt-3 pt-3 border-t border-[#202024]/60' : 'py-4 border-b border-[#202024]'
      }`}
    >
      {/* Top Header: Author + Timestamp + Menu */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <Link
            to={`/profile/${author.username || ''}`}
            className="hover:opacity-90 transition-opacity"
          >
            <UserAvatar
              src={author.avatar_url}
              name={author.full_name || author.username}
              username={author.username}
              size={isReply ? 'xs' : 'sm'}
            />
          </Link>
          <div className="flex items-baseline gap-2">
            <Link
              to={`/profile/${author.username || ''}`}
              className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-[#FF6719] transition-colors"
            >
              {author.full_name || author.username || 'Anonymous'}
            </Link>
            {author.username && (
              <span className="text-[11px] text-zinc-500">@{author.username}</span>
            )}
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] text-zinc-400">
              {formatCommentDate(comment.created_at)}
            </span>
            {isEdited && (
              <span className="text-[10px] text-zinc-500 italic">(edited)</span>
            )}
          </div>
        </div>

        {/* Owner Action Menu (Edit / Delete) */}
        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20] transition-colors"
              title="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-32 bg-[#18181c] border border-[#2b2b32] rounded-xl shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-[#24242c] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Comment Content / Inline Edit Form */}
      {isEditing ? (
        <div className="my-2">
          <CommentComposer
            initialContent={comment.content}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            submitLabel="Save Changes"
            isSubmitting={isSubmittingEdit}
            isEdit={true}
            autoFocus={true}
          />
        </div>
      ) : (
        <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-8 sm:pl-10 mb-2">
          {comment.content}
        </p>
      )}

      {/* Bottom Actions: Reply Button (only on top-level comments) */}
      {!isReply && !isEditing && (
        <div className="flex items-center gap-3 pl-8 sm:pl-10 mt-1">
          <button
            type="button"
            onClick={() => setIsReplying(!isReplying)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      )}

      {/* Inline Reply Composer */}
      {isReplying && (
        <CommentComposer
          onSubmit={handleReplySubmit}
          onCancel={() => setIsReplying(false)}
          placeholder={`Reply to ${author.full_name || author.username}...`}
          submitLabel="Reply"
          isSubmitting={isSubmittingReply}
          isReply={true}
          autoFocus={true}
        />
      )}

      {/* Nested Replies (1 Level Only) */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#18181c] border border-[#2c2c34] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white text-base">
                Delete Response?
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              Are you sure you want to delete this response? This action cannot be undone.
              {!isReply && comment.replies?.length > 0 && (
                <span className="block mt-1 text-rose-300 font-medium">
                  Note: All replies to this comment will also be deleted.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#25252d] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
