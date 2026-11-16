import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserX, Loader2 } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import FollowButton from './FollowButton';
import { followService } from '../../services/followService';

/**
 * UserFollowList Component
 * Renders a list of followers or followed users connected to InsForge PostgreSQL.
 * Used inside profile tabs or modals with live follow/unfollow capability.
 */
export default function UserFollowList({ profileId, type = 'followers', onFollowChange }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadList() {
      if (!profileId) return;
      setIsLoading(true);
      setErrorMsg('');

      try {
        let res;
        if (type === 'followers') {
          res = await followService.getFollowers(profileId, { page: 1, limit: 50 });
          if (isMounted) setUsers(res.followers || []);
        } else {
          res = await followService.getFollowing(profileId, { page: 1, limit: 50 });
          if (isMounted) setUsers(res.following || []);
        }

        if (res.error && isMounted) {
          setErrorMsg('Failed to load user list.');
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load user list.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadList();

    return () => {
      isMounted = false;
    };
  }, [profileId, type]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200/80 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-stone-200" />
              <div className="space-y-1.5">
                <div className="h-3.5 bg-stone-200 rounded w-28" />
                <div className="h-3 bg-stone-100 rounded w-20" />
              </div>
            </div>
            <div className="h-7 w-20 bg-stone-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {errorMsg}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
        <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
          <UserX className="w-5 h-5" />
        </div>
        <h4 className="font-editorial text-base font-bold text-stone-800 mb-1">
          {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
        </h4>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          {type === 'followers'
            ? 'When someone follows this writer, they will be listed here.'
            : 'When this writer follows other community members, they will be listed here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {users.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-brand-300 shadow-xs transition-all"
        >
          <Link
            to={`/profile/${item.username}`}
            className="flex items-center gap-3 min-w-0 flex-1 group"
          >
            <UserAvatar
              src={item.avatar_url}
              name={item.full_name || item.username}
              username={item.username}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-stone-900 group-hover:text-brand-700 transition-colors truncate">
                {item.full_name || item.username}
              </h4>
              <p className="text-xs text-stone-500 truncate">@{item.username}</p>
              {item.bio && (
                <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{item.bio}</p>
              )}
            </div>
          </Link>

          <FollowButton
            targetUserId={item.id}
            size="sm"
            onFollowChange={onFollowChange}
          />
        </div>
      ))}
    </div>
  );
}
