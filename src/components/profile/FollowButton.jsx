import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { followService } from '../../services/followService';

/**
 * FollowButton Component
 * Renders an interactive follow/unfollow button connected to InsForge PostgreSQL 'follows' table.
 * Adheres to the white & teal design palette:
 * - Follow: Teal green with white text
 * - Following: Light mint with teal text, turning soft rose on hover to signal Unfollow
 */
export default function FollowButton({
  targetUserId,
  initialIsFollowing = undefined,
  size = 'sm',
  variant = 'primary',
  className = '',
  onFollowChange,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Sync with initial prop changes
  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing]);

  // Load follow status from database if not explicitly provided
  useEffect(() => {
    let isMounted = true;
    if (user?.id && targetUserId && user.id !== targetUserId && initialIsFollowing === undefined) {
      followService.isFollowing(user.id, targetUserId).then((res) => {
        if (isMounted && !res.error) {
          setIsFollowing(res.isFollowing);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, targetUserId, initialIsFollowing]);

  // Prevent self-following
  if (user?.id && targetUserId && user.id === targetUserId) {
    return null;
  }

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isSubmitting || !targetUserId) return;

    // Optimistic local update
    const previousState = isFollowing;
    const newState = !previousState;
    setIsFollowing(newState);
    setIsSubmitting(true);

    if (onFollowChange) {
      onFollowChange({ isFollowing: newState, targetUserId });
    }

    try {
      const result = await followService.toggleFollow(user.id, targetUserId, previousState);

      if (result.error) {
        // Rollback on failure
        console.error('Follow toggle failed, rolling back:', result.error);
        setIsFollowing(previousState);
        if (onFollowChange) {
          onFollowChange({ isFollowing: previousState, targetUserId });
        }
      } else {
        setIsFollowing(result.isFollowing);
        if (onFollowChange) {
          onFollowChange({
            isFollowing: result.isFollowing,
            followersCount: result.followersCount,
            targetUserId,
          });
        }
      }
    } catch (err) {
      setIsFollowing(previousState);
      if (onFollowChange) {
        onFollowChange({ isFollowing: previousState, targetUserId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] gap-1',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-2.5 text-sm font-semibold gap-2',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSubmitting}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 shadow-xs select-none disabled:opacity-60 disabled:cursor-not-allowed ${
        sizeClasses[size] || sizeClasses.sm
      } ${
        isFollowing
          ? isHovered
            ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
            : 'bg-[#E9F8F5] text-[#0F8178] border border-[#0F8178]/30 hover:border-[#0F8178]/50'
          : 'bg-[#0F8178] hover:bg-[#086B64] text-white'
      } ${className}`}
      title={
        isFollowing
          ? isHovered
            ? 'Unfollow author'
            : 'Subscribed / Following'
          : 'Follow author'
      }
    >
      {isSubmitting ? (
        <>
          <Loader2 className={`${iconSizes[size] || iconSizes.sm} animate-spin`} />
          <span>Updating...</span>
        </>
      ) : isFollowing ? (
        isHovered ? (
          <>
            <UserMinus className={iconSizes[size] || iconSizes.sm} />
            <span>Unfollow</span>
          </>
        ) : (
          <>
            <UserCheck className={`${iconSizes[size] || iconSizes.sm} text-[#0F8178]`} />
            <span>Following</span>
          </>
        )
      ) : (
        <>
          <UserPlus className={iconSizes[size] || iconSizes.sm} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
