import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

/**
 * NotificationBadge Component
 * Shows real unread notification count badge on navigation icons.
 * Auto-refreshes periodically or when focus changes.
 */
export default function NotificationBadge({ className = '' }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchUnread() {
      if (!user?.id) {
        setUnreadCount(0);
        return;
      }

      try {
        const { count } = await notificationService.getUnreadCount(user.id);
        if (isMounted) {
          setUnreadCount(count || 0);
        }
      } catch (err) {
        // Silent fail
      }
    }

    fetchUnread();

    // Poll every 30 seconds for background refresh
    const interval = setInterval(fetchUnread, 30000);

    const handleFocus = () => fetchUnread();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  if (unreadCount <= 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-[#0F8178] rounded-full min-w-[16px] h-[16px] leading-none shadow-xs ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
