import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  CornerDownRight,
  UserPlus,
  Check,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

/**
 * Format relative timestamp cleanly.
 */
function formatTimeAgo(isoDate) {
  if (!isoDate) return '';
  const now = new Date();
  const date = new Date(isoDate);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * NotificationItem Component
 * Renders an interactive notification with actor avatar, event description,
 * read state, and navigation link.
 */
export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { id, type, is_read, created_at, actor, post } = notification;

  // Resolve target link based on notification type
  let targetUrl = '#';
  if (type === 'follow' && actor?.username) {
    targetUrl = `/profile/${actor.username}`;
  } else if (post?.slug) {
    targetUrl = `/p/${post.slug}`;
    if (type === 'comment' || type === 'reply') {
      targetUrl += '#responses';
    }
  }

  // Type-specific badge and copy
  let TypeIcon = Heart;
  let iconColor = 'text-rose-500';
  let iconBg = 'bg-rose-50 border-rose-200/60';
  let messageText = '';

  switch (type) {
    case 'like':
      TypeIcon = Heart;
      iconColor = 'text-rose-500';
      iconBg = 'bg-rose-50 border-rose-200/60';
      messageText = (
        <span>
          liked your story <span className="font-serif font-bold text-[#201F1D] italic">"{post?.title || 'your story'}"</span>
        </span>
      );
      break;

    case 'comment':
      TypeIcon = MessageCircle;
      iconColor = 'text-sky-600';
      iconBg = 'bg-sky-50 border-sky-200/60';
      messageText = (
        <span>
          commented on <span className="font-serif font-bold text-[#201F1D] italic">"{post?.title || 'your story'}"</span>
        </span>
      );
      break;

    case 'reply':
      TypeIcon = CornerDownRight;
      iconColor = 'text-purple-600';
      iconBg = 'bg-purple-50 border-purple-200/60';
      messageText = (
        <span>
          replied to your comment on <span className="font-serif font-bold text-[#201F1D] italic">"{post?.title || 'your story'}"</span>
        </span>
      );
      break;

    case 'follow':
    default:
      TypeIcon = UserPlus;
      iconColor = 'text-[#0F8178]';
      iconBg = 'bg-[#E9F8F5] border-[#0F8178]/30';
      messageText = <span>started following your publication and writing</span>;
      break;
  }

  const handleItemClick = () => {
    if (!is_read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
        is_read
          ? 'bg-white border-[#E8EAE8] text-[#555555] hover:border-stone-300'
          : 'bg-[#F0FAF8] border-[#0F8178]/25 text-[#201F1D] hover:border-[#0F8178]/50 shadow-2xs'
      }`}
    >
      {/* Unread dot */}
      {!is_read && (
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0F8178]"
          title="Unread alert"
        />
      )}

      {/* Actor Avatar with Event Overlay Badge */}
      <div className="relative shrink-0">
        <Link to={`/profile/${actor?.username || ''}`}>
          <UserAvatar
            src={actor?.avatar_url}
            name={actor?.full_name || actor?.username}
            username={actor?.username}
            size="md"
          />
        </Link>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border flex items-center justify-center ${iconBg} shadow-2xs`}
        >
          <TypeIcon className={`w-3 h-3 ${iconColor}`} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-xs sm:text-sm leading-relaxed">
          <Link
            to={`/profile/${actor?.username || ''}`}
            className="font-semibold text-[#201F1D] hover:text-[#0F8178] mr-1.5 transition-colors"
          >
            {actor?.full_name || actor?.username || 'Someone'}
          </Link>
          <span className="text-[#555555]">{messageText}</span>
        </div>

        {/* Timestamp & Target Link */}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#777777]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(created_at)}
          </span>

          <Link
            to={targetUrl}
            onClick={handleItemClick}
            className="inline-flex items-center gap-1 text-[#0F8178] hover:text-[#086B64] font-medium transition-colors"
          >
            <span>View {type === 'follow' ? 'Profile' : 'Story'}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      {/* Action Buttons: Mark as Read & Delete */}
      <div className="flex items-center gap-1 shrink-0">
        {!is_read && onMarkAsRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(id)}
            title="Mark as read"
            className="p-1.5 rounded-lg text-stone-400 hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(id)}
            title="Remove notification"
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
