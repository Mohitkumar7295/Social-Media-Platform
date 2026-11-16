import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';

/**
 * CommentComposer Component
 * Renders an inline text composer for new responses, replies, and comment editing.
 */
export default function CommentComposer({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = 'Share your thoughts...',
  submitLabel = 'Respond',
  isSubmitting = false,
  isReply = false,
  isEdit = false,
  autoFocus = false,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const [content, setContent] = useState(initialContent);
  const [errorMsg, setErrorMsg] = useState('');

  // Guest view: prompt to sign in before commenting
  if (!user) {
    return (
      <div className="bg-white border border-[#E8EAE8] rounded-2xl p-5 text-center my-4">
        <p className="text-[#201F1D] text-sm mb-3">
          Sign in to join the conversation and share your thoughts.
        </p>
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          Sign In to Respond
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const clean = content.trim();
    if (!clean) {
      setErrorMsg('Please write a message before submitting.');
      return;
    }

    if (clean.length > 3000) {
      setErrorMsg('Response exceeds 3,000 characters limit.');
      return;
    }

    try {
      await onSubmit(clean);
      if (!isEdit) {
        setContent('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit comment. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white border border-[#E8EAE8] rounded-2xl p-4 transition-all focus-within:border-[#0F8178] focus-within:ring-1 focus-within:ring-[#0F8178]/20 shadow-2xs ${
        isReply ? 'ml-6 sm:ml-12 mt-3 bg-[#F8FAF9]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          src={user?.avatar_url}
          name={user?.full_name || user?.username}
          username={user?.username}
          size={isReply ? 'sm' : 'md'}
          className="flex-shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder={placeholder}
            rows={isReply || isEdit ? 2 : 3}
            maxLength={3000}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            className="w-full bg-transparent text-[#201F1D] placeholder:text-stone-400 text-sm resize-none focus:outline-none leading-relaxed"
          />

          {errorMsg && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#E8EAE8]">
            <span className="text-[11px] text-[#777777] tabular-nums">
              {content.length}/3000
            </span>

            <div className="flex items-center gap-2">
              {(isReply || isEdit) && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-full text-xs text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
