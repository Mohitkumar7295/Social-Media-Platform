import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Inbox,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import NotificationItem from '../components/notifications/NotificationItem';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

/**
 * Phase 9 Activity & Notifications Center
 * Full notification stream for follows, likes, comments, and replies.
 * Real PostgreSQL notifications table with live read/unread toggles.
 */
export default function Activity() {
  const { user } = useAuth();
  const currentUserId = user?.id || null;

  // Filter & State
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const PAGE_LIMIT = 25;

  const loadNotifications = useCallback(
    async (currentPage = 1, append = false) => {
      if (!currentUserId) return;
      if (!append) setIsLoading(true);

      try {
        const { notifications: data, total, unreadCount: unread } =
          await notificationService.getNotifications(currentUserId, {
            page: currentPage,
            limit: PAGE_LIMIT,
            unreadOnly: filter === 'unread',
          });

        setNotifications((prev) => (append ? [...prev, ...(data || [])] : data || []));
        setTotalCount(total || 0);
        setUnreadCount(unread || 0);
        setHasMore((currentPage * PAGE_LIMIT) < total);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId, filter]
  );

  useEffect(() => {
    setPage(1);
    loadNotifications(1, false);
  }, [loadNotifications]);

  // Handle Mark Single Notification As Read
  const handleMarkAsRead = async (notificationId) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await notificationService.markAsRead(notificationId, currentUserId);
  };

  // Handle Mark All As Read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await notificationService.markAllAsRead(currentUserId);
  };

  // Handle Delete Notification
  const handleDeleteNotification = async (notificationId) => {
    const target = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    await notificationService.deleteNotification(notificationId, currentUserId);
  };

  // Load next page
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, true);
  };

  return (
    <AppLayout activeNav="activity">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF6719]" />
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
              Activity & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF6719]/15 text-[#FF6719] border border-orange-500/20">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadNotifications(1, false);
              }}
              title="Refresh alerts"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1c1c22] border border-[#26262a] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181c] hover:bg-[#202026] text-zinc-300 hover:text-white text-xs font-medium border border-[#2a2a30] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#FF6719]" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Stay updated on reader applauds, comments, discussion replies, and new followers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-[#222226] mb-5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            filter === 'all' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>All</span>
          {filter === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6719] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
            filter === 'unread' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#FF6719]" />
          )}
          {filter === 'unread' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6719] rounded-full" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-2/3" />
                <div className="h-2.5 bg-zinc-800/60 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}

          {hasMore && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-5 py-2.5 rounded-full bg-[#18181c] hover:bg-[#202026] text-zinc-300 hover:text-white text-xs font-semibold border border-[#282830] transition-colors"
              >
                Load More Activity
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center my-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            {filter === 'unread' ? "You're all caught up!" : 'No activity yet'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
            {filter === 'unread'
              ? 'There are no unread notifications right now. Check back later or view all activity.'
              : 'When readers applaud your stories, comment on discussions, or follow your profile, alerts will arrive here in real time.'}
          </p>
          {filter === 'unread' ? (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <span>View All Activity</span>
            </button>
          ) : (
            <Link
              to="/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
            >
              <span>Publish a Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </AppLayout>
  );
}
