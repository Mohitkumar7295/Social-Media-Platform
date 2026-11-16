import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Heart,
  MessageCircle,
  Users,
  Bookmark,
  Plus,
  RefreshCw,
  AlertCircle,
  PenTool,
  Sparkles,
} from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RecentArticles from '../components/dashboard/RecentArticles';
import RecentActivity from '../components/dashboard/RecentActivity';
import { dashboardService } from '../services/dashboardService';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';

/**
 * Phase 9 Writer Dashboard
 * Provides comprehensive real-time publication analytics, draft/article management,
 * and recent reader activity. 100% database-backed with zero simulated metrics.
 */
export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    publishedCount: 0,
    draftCount: 0,
    likesCount: 0,
    commentsCount: 0,
    followersCount: 0,
    bookmarksCount: 0,
  });

  const [articles, setArticles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Deletion modal state
  const [deleteModalPost, setDeleteModalPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [statsRes, articlesRes, activityRes] = await Promise.all([
        dashboardService.getOverviewStats(user.id),
        dashboardService.getRecentArticles(user.id, { limit: 20 }),
        dashboardService.getRecentActivity(user.id, { limit: 10 }),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (articlesRes.articles) setArticles(articlesRes.articles);
      if (activityRes.activity) setActivity(activityRes.activity);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Unpublish
  const handleUnpublish = async (postId) => {
    const { error } = await postService.unpublishPost(postId);
    if (!error) {
      await loadDashboardData();
    }
  };

  // Handle Publish
  const handlePublish = async (postId) => {
    const { error } = await postService.publishPost(postId);
    if (!error) {
      await loadDashboardData();
    }
  };

  // Handle Confirm Delete
  const confirmDelete = async () => {
    if (!deleteModalPost) return;
    setIsDeleting(true);

    try {
      const { success } = await postService.deletePost(
        deleteModalPost.id,
        deleteModalPost.cover_image_key
      );
      if (success) {
        setDeleteModalPost(null);
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout activeNav="profile">
      {/* Dashboard Top Welcome Banner */}
      <div className="bg-white border border-[#E8EAE8] rounded-2xl p-6 sm:p-7 mb-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#0F8178]" />
              <span className="text-xs font-semibold text-[#0F8178] uppercase tracking-wider">
                Writer Studio
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#201F1D] tracking-tight">
              Welcome back, {profile?.full_name || 'Writer'}
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl">
              Track your publication engagement, manage your stories, and review recent reader interactions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadDashboardData();
              }}
              title="Refresh metrics"
              className="p-2.5 rounded-xl text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] border border-[#E8EAE8] bg-[#F8FAF9] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Write Story</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <DashboardStatCard
          label="Published Stories"
          value={stats.publishedCount}
          icon={FileText}
          iconColor="text-[#0F8178]"
          iconBg="bg-[#E9F8F5] border-[#0F8178]/20"
          subText="Live on public feed"
        />

        <DashboardStatCard
          label="Drafts in Progress"
          value={stats.draftCount}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-200/60"
          subText="Unpublished works"
        />

        <DashboardStatCard
          label="Total Applauds"
          value={stats.likesCount}
          icon={Heart}
          iconColor="text-rose-500"
          iconBg="bg-rose-50 border-rose-200/60"
          subText="Across all publications"
        />

        <DashboardStatCard
          label="Reader Responses"
          value={stats.commentsCount}
          icon={MessageCircle}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-200/60"
          subText="Comments & replies"
        />

        <DashboardStatCard
          label="Subscribers / Followers"
          value={stats.followersCount}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-200/60"
          subText="Reader network"
        />

        <DashboardStatCard
          label="Stories Bookmarked"
          value={stats.bookmarksCount}
          icon={Bookmark}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-200/60"
          subText="In readers' reading lists"
        />
      </div>

      {/* Main Content Area: Articles Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols on lg): Recent Articles Management */}
        <div className="lg:col-span-2">
          <RecentArticles
            articles={articles}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onDeleteRequest={(article) => setDeleteModalPost(article)}
          />
        </div>

        {/* Right Column (1 col on lg): Recent Activity Feed */}
        <div className="lg:col-span-1">
          <RecentActivity activity={activity} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#201F1D] mb-2">
              Delete Article Permanently?
            </h3>
            <p className="text-xs text-[#777777] leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-[#201F1D] font-semibold italic">"{deleteModalPost.title}"</span>? This will permanently remove the article, comments, likes, and any uploaded cover image. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#201F1D] border border-[#E8EAE8] font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
