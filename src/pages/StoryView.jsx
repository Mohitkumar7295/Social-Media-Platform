import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit3,
  Feather,
  Sparkles,
  UserPlus,
  Compass,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import UserAvatar from '../components/common/UserAvatar';

export default function StoryView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [socialNotice, setSocialNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStory() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const { post: data, error } = await postService.getPostBySlug(slug);
        if (isMounted) {
          if (error || !data) {
            setNotFound(true);
          } else {
            setPost(data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setNotFound(true);
          setIsLoading(false);
        }
      }
    }

    loadStory();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const author = post?.author || {};
  const isAuthor = user?.id && post?.author_id === user.id;

  const formattedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-zinc-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF6719] border-t-transparent animate-spin mr-3" />
        <span className="font-serif">Loading story...</span>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-4">
          <Feather className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-white mb-2">Story Not Found</h2>
        <p className="text-zinc-400 text-sm max-w-sm mb-6">
          This article might be in draft mode, deleted, or the URL might be mistyped.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Feed</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col selection:bg-orange-950/60 selection:text-orange-200">
      {/* Editorial Story Header */}
      <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-[#222226] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-[#1c1c22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <Link to="/home" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-[#FF6719] flex items-center justify-center text-white">
              <Feather className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif font-bold text-base hidden sm:inline">WriteSpace</span>
          </Link>
        </div>

        {/* Right action */}
        <div className="flex items-center gap-3">
          {isAuthor ? (
            <Link
              to={`/write/${post.id}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#FF6719]" />
              <span>Edit Story</span>
            </Link>
          ) : (
            <Link
              to="/explore"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Editorial Story Article */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col">
        {/* Category Pill */}
        {post.category && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1e] border border-zinc-800 text-xs font-semibold text-[#FF6719]">
              {post.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="font-serif text-lg sm:text-xl text-zinc-400 leading-relaxed mb-6 italic">
            {post.subtitle}
          </p>
        )}

        {/* Author Card Info Bar */}
        <div className="flex items-center justify-between py-4 border-y border-[#202024] mb-8">
          <Link
            to={`/profile/${author.username}`}
            className="flex items-center gap-3.5 group hover:opacity-90 transition-opacity"
          >
            <UserAvatar
              src={author.avatar_url}
              name={author.full_name}
              username={author.username}
              size="md"
            />
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-[#FF6719] transition-colors">
                {author.full_name || 'Writer'}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>@{author.username}</span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.reading_time || 1} min read
                </span>
              </div>
            </div>
          </Link>

          {/* Social Bar (Quick) */}
          <div className="flex items-center gap-2 text-zinc-400">
            <button
              type="button"
              onClick={() => setSocialNotice('Likes')}
              className="p-2 rounded-xl hover:text-rose-400 hover:bg-[#1a1a20] transition-colors"
              title="Like"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSocialNotice('Comments')}
              className="p-2 rounded-xl hover:text-blue-400 hover:bg-[#1a1a20] transition-colors"
              title="Comment"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSocialNotice('Share')}
              className="p-2 rounded-xl hover:text-emerald-400 hover:bg-[#1a1a20] transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden border border-[#242428] max-h-96 w-full mb-10 shadow-xl">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article
          className="prose prose-invert max-w-none font-serif text-lg leading-relaxed text-zinc-200"
          dangerouslySetInnerHTML={{ __html: post.content || '<p><i>No content published.</i></p>' }}
        />

        {/* Bottom Author Bio Footer Card */}
        <div className="mt-14 pt-8 border-t border-[#242428] bg-[#141416] border border-[#242428] rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Link to={`/profile/${author.username}`}>
              <UserAvatar
                src={author.avatar_url}
                name={author.full_name}
                username={author.username}
                size="lg"
              />
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Written by {author.full_name}
                  </h3>
                  <p className="text-xs text-zinc-400">@{author.username}</p>
                </div>
                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => setSocialNotice('Follow')}
                    className="px-4 py-1.5 rounded-full bg-[#1f1f24] hover:bg-[#282830] text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
                  >
                    Follow
                  </button>
                )}
              </div>
              {author.bio && (
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{author.bio}</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Social Notice Modal */}
      {socialNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18181c] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-serif font-bold text-white mb-1.5">
              {socialNotice} Coming in Future Phases
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              Interactive social features (Likes, Comments in Phase 6, Follows in Phase 7) will be connected to real InsForge event streams without simulated counts.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSocialNotice('')}
                className="px-4 py-2 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
