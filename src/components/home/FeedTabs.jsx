import React from 'react';
import { Sparkles, Users } from 'lucide-react';

export default function FeedTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'following', label: 'Following', icon: Users },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-[#242428] mb-6 px-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
              isActive
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6719]' : 'text-zinc-500'}`} />
            <span>{tab.label}</span>

            {/* Active underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6719] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
