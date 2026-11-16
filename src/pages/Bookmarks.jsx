import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Clock, Trash2, ArrowRight } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import UserAvatar from '../components/common/UserAvatar';
import BookmarkButton from '../components/interactions/BookmarkButton';
import { bookmarkService } from '../services/bookmarkService';
import { useAuth } from '../hooks/useAuth';

/**
 * Bookmarks Page
 * Displays the authenticated user's private saved stories reading list.
 */
export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks() {
      if (!user?.id) return;
      setIsLoading(true);

      try {
        const { bookmarks: data } = await bookmarkService.getUserBookmarks(user.id, {
          page: 1,
          limit: 50,
        });

        if (isMounted) {
          setBookmarks(data || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setBookmarks([]);
          setIsLoading(false);
        }
      }
    }

    loadBookmarks();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRemoveBookmark = (postId) => {
    setBookmarks((prev) => prev.filter((b) => b.post?.id !== postId && b.post_id !== postId));
  };

  return (
    <AppLayout activeNav="bookmarks">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Saved Stories{' '}
            <span className="font-sans text-sm font-normal text-zinc-400">
              ({bookmarks.length})
            </span>
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Your private reading list. Stories you bookmark are stored here for easy access.
        </p>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-5 animate-pulse flex flex-col sm:flex-row gap-5"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800" />
                  <div className="h-3.5 bg-zinc-800 rounded w-28" />
                </div>
                <div className="h-5 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800/60 rounded w-full" />
              </div>
              <div className="w-full sm:w-32 h-24 bg-zinc-800/40 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => {
            const post = bookmark.post;
            if (!post) return null;
            const author = post.author || {};

            return (
              <article
                key={bookmark.id}
                className="bg-[#141416] border border-[#242428] rounded-2xl p-5 hover:border-[#303038] transition-all group flex flex-col sm:flex-row gap-5 justify-between"
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
                      className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      {author.full_name || author.username}
                    </Link>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <Link to={`/p/${post.slug}`}>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-[#FF6719] transition-colors leading-snug mb-1.5 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  {(post.excerpt || post.subtitle) && (
                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {post.excerpt || post.subtitle}
                    </p>
                  )}

                  {/* Metadata and actions */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-[#202024]/60">
                    <div className="flex items-center gap-3">
                      {post.category && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1e1e24] text-zinc-300 text-[11px] font-medium">
                          {post.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        {post.reading_time || 1} min read
                      </span>
                    </div>

                    <BookmarkButton
                      postId={post.id}
                      initialIsBookmarked={true}
                      size="sm"
                      onBookmarkChange={({ isBookmarked }) => {
                        if (!isBookmarked) handleRemoveBookmark(post.id);
                      }}
                    />
                  </div>
                </div>

                {/* Cover Image thumbnail */}
                {post.cover_image_url && (
                  <Link
                    to={`/p/${post.slug}`}
                    className="w-full sm:w-40 sm:h-28 rounded-xl overflow-hidden border border-[#26262a] shrink-0"
                  >
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center my-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            No saved stories yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
            When you find stories you love on the home feed or explore, click the bookmark icon to save them to your private reading list.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Stories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
