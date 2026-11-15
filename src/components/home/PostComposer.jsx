import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Sparkles, Send, PenLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';

export default function PostComposer() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-4 shadow-sm hover:border-[#323238] transition-colors mb-6">
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
            className="w-full text-left py-2.5 px-4 rounded-xl bg-[#1c1c20] hover:bg-[#222226] text-zinc-400 hover:text-zinc-200 text-sm transition-colors border border-transparent hover:border-[#2e2e34]"
          >
            What's on your mind? Share an idea or story...
          </button>

          {/* Quick action bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#202024]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/write')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e22] transition-colors"
              >
                <PenLine className="w-4 h-4 text-[#FF6719]" />
                <span>Write Article</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e22] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>My Drafts</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/write')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow-sm transition-colors"
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
