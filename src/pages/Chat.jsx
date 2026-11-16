import React from 'react';
import { MessageSquare, Sparkles, Send } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';

export default function Chat() {
  return (
    <AppLayout activeNav="chat">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E9F8F5] text-[#0F8178] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#201F1D] tracking-tight">
            Writer & Reader Chat
          </h1>
        </div>
        <p className="text-xs text-[#777777]">
          Direct messaging and community discussions on WriteSpace.
        </p>
      </div>

      <div className="bg-white border border-[#E8EAE8] rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] flex items-center justify-center mb-5">
          <MessageSquare className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-[#201F1D] mb-2">
          Community Chat
        </h3>

        <p className="text-[#777777] text-sm max-w-md mx-auto leading-relaxed mb-6">
          WriteSpace will feature real-time InsForge chat channels between publication subscribers and authors. Chat threads and 1-on-1 conversations are powered by InsForge Realtime.
        </p>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F8FAF9] border border-[#E8EAE8] text-xs text-[#555555]">
          <Sparkles className="w-4 h-4 text-[#0F8178]" />
          <span>Realtime WebSockets & Presence will power this space</span>
        </div>
      </div>
    </AppLayout>
  );
}
