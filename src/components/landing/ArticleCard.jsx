import React, { useState } from 'react';
import { Heart, MessageSquare, Bookmark, Clock, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';

export default function ArticleCard({ article, onReadStory }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likesCount);

  const handleLike = (e) => {
    e.stopPropagation();
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <article
      onClick={() => onReadStory && onReadStory(article)}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
        <img
          src={article.coverImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Floating Category Tag */}
        <div className="absolute top-3 left-3">
          <Badge variant="brand" className="backdrop-blur-md bg-white/90 shadow-sm font-semibold">
            {article.category}
          </Badge>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Reading Time & Date */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          {/* Article Title */}
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:text-brand-700 transition-colors mb-2.5">
            {article.title}
          </h3>

          {/* Short Description */}
          <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed mb-4">
            {article.description}
          </p>
        </div>

        {/* Card Footer: Author & Social Interactions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          {/* Author avatar & info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200"
            />
            <div className="truncate">
              <span className="block text-xs font-semibold text-stone-900 truncate">
                {article.author.name}
              </span>
              <span className="block text-[11px] text-stone-500 truncate">
                {article.author.handle}
              </span>
            </div>
          </div>

          {/* Engagement buttons */}
          <div className="flex items-center gap-3 text-stone-500 text-xs">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-rose-600 font-medium' : 'hover:text-stone-700'
              }`}
              aria-label="Like story"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                }`}
              />
              <span>{likeCount}</span>
            </button>

            <span className="flex items-center gap-1 text-stone-400">
              <MessageSquare className="w-4 h-4" />
              <span>{article.commentsCount}</span>
            </span>

            <button
              onClick={handleBookmark}
              className={`p-1 rounded transition-colors ${
                isBookmarked ? 'text-brand-700' : 'text-stone-400 hover:text-stone-700'
              }`}
              aria-label="Save story"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked ? 'fill-brand-700 text-brand-700' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
