import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookmarkService } from '../../services/bookmarkService';

/**
 * BookmarkButton Component
 * Renders an interactive bookmark/save button with optimistic state and PostgreSQL persistence.
 * Redirects guests to /login while maintaining return path.
 */
export default function BookmarkButton({
  postId,
  initialIsBookmarked = undefined,
  size = 'md',
  showText = false,
  className = '',
  onBookmarkChange,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isBookmarked, setIsBookmarked] = useState(!!initialIsBookmarked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (initialIsBookmarked !== undefined) {
      setIsBookmarked(initialIsBookmarked);
    }
  }, [initialIsBookmarked]);

  // Load bookmark status if not passed
  useEffect(() => {
    let isMounted = true;
    if (user?.id && postId && initialIsBookmarked === undefined) {
      bookmarkService.isBookmarked(user.id, postId).then((res) => {
        if (isMounted && !res.error) {
          setIsBookmarked(res.isBookmarked);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, postId, initialIsBookmarked]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isSubmitting || !postId) return;

    const previousState = isBookmarked;
    const newState = !previousState;
    setIsBookmarked(newState);
    setIsSubmitting(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (onBookmarkChange) {
      onBookmarkChange({ isBookmarked: newState, postId });
    }

    try {
      const result = await bookmarkService.toggleBookmark(user.id, postId, previousState);

      if (result.error) {
        // Rollback
        setIsBookmarked(previousState);
        if (onBookmarkChange) {
          onBookmarkChange({ isBookmarked: previousState, postId });
        }
      } else {
        setIsBookmarked(result.isBookmarked);
        if (onBookmarkChange) {
          onBookmarkChange({ isBookmarked: result.isBookmarked, postId });
        }
      }
    } catch (err) {
      setIsBookmarked(previousState);
      if (onBookmarkChange) {
        onBookmarkChange({ isBookmarked: previousState, postId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSubmitting}
      className={`inline-flex items-center gap-1.5 transition-colors group ${
        isBookmarked
          ? 'text-amber-400 hover:text-amber-300'
          : 'text-zinc-400 hover:text-amber-400'
      } ${className}`}
      title={isBookmarked ? 'Remove from saved stories' : 'Save story'}
      aria-label={isBookmarked ? 'Saved' : 'Save'}
    >
      <Bookmark
        className={`${iconSizes[size] || iconSizes.md} transition-all duration-200 ${
          animating ? 'scale-125' : 'group-hover:scale-110'
        } ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
      />
      {showText && (
        <span className="text-xs font-medium">
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
