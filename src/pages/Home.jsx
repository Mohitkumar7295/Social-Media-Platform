import React, { useState, useEffect } from 'react';
import AppLayout from '../components/home/AppLayout';
import PostComposer from '../components/home/PostComposer';
import FeedTabs from '../components/home/FeedTabs';
import FeedCard from '../components/home/FeedCard';
import EmptyFeedState from '../components/home/EmptyFeedState';
import { feedService } from '../services/feedService';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      setIsLoading(true);
      try {
        let result;
        if (activeTab === 'for-you') {
          result = await feedService.getForYouFeed({ page: 1, limit: 15 });
        } else {
          result = await feedService.getFollowingFeed({
            currentUserId: user?.id,
            page: 1,
            limit: 15,
          });
        }

        if (isMounted) {
          setPosts(result?.posts || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading feed:', err);
        if (isMounted) {
          setPosts([]);
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [activeTab, user?.id]);

  const authorFirstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Writer';

  return (
    <AppLayout activeNav="home">
      {/* Welcome Heading */}
      <div className="mb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#201F1D] tracking-tight">
          Welcome back, {authorFirstName}
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-1">
          Explore thoughtful perspectives and publish stories to your readership.
        </p>
      </div>

      {/* 1. Post Composer Card */}
      <PostComposer />

      {/* 2. Feed Tabs: For You vs Following */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Feed Posts / Empty State */}
      {isLoading ? (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8EAE8] rounded-2xl p-5 shadow-xs animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-stone-200 rounded w-32" />
                  <div className="h-2.5 bg-stone-100 rounded w-20" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4.5 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-3 bg-stone-100 rounded w-2/3" />
              </div>
              <div className="h-8 bg-stone-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyFeedState tab={activeTab} />
      )}
    </AppLayout>
  );
}
