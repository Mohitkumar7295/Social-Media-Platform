import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Sparkles, UserPlus, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { subscriptionService } from '../../services/subscriptionService';
import { recommendationService } from '../../services/recommendationService';
import UserAvatar from '../common/UserAvatar';
import FollowButton from '../profile/FollowButton';
import SearchModal from '../search/SearchModal';

export default function RightSidebar({ className = '' }) {
  const { user } = useAuth();
  const currentUserId = user?.id || null;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Subscriptions state (Real PostgreSQL follows)
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);

  // Recommendations state (Real PostgreSQL profiles)
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  // Follow interaction notice
  const [followNotice, setFollowNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!currentUserId) return;

      setIsLoadingSubscriptions(true);
      setIsLoadingRecommendations(true);

      try {
        // 1. Fetch real subscriptions
        const { subscriptions: subs } = await subscriptionService.getSubscriptions(currentUserId);
        if (isMounted) {
          setSubscriptions(subs || []);
          setIsLoadingSubscriptions(false);
        }

        // 2. Fetch real recommendations from PostgreSQL profiles
        const { recommendations: recs } = await recommendationService.getRecommendedWriters(
          currentUserId,
          5
        );
        if (isMounted) {
          setRecommendations(recs || []);
          setIsLoadingRecommendations(false);
        }
      } catch (err) {
        console.error('Error loading sidebar data:', err);
        if (isMounted) {
          setIsLoadingSubscriptions(false);
          setIsLoadingRecommendations(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <aside className={`w-80 flex flex-col gap-6 py-6 px-4 select-none shrink-0 ${className}`}>
      {/* 1. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setIsSearchOpen(true)}
          placeholder="Search WriteSpace"
          className="w-full bg-[#161619] border border-[#242428] rounded-full pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FF6719] focus:ring-1 focus:ring-[#FF6719] transition-all cursor-pointer"
        />
      </form>

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />

      {/* 2. Subscriptions Panel */}
      <div className="bg-[#141416] border border-[#242428] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-serif font-bold text-base text-zinc-100 tracking-tight">
            Subscriptions
          </h3>
          <Link
            to="/subscriptions"
            className="text-xs text-[#FF6719] hover:text-orange-400 font-medium transition-colors"
          >
            See all
          </Link>
        </div>

        {isLoadingSubscriptions ? (
          <div className="space-y-3 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-800 rounded w-24" />
                  <div className="h-2.5 bg-zinc-800/60 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {subscriptions.slice(0, 5).map((sub) => (
              <Link
                key={sub.id}
                to={`/profile/${sub.username}`}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#1c1c20] transition-colors group"
              >
                <UserAvatar
                  src={sub.avatar_url}
                  name={sub.full_name}
                  username={sub.username}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {sub.full_name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">@{sub.username}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              You haven't followed any writers yet.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6719] hover:text-orange-400 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Writers</span>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Recommended for you Panel */}
      <div className="bg-[#141416] border border-[#242428] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF6719]" />
            <h3 className="font-serif font-bold text-base text-zinc-100 tracking-tight">
              Recommended for you
            </h3>
          </div>
        </div>

        {isLoadingRecommendations ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-800 rounded w-28" />
                  <div className="h-2.5 bg-zinc-800/60 rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-start justify-between gap-2.5">
                <Link
                  to={`/profile/${rec.username}`}
                  className="flex items-start gap-2.5 min-w-0 group flex-1"
                >
                  <UserAvatar
                    src={rec.avatar_url}
                    name={rec.full_name}
                    username={rec.username}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {rec.full_name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">@{rec.username}</p>
                    {rec.bio && (
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{rec.bio}</p>
                    )}
                  </div>
                </Link>

                <FollowButton
                  targetUserId={rec.id}
                  size="xs"
                  onFollowChange={async ({ isFollowing }) => {
                    if (isFollowing) {
                      const [subRes, recRes] = await Promise.all([
                        subscriptionService.getSubscriptions(currentUserId),
                        recommendationService.getRecommendedWriters(currentUserId, 5),
                      ]);
                      setSubscriptions(subRes.subscriptions || []);
                      setRecommendations(recRes.recommendations || []);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-zinc-400 leading-relaxed">
              No new recommendations available right now.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Footer info */}
      <div className="text-[11px] text-zinc-600 px-2 leading-relaxed">
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
          <Link to="/explore" className="hover:text-zinc-400 transition-colors">
            Explore
          </Link>
          <a href="#about" className="hover:text-zinc-400 transition-colors">
            About
          </a>
          <a href="#terms" className="hover:text-zinc-400 transition-colors">
            Terms
          </a>
          <a href="#privacy" className="hover:text-zinc-400 transition-colors">
            Privacy
          </a>
        </div>
        <p>© 2026 WriteSpace. Editorial publishing platform.</p>
      </div>
    </aside>
  );
}
