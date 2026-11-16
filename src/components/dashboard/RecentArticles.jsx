import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Eye,
  Edit3,
  Trash2,
  Heart,
  MessageCircle,
  Bookmark,
  Clock,
  Send,
  EyeOff,
  Plus,
} from 'lucide-react';

/**
 * RecentArticles Component
 * Writer's article management table with real database engagement counts.
 */
export default function RecentArticles({
  articles = [],
  onPublish,
  onUnpublish,
  onDeleteRequest,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'drafts'

  const filteredArticles = articles.filter((a) => {
    if (filter === 'published') return a.status === 'published';
    if (filter === 'drafts') return a.status === 'draft';
    return true;
  });

  return (
    <div className="bg-white border border-[#E8EAE8] rounded-2xl p-5 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8EAE8] mb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#201F1D] tracking-tight">
            Articles & Drafts
          </h2>
          <p className="text-xs text-[#777777]">
            Real engagement and lifecycle management across your stories.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F8FAF9] p-1 rounded-xl border border-[#E8EAE8] shrink-0 self-start sm:self-auto">
          {[
            { id: 'all', label: `All (${articles.length})` },
            {
              id: 'published',
              label: `Published (${articles.filter((a) => a.status === 'published').length})`,
            },
            {
              id: 'drafts',
              label: `Drafts (${articles.filter((a) => a.status === 'draft').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-white text-[#201F1D] shadow-2xs'
                  : 'text-[#777777] hover:text-[#201F1D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article List */}
      {filteredArticles.length > 0 ? (
        <div className="divide-y divide-[#E8EAE8]">
          {filteredArticles.map((article) => {
            const isPublished = article.status === 'published';

            return (
              <div
                key={article.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Info & Title */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isPublished
                          ? 'bg-[#E9F8F5] text-[#0F8178] border-[#0F8178]/25'
                          : 'bg-amber-50 text-amber-700 border-amber-200/70'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>

                    {article.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F8FAF9] text-[#555555] border border-[#E8EAE8]">
                        {article.category}
                      </span>
                    )}

                    <span className="text-stone-300 text-xs">•</span>

                    <span className="text-[11px] text-[#777777]">
                      {isPublished
                        ? `Published ${new Date(article.published_at || article.created_at).toLocaleDateString()}`
                        : `Edited ${new Date(article.updated_at || article.created_at).toLocaleDateString()}`}
                    </span>
                  </div>

                  <Link
                    to={isPublished ? `/p/${article.slug}` : `/write/${article.id}`}
                    className="font-serif font-bold text-base text-[#201F1D] hover:text-[#0F8178] transition-colors line-clamp-1"
                  >
                    {article.title || 'Untitled Draft'}
                  </Link>

                  {(article.subtitle || article.excerpt) && (
                    <p className="text-xs text-[#555555] mt-1 line-clamp-1 italic">
                      {article.subtitle || article.excerpt}
                    </p>
                  )}

                  {/* Engagement Metrics (Only for published) */}
                  {isPublished && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#777777]">
                      <span className="flex items-center gap-1" title="Applauds">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span className="tabular-nums font-semibold text-[#201F1D]">
                          {article.likesCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1" title="Comments">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                        <span className="tabular-nums font-semibold text-[#201F1D]">
                          {article.commentsCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1" title="Bookmarks">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                        <span className="tabular-nums font-semibold text-[#201F1D]">
                          {article.bookmarksCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-[#777777]">
                        <Clock className="w-3 h-3" />
                        {article.reading_time || 1} min
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  {isPublished && (
                    <Link
                      to={`/p/${article.slug}`}
                      className="p-2 rounded-xl text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                      title="View Published Story"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    to={`/write/${article.id}`}
                    className="p-2 rounded-xl text-[#777777] hover:text-[#0F8178] hover:bg-[#F0FAF8] transition-colors"
                    title="Edit Story"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {isPublished ? (
                    <button
                      type="button"
                      onClick={() => onUnpublish && onUnpublish(article.id)}
                      className="p-2 rounded-xl text-[#777777] hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Unpublish to Drafts"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPublish && onPublish(article.id)}
                      className="p-2 rounded-xl text-[#777777] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
                      title="Publish Now"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteRequest && onDeleteRequest(article)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E9F8F5] flex items-center justify-center text-[#0F8178]">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#201F1D] mb-1">
            No {filter !== 'all' ? filter : 'articles'} found
          </h3>
          <p className="text-xs text-[#777777] max-w-xs mx-auto mb-4">
            Start writing your next publication to reach readers across WriteSpace.
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Story</span>
          </Link>
        </div>
      )}
    </div>
  );
}
