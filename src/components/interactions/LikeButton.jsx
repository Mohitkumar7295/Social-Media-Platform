import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { likeService } from '../../services/likeService';

/**
 * LikeButton Component
 * Renders an interactive heart button with real-time optimistic state and InsForge PostgreSQL persistence.
 * Redirects guests to /login while maintaining current page destination.
 */
export default function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  className = '',
  onLikedChange,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Sync with initial props if they update from parent
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  // Load initial like state from database if not explicitly passed
  useEffect(() => {
    let isMounted = true;
    if (postId && (initialCount === 0 || initialLiked === undefined)) {
      likeService.getLikeState(postId, user?.id).then((res) => {
        if (isMounted && !res.error) {
          setLiked(res.liked);
          setCount(res.count);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [postId, user?.id]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Guest check -> redirect to login
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isSubmitting || !postId) return;

    // 2. Optimistic local update
    const previousLiked = liked;
    const previousCount = count;
    const newLiked = !liked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setLiked(newLiked);
    setCount(newCount);
    setIsSubmitting(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (onLikedChange) {
      onLikedChange({ liked: newLiked, count: newCount });
    }

    try {
      const result = await likeService.toggleLike(postId, user.id, previousLiked);

      if (result.error) {
        // Rollback on failure
        console.error('Like toggle failed, reverting:', result.error);
        setLiked(previousLiked);
        setCount(previousCount);
        if (onLikedChange) {
          onLikedChange({ liked: previousLiked, count: previousCount });
        }
      } else {
        // Sync with confirmed database count
        setLiked(result.liked);
        setCount(result.count);
        if (onLikedChange) {
          onLikedChange({ liked: result.liked, count: result.count });
        }
      }
    } catch (err) {
      setLiked(previousLiked);
      setCount(previousCount);
      if (onLikedChange) {
        onLikedChange({ liked: previousLiked, count: previousCount });
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

  const textSizes = {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-base font-medium',
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isSubmitting}
      className={`inline-flex items-center gap-1.5 transition-colors group ${
        liked
          ? 'text-rose-500 hover:text-rose-400'
          : 'text-zinc-400 hover:text-rose-400'
      } ${className}`}
      title={liked ? 'Unlike article' : 'Applaud article'}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={`${iconSizes[size] || iconSizes.md} transition-all duration-200 ${
          animating ? 'scale-125' : 'group-hover:scale-110'
        } ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
      />
      {showCount && (
        <span className={`font-medium tabular-nums ${textSizes[size] || textSizes.md}`}>
          {count > 0 ? count.toLocaleString() : 'Like'}
        </span>
      )}
    </button>
  );
}
