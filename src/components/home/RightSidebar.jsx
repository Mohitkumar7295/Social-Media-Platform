import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Sparkles, Users, ArrowRight } from 'lucide-react';
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

  const handleOpenSearchModal = (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <aside
      className={`w-80 flex flex-col gap-6 py-6 px-4 bg-[#F8FAF9] select-none h-screen sticky top-0 overflow-y-auto ${className}`}
    >
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />

      {/* 1. Global Search Bar */}
      <div className="relative">
        <form onSubmit={handleOpenSearchModal}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleOpenSearchModal}
              placeholder="Search WriteSpace..."
              className="w-full bg-white border border-[#E8EAE8] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#201F1D] placeholder:text-[#777777] focus:outline-none focus:border-[#0F8178] focus:ring-1 focus:ring-[#0F8178] transition-all shadow-xs cursor-pointer"
            />
          </div>
        </form>
      </div>

      {/* 2. Subscriptions / Following Panel */}
      <div className="bg-white border border-[#E8EAE8] rounded-2xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0F8178]" />
            <h3 className="font-serif font-bold text-sm text-[#201F1D] tracking-tight">
              Subscriptions
            </h3>
          </div>
          {subscriptions.length > 0 && (
            <Link
              to="/subscriptions"
              className="text-[11px] font-semibold text-[#0F8178] hover:text-[#086B64] transition-colors"
            >
              See all ({subscriptions.length})
            </Link>
          )}
        </div>

        {isLoadingSubscriptions ? (
          <div className="space-y-3 py-1">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-stone-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-stone-200 rounded w-24" />
                  <div className="h-2 bg-stone-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {subscriptions.slice(0, 5).map((sub) => (
              <Link
                key={sub.id}
                to={`/profile/${sub.username}`}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F0FAF8] transition-colors group"
              >
                <UserAvatar
                  src={sub.avatar_url}
                  name={sub.full_name}
                  username={sub.username}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#201F1D] group-hover:text-[#0F8178] truncate">
                    {sub.full_name}
                  </p>
                  <p className="text-[11px] text-[#777777] truncate">@{sub.username}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center">
            <p className="text-xs text-[#777777] mb-2 leading-relaxed">
              You haven't followed any writers yet.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F8178] hover:text-[#086B64] transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Writers</span>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Recommended for you Panel */}
      <div className="bg-white border border-[#E8EAE8] rounded-2xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0F8178]" />
            <h3 className="font-serif font-bold text-sm text-[#201F1D] tracking-tight">
              Recommended Writers
            </h3>
          </div>
          <Link
            to="/explore"
            className="text-[11px] font-semibold text-[#0F8178] hover:text-[#086B64] transition-colors"
          >
            See more
          </Link>
        </div>

        {isLoadingRecommendations ? (
          <div className="space-y-3 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-stone-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-stone-200 rounded w-24" />
                  <div className="h-2 bg-stone-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recommendations.map((writer) => (
              <div
                key={writer.id}
                className="flex items-center justify-between gap-2.5 p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors"
              >
                <Link
                  to={`/profile/${writer.username}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <UserAvatar
                    src={writer.avatar_url}
                    name={writer.full_name}
                    username={writer.username}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#201F1D] group-hover:text-[#0F8178] truncate">
                      {writer.full_name}
                    </p>
                    <p className="text-[11px] text-[#777777] truncate">@{writer.username}</p>
                  </div>
                </Link>

                <FollowButton
                  targetUserId={writer.id}
                  username={writer.username}
                  size="xs"
                  onFollowChange={async ({ isFollowing }) => {
                    if (isFollowing) {
                      const { recommendations: recs } =
                        await recommendationService.getRecommendedWriters(currentUserId, 5);
                      setRecommendations(recs || []);
                      const { subscriptions: subs } =
                        await subscriptionService.getSubscriptions(currentUserId);
                      setSubscriptions(subs || []);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#777777] py-2">
            No recommendations right now.
          </p>
        )}
      </div>

      {/* 4. Footer Mini Links */}
      <div className="px-2 text-[11px] text-[#999999] flex flex-wrap gap-x-3 gap-y-1.5 leading-normal">
        <Link to="/about" className="hover:text-[#0F8178] transition-colors">
          About
        </Link>
        <span>•</span>
        <Link to="/explore" className="hover:text-[#0F8178] transition-colors">
          Explore
        </Link>
        <span>•</span>
        <Link to="/write" className="hover:text-[#0F8178] transition-colors">
          Write
        </Link>
        <span>•</span>
        <a
          href="https://github.com/Mohitkumar7295/Social-Media-Platform"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[#0F8178] transition-colors"
        >
          GitHub
        </a>
        <div className="w-full text-[#999999] mt-1 font-mono text-[10px]">
          WriteSpace © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
