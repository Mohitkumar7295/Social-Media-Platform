import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import AppLayout from '../components/home/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [deleteModalPost, setDeleteModalPost] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load user posts
  const loadPosts = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { posts: data, error } = await postService.getAuthorPosts(user.id);
      if (!error && data) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error loading author posts:', err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [user?.id]);

  // Handle Unpublish
  const handleUnpublish = async (postId) => {
    const { error } = await postService.unpublishPost(postId);
    if (!error) {
      await loadPosts();
    }
  };

  // Handle Publish
  const handlePublish = async (postId) => {
    const { error } = await postService.publishPost(postId);
    if (!error) {
      await loadPosts();
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteModalPost) return;
    setDeleteLoading(true);
    try {
      const { success } = await postService.deletePost(
        deleteModalPost.id,
        deleteModalPost.cover_image_key
      );
      if (success) {
        setDeleteModalPost(null);
        await loadPosts();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const displayedPosts = activeTab === 'published' ? publishedPosts : draftPosts;

  return (
    <AppLayout activeNav="profile">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#242428] mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Story Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your drafts, editorial posts, and published articles.
          </p>
        </div>

        <Link
          to="/write"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Write Story</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#242428] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('published')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'published' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Published ({publishedPosts.length})</span>
          {activeTab === 'published' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6719] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drafts')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'drafts' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Drafts ({draftPosts.length})</span>
          {activeTab === 'drafts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6719] rounded-full" />
          )}
        </button>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-5 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : displayedPosts.length > 0 ? (
        <div className="space-y-3">
          {displayedPosts.map((story) => (
            <div
              key={story.id}
              className="bg-[#141416] border border-[#242428] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#32323a] transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/50">
                    {story.category || 'General'}
                  </span>
                  <span className="text-zinc-500 text-xs">•</span>
                  <span className="text-xs text-zinc-400">
                    {activeTab === 'published'
                      ? `Published ${new Date(story.published_at || story.created_at).toLocaleDateString()}`
                      : `Edited ${new Date(story.updated_at || story.created_at).toLocaleDateString()}`}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-zinc-100 hover:text-white truncate">
                  {story.title}
                </h3>

                {story.subtitle && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic">
                    {story.subtitle}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222226]">
                {story.status === 'published' ? (
                  <>
                    <Link
                      to={`/story/${story.slug}`}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202026] transition-colors"
                      title="View Published Article"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleUnpublish(story.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Revert to Draft"
                    >
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePublish(story.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6719]/10 text-[#FF6719] hover:bg-[#FF6719] hover:text-white text-xs font-semibold transition-colors"
                    title="Publish Draft"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                )}

                <Link
                  to={`/write/${story.id}`}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202026] transition-colors"
                  title="Edit Story"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteModalPost(story)}
                  className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#242428] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            {activeTab === 'published' ? 'No Published Stories Yet' : 'No Drafts Saved'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6">
            {activeTab === 'published'
              ? 'Start sharing your knowledge, ideas, and stories with readers across WriteSpace.'
              : 'Drafts you write and auto-save will appear here for easy access and publishing.'}
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Story</span>
          </Link>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#161619] border border-[#2a2a30] rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">
              Delete "{deleteModalPost.title}"?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              This action cannot be undone. The story and its uploaded cover image will be permanently removed from WriteSpace.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
