import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, PenLine, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function EmptyFeedState({ tab = 'for-you' }) {
  const isFollowingTab = tab === 'following';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E8EAE8] rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center my-4 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] flex items-center justify-center mb-4.5 shadow-xs">
        <BookOpen className="w-7 h-7" />
      </div>

      <h3 className="font-serif text-2xl font-bold text-[#201F1D] mb-2 tracking-tight">
        {isFollowingTab ? 'No stories from followed writers yet' : 'Your reading journey starts here'}
      </h3>

      <p className="text-[#777777] text-sm max-w-md mx-auto leading-relaxed mb-6">
        {isFollowingTab
          ? "You haven't followed any writers who have published stories yet. Explore writers across the community or start your own publication."
          : 'Stories from thoughtful writers across WriteSpace will appear here. Be among the first to publish a new perspective or discover inspiring authors.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <Link
          to="/explore"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all duration-150"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Stories & Writers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => navigate('/write')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#E9F8F5] hover:bg-[#d8f3ed] text-[#0F8178] border border-[#0F8178]/20 text-xs font-semibold transition-all duration-150"
        >
          <PenLine className="w-4 h-4" />
          <span>Write a Story</span>
        </button>
      </div>
    </div>
  );
}
