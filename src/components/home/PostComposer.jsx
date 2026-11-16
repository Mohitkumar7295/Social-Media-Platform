import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, PenLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';

export default function PostComposer() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E8EAE8] rounded-2xl p-4.5 shadow-xs hover:border-[#0F8178]/30 transition-all mb-6">
      <div className="flex items-start gap-3.5">
        {/* User's dynamic profile avatar */}
        <UserAvatar
          src={profile?.avatar_url}
          name={profile?.full_name || user?.email}
          username={profile?.username}
          size="md"
        />

        {/* Composer prompt input */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => navigate('/write')}
            className="w-full text-left py-2.5 px-4 rounded-xl bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#777777] hover:text-[#201F1D] text-sm transition-colors border border-[#E8EAE8] hover:border-[#0F8178]/40"
          >
            What's on your mind? Share an idea or story...
          </button>

          {/* Quick action bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8EAE8]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/write')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#555555] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <PenLine className="w-4 h-4 text-[#0F8178]" />
                <span>Write Article</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#555555] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>My Drafts</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/write')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>Write</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
