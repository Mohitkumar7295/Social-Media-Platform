import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Edit3,
  Feather,
  Sparkles,
  ArrowUp,
  Globe,
  Share2,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { updateArticleSEO, resetSEO } from '../utils/seoUtils';
import ReadingProgressBar from '../components/reading/ReadingProgressBar';
import ReadingNavbar from '../components/reading/ReadingNavbar';
import TableOfContents from '../components/reading/TableOfContents';
import ArticleRenderer from '../components/reading/ArticleRenderer';
import RelatedArticles from '../components/reading/RelatedArticles';
import ShareButton from '../components/reading/ShareButton';
import UserAvatar from '../components/common/UserAvatar';

export default function ArticleReadingView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | '404' | 'network'

  // Table of Contents & Headings
  const [headings, setHeadings] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');

  // UI state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [socialNotice, setSocialNotice] = useState('');

  const articleContentRef = useRef(null);

  // Load article by slug
  const loadArticle = async () => {
    if (!slug) return;
    setIsLoading(true);
    setErrorState(null);

    try {
      const { post: data, error } = await postService.getPostBySlug(slug, user?.id || null);

      if (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          setErrorState('404');
        } else {
          setErrorState('network');
        }
      } else if (!data) {
        setErrorState('404');
      } else {
        setPost(data);
        updateArticleSEO(data);
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setErrorState('network');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticle();

    return () => {
      resetSEO();
    };
  }, [slug, user?.id]);

  // Track active heading and back to top visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Toggle back to top button
      if (window.scrollY > 450) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Track active heading
      if (headings.length > 0) {
        const headingElements = headings
          .map((h) => document.getElementById(h.id))
          .filter(Boolean);

        const scrollPosition = window.scrollY + 120;
        for (let i = headingElements.length - 1; i >= 0; i--) {
          const el = headingElements[i];
          if (el.offsetTop <= scrollPosition) {
            setActiveHeadingId(el.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const author = post?.author || {};
  const isAuthor = user?.id && post?.author_id === user.id;

  const formattedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft Story';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col">
        <ReadingNavbar post={null} />
        <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 bg-zinc-800 rounded-full w-28" />
          <div className="h-10 sm:h-14 bg-zinc-800 rounded-2xl w-4/5" />
          <div className="h-6 bg-zinc-800/60 rounded-xl w-3/5" />
          <div className="flex items-center gap-4 py-4 border-y border-[#202024]">
            <div className="w-12 h-12 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-32" />
              <div className="h-3 bg-zinc-800/60 rounded w-24" />
            </div>
          </div>
          <div className="h-72 bg-zinc-800/50 rounded-2xl w-full" />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-zinc-800/80 rounded w-full" />
            <div className="h-4 bg-zinc-800/80 rounded w-full" />
            <div className="h-4 bg-zinc-800/80 rounded w-4/5" />
          </div>
        </main>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (errorState === '404' || !post) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col">
        <ReadingNavbar post={null} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-5 shadow-lg">
            <Feather className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2.5">
            Story Not Found
          </h2>
          <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
            This article may have been removed, reverted to a private draft, or the link may be incorrect.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Feed</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <span>Explore Writers</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Network Error State
  if (errorState === 'network') {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col">
        <ReadingNavbar post={null} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="font-serif text-2xl font-bold text-white mb-2">Unable to Load Article</h2>
          <p className="text-zinc-400 text-sm max-w-sm mb-6">
            We encountered a network issue loading this story from the database.
          </p>
          <button
            type="button"
            onClick={loadArticle}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Main Article Reading Layout
  return (
    <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col selection:bg-orange-950/60 selection:text-orange-200">
      {/* Dynamic Reading Progress Bar at the very top */}
      <ReadingProgressBar targetRef={articleContentRef} />

      {/* Reading Minimal Navigation */}
      <ReadingNavbar post={post} />

      {/* Main Layout Container with Optional Desktop Table of Contents Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex justify-center gap-12">
        {/* Left Column: Desktop Table of Contents (Fixed sidebar) */}
        {headings.length > 0 && (
          <aside className="hidden lg:block shrink-0">
            <TableOfContents headings={headings} activeId={activeHeadingId} isMobile={false} />
          </aside>
        )}

        {/* Center Article Content Area */}
        <main ref={articleContentRef} className="max-w-3xl w-full flex flex-col">
          {/* Article Category Pill */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#18181c] border border-[#2a2a30] text-xs font-semibold text-[#FF6719]">
                {post.category}
              </span>
            </div>
          )}

          {/* Article Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-[1.15] mb-4">
            {post.title}
          </h1>

          {/* Article Subtitle */}
          {post.subtitle && (
            <p className="font-serif text-lg sm:text-xl text-zinc-400 leading-relaxed mb-6 italic">
              {post.subtitle}
            </p>
          )}

          {/* Author Card Info Bar */}
          <div className="flex items-center justify-between py-4 border-y border-[#202024] mb-8">
            <div className="flex items-center gap-3.5">
              <Link to={`/profile/${author.username}`} className="hover:opacity-90 transition-opacity">
                <UserAvatar
                  src={author.avatar_url}
                  name={author.full_name}
                  username={author.username}
                  size="md"
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${author.username}`}
                    className="text-sm font-semibold text-white hover:text-[#FF6719] transition-colors"
                  >
                    {author.full_name || 'Writer'}
                  </Link>
                  {!isAuthor && (
                    <button
                      type="button"
                      onClick={() => setSocialNotice('Follow')}
                      className="text-xs font-semibold text-[#FF6719] hover:text-orange-400 ml-1 transition-colors"
                    >
                      • Follow
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <Link to={`/profile/${author.username}`} className="hover:text-zinc-300">
                    @{author.username}
                  </Link>
                  <span>•</span>
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.reading_time || 1} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Author Edit or Social) */}
            <div className="flex items-center gap-2">
              {isAuthor && (
                <Link
                  to={`/write/${post.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#FF6719]" />
                  <span>Edit</span>
                </Link>
              )}

              <ShareButton
                title={post.title}
                text={post.excerpt}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1a1a20]"
                buttonText=""
              />
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden border border-[#242428] max-h-[460px] w-full mb-10 shadow-2xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Mobile Collapsible Table of Contents */}
          {headings.length > 0 && (
            <TableOfContents headings={headings} activeId={activeHeadingId} isMobile={true} />
          )}

          {/* Sanitized Article Body with Typography */}
          <ArticleRenderer
            content={post.content}
            onHeadingsExtracted={(h) => setHeadings(h)}
          />

          {/* Social Interaction Footer Bar */}
          <div className="flex items-center justify-between py-4 px-2 my-10 border-y border-[#202024] text-zinc-400 text-xs">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setSocialNotice('Likes')}
                className="flex items-center gap-2 hover:text-rose-400 transition-colors group"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Applaud</span>
              </button>

              <button
                type="button"
                onClick={() => setSocialNotice('Comments')}
                className="flex items-center gap-2 hover:text-blue-400 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Responses</span>
              </button>

              <ShareButton
                title={post.title}
                text={post.excerpt}
                className="hover:text-emerald-400"
                buttonText="Share story"
              />
            </div>

            <button
              type="button"
              onClick={() => setSocialNotice('Bookmarks')}
              className="hover:text-amber-400 transition-colors"
              title="Bookmark story"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Author Information Bio Card */}
          <section className="bg-[#141416] border border-[#242428] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <Link to={`/profile/${author.username}`} className="flex items-center gap-3.5 group">
                <UserAvatar
                  src={author.avatar_url}
                  name={author.full_name}
                  username={author.username}
                  size="lg"
                />
                <div>
                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#FF6719] transition-colors">
                    Written by {author.full_name}
                  </h3>
                  <p className="text-xs text-zinc-400">@{author.username}</p>
                </div>
              </Link>

              {!isAuthor && (
                <button
                  type="button"
                  onClick={() => setSocialNotice('Follow')}
                  className="px-5 py-2 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors shadow-sm"
                >
                  Follow Author
                </button>
              )}
            </div>

            {author.bio && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                {author.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-[#202024]">
              {author.website && (
                <a
                  href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-[#FF6719] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{author.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              <Link
                to={`/profile/${author.username}`}
                className="text-[#FF6719] hover:text-orange-400 font-semibold"
              >
                View all stories by {author.full_name} →
              </Link>
            </div>
          </section>

          {/* Related Articles ("More stories you might enjoy") */}
          <RelatedArticles currentPostId={post.id} category={post.category} />
        </main>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-[#1c1c20]/90 backdrop-blur-md border border-zinc-700/70 text-zinc-300 hover:text-white hover:bg-[#282830] shadow-2xl transition-all duration-200 z-40 hover:scale-105"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5 text-[#FF6719]" />
        </button>
      )}

      {/* Social Features Notice Modal */}
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
              Interactive social features (Likes & Comments in Phase 6, Follows in Phase 7) are scheduled next. WriteSpace never uses mock numbers or fake engagement.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSocialNotice('')}
                className="px-4 py-2 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
