import React from 'react';

/**
 * DashboardStatCard Component
 * Displays a single writer metric card with dark charcoal styling and clean typography.
 */
export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-[#0F8178]',
  iconBg = 'bg-[#E9F8F5] border-[#0F8178]/20',
  subText = null,
}) {
  return (
    <div className="bg-white border border-[#E8EAE8] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#0F8178]/30 hover:shadow-xs transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#777777] group-hover:text-[#201F1D] transition-colors">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div>
        <div className="font-serif text-2xl sm:text-3xl font-bold text-[#201F1D] tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subText && (
          <p className="text-[11px] text-[#777777] mt-1 truncate">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}
