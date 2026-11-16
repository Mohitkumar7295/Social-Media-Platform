import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Sparkles,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import UserAvatar from '../components/common/UserAvatar';
import LikeButton from '../components/interactions/LikeButton';
import BookmarkButton from '../components/interactions/BookmarkButton';
import FollowButton from '../components/profile/FollowButton';
import SearchModal from '../components/search/SearchModal';
import { recommendationService } from '../services/recommendationService';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';

/**
 * Phase 8 Explore Page
 * Discovers published stories, trending articles, topic categories, and recommended writers.
 * Fully backed by InsForge PostgreSQL with zero mock data.
 */
export default function Explore() {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'writers'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [writers, setWriters] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isLoadingWriters, setIsLoadingWriters] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState('');

  // 1. Fetch published articles and extract categories
  useEffect(() => {
    let isMounted = true;

    async function loadExploreArticles() {
      setIsLoadingArticles(true);
      try {
        let query = insforge.database
          .from('posts')
          .select('*, author:profiles(*)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50);

        if (selectedCategory && selectedCategory !== 'All') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;

        if (isMounted) {
          if (!error && data) {
            setArticles(data);

            // Extract dynamic unique categories from published articles if on 'All'
            if (selectedCategory === 'All') {
              const uniqueCats = new Set(['All']);
              data.forEach((p) => {
                if (p.category && typeof p.category === 'string') {
                  uniqueCats.add(p.category.trim());
                }
              });
              setCategories(Array.from(uniqueCats));
            }
          } else {
            setArticles([]);
          }
          setIsLoadingArticles(false);
        }
      } catch (err) {
        if (isMounted) {
          setArticles([]);
          setIsLoadingArticles(false);
        }
      }
    }

    loadExploreArticles();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // 2. Fetch recommended writers
  useEffect(() => {
    let isMounted = true;

    async function loadWriters() {
      setIsLoadingWriters(true);
      try {
        const { recommendations } = await recommendationService.getRecommendedWriters(
          user?.id,
          15
        );

        if (isMounted) {
          setWriters(recommendations || []);
          setIsLoadingWriters(false);
        }
      } catch (err) {
        if (isMounted) {
          setWriters([]);
          setIsLoadingWriters(false);
        }
      }
    }

    loadWriters();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Client-side text filtering for quick in-page filtering
  const filteredArticles = articles.filter((a) => {
    if (!clientFilter.trim()) return true;
    const q = clientFilter.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q) ||
      a.author?.full_name?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const filteredWriters = writers.filter((w) => {
    if (!clientFilter.trim()) return true;
    const q = clientFilter.toLowerCase();
    return (
      w.full_name?.toLowerCase().includes(q) ||
      w.username?.toLowerCase().includes(q) ||
      w.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout activeNav="explore">
      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E9F8F5] flex items-center justify-center text-[#0F8178]">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#201F1D] tracking-tight">
              Explore WriteSpace
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0FAF8] text-[#201F1D] hover:text-[#0F8178] text-xs font-medium border border-[#E8EAE8] shadow-2xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#0F8178]" />
            <span>Global Search</span>
          </button>
        </div>
        <p className="text-xs text-[#777777]">
          Discover stories, emerging ideas, and inspiring writers across the network.
        </p>
      </div>

      {/* Quick Search Bar */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          placeholder="Filter stories and writers on this page (or click Global Search)..."
          className="w-full bg-white border border-[#E8EAE8] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#201F1D] placeholder:text-stone-400 focus:outline-none focus:border-[#0F8178] shadow-2xs transition-all"
        />
        {clientFilter && (
          <button
            type="button"
            onClick={() => setClientFilter('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777777] hover:text-[#201F1D]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Navigation Tabs: Stories vs Writers */}
      <div className="flex items-center justify-between border-b border-[#E8EAE8] mb-5">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 relative ${
              activeTab === 'stories' ? 'text-[#0F8178]' : 'text-[#777777] hover:text-[#201F1D]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Stories</span>
            {activeTab === 'stories' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F8178] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('writers')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 relative ${
              activeTab === 'writers' ? 'text-[#0F8178]' : 'text-[#777777] hover:text-[#201F1D]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Writers to Follow</span>
            {activeTab === 'writers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F8178] rounded-full" />
            )}
          </button>
        </div>

        {activeTab === 'stories' && (
          <span className="text-xs text-[#777777] pb-3">
            {filteredArticles.length} published {filteredArticles.length === 1 ? 'story' : 'stories'}
          </span>
        )}
      </div>

      {/* Category Pills */}
      {activeTab === 'stories' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#0F8178] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F0FAF8] text-[#555555] hover:text-[#201F1D] border border-[#E8EAE8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* STORIES TAB CONTENT */}
      {activeTab === 'stories' && (
        <div>
          {isLoadingArticles ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E8EAE8] rounded-2xl p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100" />
                    <div className="h-3.5 bg-stone-100 rounded w-28" />
                  </div>
                  <div className="h-5 bg-stone-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-100/70 rounded w-full mb-3" />
                  <div className="h-3 bg-stone-100/50 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const author = article.author || {};

                return (
                  <article
                    key={article.id}
                    className="bg-white border border-[#E8EAE8] rounded-2xl p-5 hover:border-[#0F8178]/30 hover:shadow-xs transition-all group flex flex-col sm:flex-row gap-5 justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Author Header */}
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <Link
                          to={`/profile/${author.username || ''}`}
                          className="hover:opacity-90 transition-opacity"
                        >
                          <UserAvatar
                            src={author.avatar_url}
                            name={author.full_name || author.username}
                            username={author.username}
                            size="xs"
                          />
                        </Link>
                        <Link
                          to={`/profile/${author.username || ''}`}
                          className="text-xs font-semibold text-[#201F1D] hover:text-[#0F8178] transition-colors"
                        >
                          {author.full_name || author.username}
                        </Link>
                        <span className="text-stone-300 text-xs">•</span>
                        <span className="text-[11px] text-[#777777]">
                          {new Date(article.published_at || article.created_at).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>

                      {/* Title & Excerpt */}
                      <Link to={`/p/${article.slug}`}>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#201F1D] group-hover:text-[#0F8178] transition-colors leading-snug mb-1.5 line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      {(article.excerpt || article.subtitle) && (
                        <p className="text-xs sm:text-sm text-[#555555] line-clamp-2 leading-relaxed mb-3">
                          {article.excerpt || article.subtitle}
                        </p>
                      )}

                      {/* Meta actions */}
                      <div className="flex items-center justify-between text-xs text-[#777777] pt-2 border-t border-[#E8EAE8]">
                        <div className="flex items-center gap-3">
                          {article.category && (
                            <button
                              type="button"
                              onClick={() => setSelectedCategory(article.category)}
                              className="px-2.5 py-0.5 rounded-full bg-[#E9F8F5] hover:bg-[#d8f4ee] text-[#0F8178] text-[11px] font-medium border border-[#0F8178]/20 transition-colors"
                            >
                              {article.category}
                            </button>
                          )}
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            {article.reading_time || 1} min read
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <LikeButton postId={article.id} size="sm" />
                          <BookmarkButton postId={article.id} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Cover Image */}
                    {article.cover_image_url && (
                      <Link
                        to={`/p/${article.slug}`}
                        className="w-full sm:w-36 sm:h-28 rounded-xl overflow-hidden border border-[#E8EAE8] shrink-0"
                      >
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#E8EAE8] rounded-2xl p-10 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E9F8F5] flex items-center justify-center text-[#0F8178]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#201F1D] mb-1">No Stories Found</h3>
              <p className="text-xs text-[#777777] mb-4">
                {selectedCategory !== 'All'
                  ? `No published stories found under "${selectedCategory}".`
                  : 'Be the first writer to publish a story on WriteSpace!'}
              </p>
              {selectedCategory !== 'All' ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 rounded-full bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#201F1D] text-xs font-medium border border-[#E8EAE8] transition-colors"
                >
                  View All Categories
                </button>
              ) : (
                <Link
                  to="/write"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Write a Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* WRITERS TAB CONTENT */}
      {activeTab === 'writers' && (
        <div>
          {isLoadingWriters ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E8EAE8] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-40" />
                    <div className="h-3 bg-stone-100/70 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWriters.length > 0 ? (
            <div className="space-y-3">
              {filteredWriters.map((writer) => {
                const isSelf = writer.id === user?.id;

                return (
                  <div
                    key={writer.id}
                    className="bg-white border border-[#E8EAE8] rounded-2xl p-4 flex items-center justify-between hover:border-[#0F8178]/30 hover:bg-[#F0FAF8]/40 transition-colors"
                  >
                    <Link
                      to={`/profile/${writer.username}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1 mr-3 group"
                    >
                      <UserAvatar
                        src={writer.avatar_url}
                        name={writer.full_name}
                        username={writer.username}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-[#201F1D] group-hover:text-[#0F8178] transition-colors truncate">
                            {writer.full_name}
                          </h4>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E9F8F5] text-[#0F8178] font-medium border border-[#0F8178]/20">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#777777] truncate">@{writer.username}</p>
                        {writer.bio && (
                          <p className="text-xs text-[#555555] mt-1 line-clamp-1">{writer.bio}</p>
                        )}
                      </div>
                    </Link>

                    {!isSelf && (
                      <FollowButton
                        targetUserId={writer.id}
                        username={writer.username}
                        size="sm"
                        variant="outline"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#E8EAE8] rounded-2xl p-10 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E9F8F5] flex items-center justify-center text-[#0F8178]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#201F1D] mb-1">No Writers Found</h3>
              <p className="text-xs text-[#777777]">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
