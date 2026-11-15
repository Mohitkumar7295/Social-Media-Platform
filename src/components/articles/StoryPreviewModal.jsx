import React, { useEffect, useState } from 'react';
import { X, Heart, Bookmark, Clock, Share2, Feather, Check } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function StoryPreviewModal({ article, onClose, onOpenAuth }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (article) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Reader Modal Sheet */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{article.category}</Badge>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
              title="Share Story"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Content Area */}
        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Headline */}
          <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            {article.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-stone-600 font-serif italic border-l-2 border-brand-600 pl-4 py-1">
            "{article.description}"
          </p>

          {/* Author Card */}
          <div className="flex items-center justify-between py-4 border-t border-b border-stone-100">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-100"
              />
              <div>
                <div className="text-sm font-bold text-stone-900">{article.author.name}</div>
                <div className="text-xs text-stone-500">{article.author.handle} · Published {article.publishedAt}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuth('get-started')}
            >
              Follow
            </Button>
          </div>

          {/* Cover Hero Image */}
          <div className="rounded-2xl overflow-hidden aspect-[16/9] w-full bg-stone-100 shadow-inner">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Editorial Long-form Body Text Sample */}
          <div className="font-serif text-stone-800 text-base sm:text-lg leading-relaxed space-y-4 pt-4">
            <p>
              In contemporary digital life, attention has become our most contested asset. We navigate continuous algorithmic streams designed not for depth, but for compulsive reactivation. Yet, thoughtful synthesis requires stillness.
            </p>
            <p>
              When we write with intentionality, we are not merely assembling arguments—we are constructing conceptual homes for ideas to mature. As readers on WriteSpace, we reject shallow skim-reading in favor of intentional engagement.
            </p>
            <blockquote className="my-6 p-4 rounded-xl bg-stone-50 border-l-4 border-brand-700 text-stone-700 italic">
              "To read deeply is to step inside another consciousness with patient curiosity. To write deeply is an act of intellectual hospitality."
            </blockquote>
            <p>
              Full article publishing, commenting, and following features will activate in upcoming phases backed by our secure InsForge PostgreSQL infrastructure.
            </p>
          </div>

          {/* Sticky Reader Engagement Footer */}
          <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                  isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{article.likesCount + (isLiked ? 1 : 0)} Likes</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-full border transition-all ${
                  isBookmarked
                    ? 'bg-brand-50 border-brand-200 text-brand-700'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
                title="Bookmark for later"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-brand-700' : ''}`} />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Feather}
              onClick={() => {
                onClose();
                onOpenAuth('get-started');
              }}
            >
              Start Writing on WriteSpace
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
