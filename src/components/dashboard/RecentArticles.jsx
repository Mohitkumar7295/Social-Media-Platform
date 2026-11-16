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
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-5 shadow-sm">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#242428] mb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-white tracking-tight">
            Articles & Drafts
          </h2>
          <p className="text-xs text-zinc-400">
            Real engagement and lifecycle management across your stories.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#18181c] p-1 rounded-xl border border-[#26262a] shrink-0 self-start sm:self-auto">
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
                  ? 'bg-[#222228] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article List */}
      {filteredArticles.length > 0 ? (
        <div className="divide-y divide-[#202024]">
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
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>

                    {article.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        {article.category}
                      </span>
                    )}

                    <span className="text-zinc-600 text-xs">•</span>

                    <span className="text-[11px] text-zinc-500">
                      {isPublished
                        ? `Published ${new Date(article.published_at || article.created_at).toLocaleDateString()}`
                        : `Edited ${new Date(article.updated_at || article.created_at).toLocaleDateString()}`}
                    </span>
                  </div>

                  <Link
                    to={isPublished ? `/p/${article.slug}` : `/write/${article.id}`}
                    className="font-serif font-bold text-base text-zinc-100 hover:text-[#FF6719] transition-colors line-clamp-1"
                  >
                    {article.title || 'Untitled Draft'}
                  </Link>

                  {(article.subtitle || article.excerpt) && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic">
                      {article.subtitle || article.excerpt}
                    </p>
                  )}

                  {/* Engagement Metrics (Only for published) */}
                  {isPublished && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1" title="Applauds">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span className="tabular-nums font-semibold text-zinc-300">
                          {article.likesCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1" title="Comments">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span className="tabular-nums font-semibold text-zinc-300">
                          {article.commentsCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1" title="Bookmarks">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span className="tabular-nums font-semibold text-zinc-300">
                          {article.bookmarksCount || 0}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-zinc-500">
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
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202026] transition-colors"
                      title="View Published Story"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    to={`/write/${article.id}`}
                    className="p-2 rounded-xl text-zinc-400 hover:text-[#FF6719] hover:bg-[#202026] transition-colors"
                    title="Edit Story"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {isPublished ? (
                    <button
                      type="button"
                      onClick={() => onUnpublish && onUnpublish(article.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-[#202026] transition-colors"
                      title="Unpublish to Drafts"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPublish && onPublish(article.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-[#202026] transition-colors"
                      title="Publish Now"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteRequest && onDeleteRequest(article)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
          <h3 className="font-serif font-bold text-base text-white mb-1">
            No {filter !== 'all' ? filter : 'articles'} found
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
            Start writing your next publication to reach readers across WriteSpace.
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Story</span>
          </Link>
        </div>
      )}
    </div>
  );
}
