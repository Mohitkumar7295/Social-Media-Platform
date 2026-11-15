import React from 'react';
import { MessageSquare, Sparkles, Send } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';

export default function Chat() {
  return (
    <AppLayout activeNav="chat">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-[#FF6719]" />
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Writer & Reader Chat
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Direct messaging and community discussions on WriteSpace.
        </p>
      </div>

      <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-5">
          <MessageSquare className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-white mb-2">
          Community Chat is Coming in Phase 8
        </h3>

        <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
          WriteSpace will feature real-time InsForge chat channels between publication subscribers and authors. Chat threads and 1-on-1 conversations are scheduled for **Phase 8**.
        </p>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c20] border border-zinc-700/60 text-xs text-zinc-300">
          <Sparkles className="w-4 h-4 text-[#FF6719]" />
          <span>Realtime WebSockets & Presence will power this feature</span>
        </div>
      </div>
    </AppLayout>
  );
}
