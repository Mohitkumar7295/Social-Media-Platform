import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { postService } from '../../services/postService';
import UserAvatar from '../common/UserAvatar';

export default function RelatedArticles({ currentPostId, category }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRelated() {
      if (!currentPostId) return;
      setIsLoading(true);
      try {
        const { posts } = await postService.getRelatedPosts({
          currentPostId,
          category,
          limit: 3,
        });

        if (isMounted) {
          setRelatedPosts(posts || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setRelatedPosts([]);
          setIsLoading(false);
        }
      }
    }

    loadRelated();

    return () => {
      isMounted = false;
    };
  }, [currentPostId, category]);

  if (isLoading) {
    return (
      <div className="mt-16 pt-10 border-t border-[#E8EAE8]">
        <div className="h-6 bg-stone-100 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E8EAE8] rounded-2xl p-4 animate-pulse space-y-3"
            >
              <div className="h-32 bg-stone-100 rounded-xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100/70 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null; // Do not render section if no other stories exist yet
  }

  return (
    <section className="mt-16 pt-10 border-t border-[#E8EAE8]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#201F1D] tracking-tight">
            More stories you might enjoy
          </h3>
          <p className="text-xs text-[#777777] mt-0.5">
            Recommended articles from thinkers across WriteSpace.
          </p>
        </div>

        <Link
          to="/explore"
          className="text-xs font-semibold text-[#0F8178] hover:text-[#086B64] flex items-center gap-1 transition-colors"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((story) => {
          const author = story.author || {};
          return (
            <Link
              key={story.id}
              to={`/p/${story.slug}`}
              className="group bg-white border border-[#E8EAE8] hover:border-[#0F8178]/30 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-2xs"
            >
              <div>
                {/* Cover Image */}
                {story.cover_image_url ? (
                  <div className="rounded-xl overflow-hidden border border-[#E8EAE8] h-36 w-full mb-3.5">
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F8FAF9] border border-[#E8EAE8] h-36 w-full mb-3.5 flex items-center justify-center text-stone-300">
                    <BookOpen className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Category & Reading Time */}
                <div className="flex items-center gap-2 mb-2 text-[11px] text-[#777777]">
                  <span className="px-2 py-0.5 rounded-full bg-[#E9F8F5] text-[#0F8178] font-medium border border-[#0F8178]/20">
                    {story.category || 'General'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {story.reading_time || 1} min read
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-base text-[#201F1D] group-hover:text-[#0F8178] line-clamp-2 leading-snug mb-2 transition-colors">
                  {story.title}
                </h4>

                {/* Excerpt */}
                {story.excerpt && (
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-4">
                    {story.excerpt}
                  </p>
                )}
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-[#E8EAE8] mt-2">
                <UserAvatar
                  src={author.avatar_url}
                  name={author.full_name}
                  username={author.username}
                  size="xs"
                />
                <span className="text-xs font-medium text-[#201F1D] truncate">
                  {author.full_name || 'Writer'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
