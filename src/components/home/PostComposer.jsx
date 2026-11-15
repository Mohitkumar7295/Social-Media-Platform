import React, { useState } from 'react';
import { Image, Sparkles, Send, PenLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';

export default function PostComposer() {
  const { user, profile } = useAuth();
  const [showNotice, setShowNotice] = useState(false);

  return (
    <>
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
              onClick={() => setShowNotice(true)}
              className="w-full text-left py-2.5 px-4 rounded-xl bg-[#1c1c20] hover:bg-[#222226] text-zinc-400 hover:text-zinc-200 text-sm transition-colors border border-transparent hover:border-[#2e2e34]"
            >
              What's on your mind?
            </button>

            {/* Quick action bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#202024]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotice(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e22] transition-colors"
                >
                  <Image className="w-4 h-4 text-zinc-500" />
                  <span>Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNotice(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e22] transition-colors"
                >
                  <PenLine className="w-4 h-4 text-zinc-500" />
                  <span>Draft Story</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowNotice(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal notice for Phase 4 Composer */}
      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#18181c] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Full Post Composer in Phase 4
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              WriteSpace is built step-by-step. In **Phase 4**, this composer will connect to the PostgreSQL `posts` table with rich text, markdown preview, image attachments, and instant publishing.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                className="px-5 py-2.5 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-sm transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
