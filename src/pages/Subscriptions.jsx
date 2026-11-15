import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Sparkles, UserCheck } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import UserAvatar from '../components/common/UserAvatar';
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
          <Bookmark className="w-5 h-5 text-[#FF6719]" />
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Subscriptions & Following
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Writers and publications you follow across WriteSpace.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-36" />
                <div className="h-3 bg-zinc-800/60 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-4 flex items-center justify-between hover:border-[#32323a] transition-colors"
            >
              <Link to={`/profile/${sub.username}`} className="flex items-center gap-3.5 min-w-0">
                <UserAvatar
                  src={sub.avatar_url}
                  name={sub.full_name}
                  username={sub.username}
                  size="lg"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-zinc-100 hover:text-white truncate">
                    {sub.full_name}
                  </h4>
                  <p className="text-xs text-zinc-500 truncate">@{sub.username}</p>
                  {sub.bio && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{sub.bio}</p>
                  )}
                </div>
              </Link>

              <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-medium border border-zinc-700/50">
                <UserCheck className="w-3.5 h-3.5 text-[#FF6719]" />
                <span>Following</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            No Subscriptions Yet
          </h3>
          <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed mb-5">
            Follow authors and publications on WriteSpace to curate your reading feed.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Writers</span>
          </Link>
        </div>
      )}

      {/* Phase 5 Notice Box */}
      <div className="mt-8 p-4 rounded-2xl bg-[#141416] border border-[#282830] flex items-start gap-3 text-xs text-zinc-400">
        <Sparkles className="w-4 h-4 text-[#FF6719] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Scheduled for Phase 5:</span> Substack-style paid tiers, newsletter subscriptions, and email deliverability preferences will be fully configured in Phase 5.
        </div>
      </div>
    </AppLayout>
  );
}
