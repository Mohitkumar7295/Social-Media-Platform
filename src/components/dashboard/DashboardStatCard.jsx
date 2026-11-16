import React from 'react';

/**
 * DashboardStatCard Component
 * Displays a single writer metric card with dark charcoal styling and clean typography.
 */
export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-[#FF6719]',
  iconBg = 'bg-orange-500/10 border-orange-500/20',
  subText = null,
}) {
  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#32323a] transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div>
        <div className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subText && (
          <p className="text-[11px] text-zinc-500 mt-1 truncate">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}
