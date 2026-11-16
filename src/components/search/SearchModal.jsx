import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Users, ArrowRight, Loader2 } from 'lucide-react';
import { searchService } from '../../services/searchService';
import UserAvatar from '../common/UserAvatar';
import FollowButton from '../profile/FollowButton';

/**
 * SearchModal Component
 * Interactive search dialog with live debounced search across stories and writers.
 */
export default function SearchModal({ isOpen, onClose, initialQuery = '' }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'stories' | 'writers'
  const [results, setResults] = useState({ articles: [], writers: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ articles: [], writers: [], total: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await searchService.searchAll(trimmed, { limit: 8 });
        setResults(res);
      } catch (err) {
        setResults({ articles: [], writers: [], total: 0 });
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showArticles = activeTab === 'all' || activeTab === 'stories';
  const showWriters = activeTab === 'all' || activeTab === 'writers';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white border border-[#E8EAE8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8EAE8] bg-white">
          <Search className="w-5 h-5 text-[#0F8178] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, or authors..."
            className="w-full bg-transparent text-[#201F1D] placeholder:text-stone-400 text-base focus:outline-none leading-relaxed"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-[#0F8178] animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-stone-400 hover:text-[#201F1D] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#777777] hover:text-[#201F1D] bg-[#F8FAF9] hover:bg-[#F0FAF8] border border-[#E8EAE8] transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Filter Tabs */}
        {query.trim() && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[#F8FAF9] border-b border-[#E8EAE8] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#0F8178] text-white shadow-xs'
                  : 'text-[#777777] hover:text-[#201F1D] hover:bg-white'
              }`}
            >
              All ({results.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                activeTab === 'stories'
                  ? 'bg-[#0F8178] text-white shadow-xs'
                  : 'text-[#777777] hover:text-[#201F1D] hover:bg-white'
              }`}
            >
              Stories ({results.articles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('writers')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                activeTab === 'writers'
                  ? 'bg-[#0F8178] text-white shadow-xs'
                  : 'text-[#777777] hover:text-[#201F1D] hover:bg-white'
              }`}
            >
              Writers ({results.writers.length})
            </button>
          </div>
        )}

        {/* Results Stream / Empty States */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-white scrollbar-thin">
          {!query.trim() ? (
            <div className="py-12 text-center text-[#777777] text-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E9F8F5] flex items-center justify-center text-[#0F8178]">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#201F1D] mb-1">Discover WriteSpace</p>
              <p>Type keywords to search published stories and community writers.</p>
            </div>
          ) : results.total === 0 && !isLoading ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <p className="font-medium text-sm text-[#201F1D] mb-1">No results found</p>
              <p className="text-[#777777]">
                We couldn't find any published stories or writers matching "{query}".
              </p>
            </div>
          ) : (
            <>
              {/* Writers Section */}
              {showWriters && results.writers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] mb-2.5 px-1">
                    Writers
                  </h4>
                  <div className="space-y-2">
                    {results.writers.map((writer) => (
                      <div
                        key={writer.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#E8EAE8] hover:border-[#0F8178]/30 hover:bg-[#F0FAF8] transition-colors"
                      >
                        <Link
                          to={`/profile/${writer.username}`}
                          onClick={onClose}
                          className="flex items-center gap-3 min-w-0 flex-1 group"
                        >
                          <UserAvatar
                            src={writer.avatar_url}
                            name={writer.full_name || writer.username}
                            username={writer.username}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#201F1D] group-hover:text-[#0F8178] transition-colors truncate">
                              {writer.full_name || writer.username}
                            </p>
                            <p className="text-xs text-[#777777] truncate">@{writer.username}</p>
                            {writer.bio && (
                              <p className="text-xs text-[#555555] line-clamp-1 mt-0.5">
                                {writer.bio}
                              </p>
                            )}
                          </div>
                        </Link>

                        <FollowButton
                          targetUserId={writer.id}
                          size="xs"
                          className="shrink-0 ml-3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories Section */}
              {showArticles && results.articles.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] mb-2.5 px-1">
                    Stories
                  </h4>
                  <div className="space-y-2.5">
                    {results.articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/p/${article.slug}`}
                        onClick={onClose}
                        className="block p-4 rounded-xl bg-[#F8FAF9] border border-[#E8EAE8] hover:border-[#0F8178]/30 hover:bg-[#F0FAF8] transition-all group"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-[#777777] mb-1.5">
                          {article.author && (
                            <span className="font-semibold text-[#201F1D]">
                              {article.author.full_name || article.author.username}
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-[#0F8178] font-medium">{article.category || 'General'}</span>
                          <span>•</span>
                          <span>{article.reading_time || 1} min read</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#201F1D] group-hover:text-[#0F8178] transition-colors leading-snug">
                          {article.title}
                        </h4>
                        {(article.excerpt || article.subtitle) && (
                          <p className="text-xs text-[#555555] line-clamp-2 mt-1 leading-relaxed">
                            {article.excerpt || article.subtitle}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
