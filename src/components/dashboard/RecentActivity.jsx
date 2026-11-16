import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  CornerDownRight,
  UserPlus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

function formatRelative(isoDate) {
  if (!isoDate) return '';
  const diffSec = Math.floor((new Date() - new Date(isoDate)) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * RecentActivity Component
 * Compact activity feed on the writer dashboard.
 */
export default function RecentActivity({ activity = [] }) {
  return (
    <div className="bg-white border border-[#E8EAE8] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8EAE8] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif font-bold text-lg text-[#201F1D] tracking-tight">
            Recent Activity
          </h2>
        </div>

        <Link
          to="/activity"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F8178] hover:text-[#086B64] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {activity.length > 0 ? (
        <div className="space-y-3.5">
          {activity.slice(0, 6).map((item) => {
            const { id, type, created_at, actor, post } = item;

            let Icon = Heart;
            let iconColor = 'text-rose-500';
            let iconBg = 'bg-rose-50 border-rose-200/60';
            let description = '';
            let targetUrl = '#';

            if (type === 'like') {
              Icon = Heart;
              iconColor = 'text-rose-500';
              iconBg = 'bg-rose-50 border-rose-200/60';
              description = `liked "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}` : '#';
            } else if (type === 'comment') {
              Icon = MessageCircle;
              iconColor = 'text-sky-600';
              iconBg = 'bg-sky-50 border-sky-200/60';
              description = `commented on "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}#responses` : '#';
            } else if (type === 'reply') {
              Icon = CornerDownRight;
              iconColor = 'text-purple-600';
              iconBg = 'bg-purple-50 border-purple-200/60';
              description = `replied to your comment on "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}#responses` : '#';
            } else {
              Icon = UserPlus;
              iconColor = 'text-[#0F8178]';
              iconBg = 'bg-[#E9F8F5] border-[#0F8178]/30';
              description = 'started following your publication';
              targetUrl = actor?.username ? `/profile/${actor.username}` : '#';
            }

            return (
              <div
                key={id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F0FAF8] transition-colors group"
              >
                <div className="relative shrink-0 mt-0.5">
                  <UserAvatar
                    src={actor?.avatar_url}
                    name={actor?.full_name || actor?.username}
                    username={actor?.username}
                    size="sm"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border flex items-center justify-center ${iconBg}`}
                  >
                    <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#201F1D] leading-snug line-clamp-2">
                    <span className="font-semibold text-[#201F1D]">
                      {actor?.full_name || actor?.username || 'A reader'}{' '}
                    </span>
                    <span className="text-[#555555]">{description}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#777777] mt-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelative(created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#777777]">
          No recent activity on your stories yet.
        </div>
      )}
    </div>
  );
}
