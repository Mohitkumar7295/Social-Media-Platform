import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Sparkles,
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import LikeButton from '../interactions/LikeButton';
import BookmarkButton from '../interactions/BookmarkButton';
import { commentService } from '../../services/commentService';
import ShareButton from '../reading/ShareButton';

export default function FeedCard({ post }) {
  const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0);

  useEffect(() => {
    let isMounted = true;
    if (post?.id && post.comments_count === undefined) {
      commentService.getCommentCount(post.id).then((res) => {
        if (isMounted && !res.error && res.count !== undefined) {
          setCommentsCount(res.count);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [post?.id, post?.comments_count]);

  if (!post) return null;

  const author = post.author || {};
  const authorName = author.full_name || 'Anonymous Author';
  const authorUsername = author.username || 'writer';

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <article className="bg-white border border-[#E8EAE8] rounded-2xl p-5 mb-4 shadow-xs hover:border-[#0F8178]/40 hover:shadow-sm transition-all duration-150">
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
                className="font-semibold text-sm text-[#201F1D] hover:text-[#0F8178] transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-[#999999] text-xs">•</span>
              <span className="text-xs text-[#777777]">{formattedDate}</span>
            </div>
            <p className="text-xs text-[#777777]">@{authorUsername}</p>
          </div>
        </div>

        {post.category && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#E9F8F5] text-[#0F8178] text-[11px] font-semibold border border-[#0F8178]/20">
            {post.category}
          </span>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.title && (
          <Link to={post.slug ? `/p/${post.slug}` : '#'}>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#201F1D] mb-1.5 tracking-tight hover:text-[#0F8178] transition-colors leading-snug">
              {post.title}
            </h3>
          </Link>
        )}

        {(post.excerpt || post.content) && (
          <Link to={post.slug ? `/p/${post.slug}` : '#'}>
            <p className="text-sm text-[#555555] leading-relaxed line-clamp-3">
              {post.excerpt || post.content.replace(/<[^>]*>/g, ' ')}
            </p>
          </Link>
        )}

        {post.cover_image_url && (
          <Link to={post.slug ? `/p/${post.slug}` : '#'}>
            <div className="mt-3.5 rounded-xl overflow-hidden border border-[#E8EAE8] max-h-72">
              <img
                src={post.cover_image_url}
                alt={post.title || 'Post cover'}
                className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200"
              />
            </div>
          </Link>
        )}

        {/* Reading time */}
        <div className="flex items-center gap-3 mt-3 text-xs text-[#777777]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0F8178]" />
            <span>{post.reading_time || 1} min read</span>
          </span>
        </div>
      </div>

      {/* Footer: Interactions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8EAE8] text-[#777777] text-xs">
        <div className="flex items-center gap-5">
          <LikeButton postId={post.id} size="sm" />

          <Link
            to={post.slug ? `/p/${post.slug}#responses` : '#'}
            className="flex items-center gap-1.5 hover:text-[#0F8178] transition-colors group"
            title="View responses"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="tabular-nums font-medium">
              {commentsCount > 0 ? commentsCount.toLocaleString() : 'Comment'}
            </span>
          </Link>

          <ShareButton
            title={post.title}
            text={post.excerpt}
            className="p-0 text-[#777777] hover:text-[#0F8178] hover:bg-transparent"
            buttonText="Share"
          />
        </div>

        <BookmarkButton postId={post.id} size="sm" />
      </div>
    </article>
  );
}
