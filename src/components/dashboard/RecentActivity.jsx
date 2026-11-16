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
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#242428] mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF6719]" />
          <h2 className="font-serif font-bold text-lg text-white tracking-tight">
            Recent Activity
          </h2>
        </div>

        <Link
          to="/activity"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6719] hover:text-orange-400 transition-colors"
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
            let iconBg = 'bg-rose-500/10 border-rose-500/20';
            let description = '';
            let targetUrl = '#';

            if (type === 'like') {
              Icon = Heart;
              iconColor = 'text-rose-500';
              iconBg = 'bg-rose-500/10 border-rose-500/20';
              description = `liked "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}` : '#';
            } else if (type === 'comment') {
              Icon = MessageCircle;
              iconColor = 'text-blue-400';
              iconBg = 'bg-blue-500/10 border-blue-500/20';
              description = `commented on "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}#responses` : '#';
            } else if (type === 'reply') {
              Icon = CornerDownRight;
              iconColor = 'text-purple-400';
              iconBg = 'bg-purple-500/10 border-purple-500/20';
              description = `replied to your comment on "${post?.title || 'your story'}"`;
              targetUrl = post?.slug ? `/p/${post.slug}#responses` : '#';
            } else {
              Icon = UserPlus;
              iconColor = 'text-emerald-400';
              iconBg = 'bg-emerald-500/10 border-emerald-500/20';
              description = 'started following your publication';
              targetUrl = actor?.username ? `/profile/${actor.username}` : '#';
            }

            return (
              <div
                key={id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#18181c] transition-colors group"
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
                  <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                    <span className="font-semibold text-white">
                      {actor?.full_name || actor?.username || 'A reader'}{' '}
                    </span>
                    <span className="text-zinc-400">{description}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelative(created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-zinc-400">
          No recent activity on your stories yet.
        </div>
      )}
    </div>
  );
}
