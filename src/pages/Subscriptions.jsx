import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, UserCheck } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import UserAvatar from '../components/common/UserAvatar';
import FollowButton from '../components/profile/FollowButton';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';

export default function Subscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSubs() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { subscriptions: data } = await subscriptionService.getSubscriptions(user.id);
        if (isMounted) {
          setSubscriptions(data || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSubs();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <AppLayout activeNav="subscriptions">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#201F1D] tracking-tight">
            Subscriptions & Following
          </h1>
        </div>
        <p className="text-xs text-[#777777]">
          Writers and publications you follow across WriteSpace.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8EAE8] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-stone-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-100 rounded w-36" />
                <div className="h-3 bg-stone-100/70 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-[#E8EAE8] rounded-2xl p-4 flex items-center justify-between hover:border-[#0F8178]/30 hover:bg-[#F0FAF8]/40 transition-colors"
            >
              <Link to={`/profile/${sub.username}`} className="flex items-center gap-3.5 min-w-0">
                <UserAvatar
                  src={sub.avatar_url}
                  name={sub.full_name}
                  username={sub.username}
                  size="lg"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-[#201F1D] hover:text-[#0F8178] truncate transition-colors">
                    {sub.full_name}
                  </h4>
                  <p className="text-xs text-[#777777] truncate">@{sub.username}</p>
                  {sub.bio && (
                    <p className="text-xs text-[#555555] mt-1 line-clamp-1">{sub.bio}</p>
                  )}
                </div>
              </Link>

              <FollowButton
                targetUserId={sub.id}
                initialIsFollowing={true}
                size="sm"
                onFollowChange={async ({ isFollowing }) => {
                  if (!isFollowing) {
                    setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id));
                  }
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8EAE8] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#201F1D] mb-2">
            No Subscriptions Yet
          </h3>
          <p className="text-[#777777] text-xs max-w-sm mx-auto leading-relaxed mb-5">
            Follow authors and publications on WriteSpace to curate your reading feed.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Writers</span>
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
