import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Clock,
  Sparkles,
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

export default function FeedCard({ post }) {
  const [showInteractionNotice, setShowInteractionNotice] = useState(false);
  const [interactionName, setInteractionName] = useState('');

  if (!post) return null;

  const author = post.author || {};
  const authorName = author.full_name || 'Anonymous Author';
  const authorUsername = author.username || 'writer';

  const handleInteraction = (name) => {
    setInteractionName(name);
    setShowInteractionNotice(true);
  };

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <>
      <article className="bg-[#141416] border border-[#242428] rounded-2xl p-5 mb-4 hover:border-[#303038] transition-all duration-150">
        {/* Header: Author Info */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${authorUsername}`} className="hover:opacity-90 transition-opacity">
              <UserAvatar
                src={author.avatar_url}
                name={authorName}
                username={authorUsername}
                size="md"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${authorUsername}`}
                  className="font-semibold text-sm text-zinc-100 hover:text-white transition-colors"
                >
                  {authorName}
                </Link>
                <span className="text-zinc-500 text-xs">•</span>
                <span className="text-xs text-zinc-400">{formattedDate}</span>
              </div>
              <p className="text-xs text-zinc-400">@{authorUsername}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleInteraction('Options')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e24] transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {post.title && (
            <Link to={post.slug ? `/story/${post.slug}` : '#'}>
              <h3 className="font-serif text-xl font-bold text-white mb-1.5 tracking-tight hover:text-[#FF6719] transition-colors leading-snug">
                {post.title}
              </h3>
            </Link>
          )}

          {(post.excerpt || post.content) && (
            <Link to={post.slug ? `/story/${post.slug}` : '#'}>
              <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                {post.excerpt || post.content.replace(/<[^>]*>/g, ' ')}
              </p>
            </Link>
          )}

          {post.cover_image_url && (
            <Link to={post.slug ? `/story/${post.slug}` : '#'}>
              <div className="mt-3 rounded-xl overflow-hidden border border-[#26262a] max-h-72">
                <img
                  src={post.cover_image_url}
                  alt={post.title || 'Post cover'}
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200"
                />
              </div>
            </Link>
          )}

          {/* Metadata pill */}
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
            {post.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e1e24] text-zinc-300 font-medium">
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time || 1} min read
            </span>
          </div>
        </div>

        {/* Footer: Interactions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#202024] text-zinc-400 text-xs">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleInteraction('Likes')}
              className="flex items-center gap-1.5 hover:text-rose-400 transition-colors group"
            >
              <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Like</span>
            </button>

            <button
              type="button"
              onClick={() => handleInteraction('Comments')}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Comment</span>
            </button>

            <button
              type="button"
              onClick={() => handleInteraction('Share')}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleInteraction('Save Bookmark')}
            className="hover:text-amber-400 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Interaction notice modal */}
      {showInteractionNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18181c] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif font-bold text-white mb-1.5">
              {interactionName} Coming in Future Phases
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              Social interactions like likes, comments, and restacks are scheduled for Phase 6 & Phase 7. WriteSpace strictly avoids fake counters or mock interaction data.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowInteractionNotice(false)}
                className="px-4 py-2 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
