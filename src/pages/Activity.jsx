import React from 'react';
import { Bell, Sparkles, Heart, MessageCircle, UserPlus } from 'lucide-react';
import AppLayout from '../components/home/AppLayout';

export default function Activity() {
  return (
    <AppLayout activeNav="activity">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-[#FF6719]" />
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Activity & Notifications
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Stay updated on likes, comments, and new subscribers.
        </p>
      </div>

      <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-5">
          <Bell className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-white mb-2">
          Notifications Center Arrives in Phase 6
        </h3>

        <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
          Real-time activity alerts for story applause, comments, mentions, and reader subscriptions will be activated in **Phase 6**. WriteSpace does not show simulated or mock alerts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-2">
          <div className="p-3 rounded-xl bg-[#1c1c20] border border-[#282830] text-center">
            <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-zinc-300">Likes & Restacks</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c20] border border-[#282830] text-center">
            <MessageCircle className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-zinc-300">Discussions</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c20] border border-[#282830] text-center">
            <UserPlus className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-zinc-300">Followers</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
