import React, { useState } from 'react';

/**
 * Reusable UserAvatar component
 * Renders real avatar image from InsForge Storage, falling back to name initials.
 */
export default function UserAvatar({
  src,
  name = '',
  username = '',
  size = 'md',
  className = '',
}) {
  const [imgError, setImgError] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Derive initials
  const displayName = name || username || 'U';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Consistent background color derived from username or name
  const bgColors = [
    'bg-orange-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-purple-600',
  ];
  const charCodeSum = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = bgColors[charCodeSum % bgColors.length];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={displayName}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 border border-stone-200/90 shadow-xs ${currentSizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none shadow-inner border border-white/10 ${bgColor} ${currentSizeClass} ${className}`}
    >
      {initials}
    </div>
  );
}
