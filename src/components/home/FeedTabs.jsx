import React from 'react';
import { Sparkles, Users } from 'lucide-react';

export default function FeedTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'following', label: 'Following', icon: Users },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-[#E8EAE8] mb-6 px-1">
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
                ? 'text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F8178]' : 'text-[#777777]'}`} />
            <span>{tab.label}</span>

            {/* Active underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F8178] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
