import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ArrowRight } from 'lucide-react';

export default function EmptyFeedState({ tab = 'for-you' }) {
  const isFollowingTab = tab === 'following';

  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center flex flex-col items-center justify-center my-4 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-5 shadow-inner">
        <BookOpen className="w-8 h-8" />
      </div>

      <h3 className="font-serif text-2xl font-bold text-white mb-2.5 tracking-tight">
        Your reading journey starts here.
      </h3>

      <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
        {isFollowingTab
          ? "You haven't followed any writers with published stories yet. Explore writers in the community or browse recommendations on the right."
          : 'Be among the first to publish or discover stories on WriteSpace. Published articles from writers across the community will appear here.'}
      </p>

      <Link
        to="/explore"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white text-sm font-semibold shadow-md shadow-orange-950/40 transition-all duration-150"
      >
        <Compass className="w-4 h-4" />
        <span>Explore Writers & Topics</span>
        <ArrowRight className="w-4 h-4 ml-0.5" />
      </Link>
    </div>
  );
}
