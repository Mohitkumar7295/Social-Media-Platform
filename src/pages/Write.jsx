import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Send,
  Image as ImageIcon,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  Clock,
  X,
  Upload,
  Feather,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { estimateReadingTime, extractExcerpt } from '../utils/editorUtils';
import RichTextEditor from '../components/editor/RichTextEditor';
import UserAvatar from '../components/common/UserAvatar';

const CATEGORIES = [
  'General',
  'Technology',
  'Design',
  'Culture',
  'Business',
  'Writing',
  'Productivity',
  'Science',
];

export default function Write() {
  const { id } = useParams(); // If editing existing post
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Post State
  const [postId, setPostId] = useState(id || null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [coverImageKey, setCoverImageKey] = useState(null);
  const [status, setStatus] = useState('draft'); // 'draft' | 'published'

  // UI State
  const [isLoading, setIsLoading] = useState(!!id);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-save debounce ref
  const autoSaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Load existing post if editing
  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!id) return;
      setIsLoading(true);
      try {
        const { post, error } = await postService.getPostById(id);
        if (error || !post) {
          console.error('Error loading post:', error);
          if (isMounted) navigate('/write', { replace: true });
          return;
        }

        // Verify ownership
        if (post.author_id !== user?.id) {
          navigate('/home', { replace: true });
          return;
        }

        if (isMounted) {
          setPostId(post.id);
          setTitle(post.title || '');
          setSubtitle(post.subtitle || '');
          setContent(post.content || '');
          setCategory(post.category || 'General');
          setExcerpt(post.excerpt || '');
          setCoverImageUrl(post.cover_image_url || null);
          setCoverImageKey(post.cover_image_key || null);
          setStatus(post.status || 'draft');
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [id, user?.id, navigate]);

  // Save handler (Manual or Auto-save)
  const performSave = useCallback(
    async (explicitStatus = null) => {
      if (!user?.id) return;
      if (!title.trim() && !content.trim()) return;

      setSaveStatus('saving');
      try {
        const targetStatus = explicitStatus || status;

        if (postId) {
          // Update existing
          const { post, error } = await postService.updatePost(postId, {
            title: title || 'Untitled Story',
            subtitle,
            content,
            category,
            excerpt: excerpt || extractExcerpt(content),
            coverImageUrl,
            coverImageKey,
            status: targetStatus,
          });

          if (error) {
            setSaveStatus('error');
          } else {
            setSaveStatus('saved');
            if (explicitStatus) setStatus(explicitStatus);
          }
        } else {
          // Create new draft
          const { post, error } = await postService.createPost({
            authorId: user.id,
            title: title || 'Untitled Story',
            subtitle,
            content,
            category,
            excerpt: excerpt || extractExcerpt(content),
            coverImageUrl,
            coverImageKey,
            status: targetStatus,
          });

          if (error) {
            setSaveStatus('error');
          } else if (post) {
            setPostId(post.id);
            setSaveStatus('saved');
            if (explicitStatus) setStatus(explicitStatus);
            // Update URL without full page reload
            window.history.replaceState(null, '', `/write/${post.id}`);
          }
        }
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    },
    [user?.id, postId, title, subtitle, content, category, excerpt, coverImageUrl, coverImageKey, status]
  );

  // Trigger debounced auto-save on content/title changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('unsaved');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave();
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, subtitle, content, category, coverImageUrl, performSave]);

  // Cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingCover(true);
    setErrorMessage('');

    try {
      const { url, key, error } = await postService.uploadCoverImage(file, user.id);
      if (error) {
        setErrorMessage('Failed to upload cover image. Please check file size (< 10MB).');
      } else {
        setCoverImageUrl(url);
        setCoverImageKey(key);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Cover upload failed.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Remove cover image
  const handleRemoveCover = async () => {
    setCoverImageUrl(null);
    setCoverImageKey(null);
    if (postId) {
      await postService.updatePost(postId, {
        coverImageUrl: null,
        coverImageKey: null,
      });
    }
  };

  // Publish article action
  const handlePublish = async () => {
    if (!title.trim()) {
      setErrorMessage('Please add a title before publishing.');
      return;
    }

    setPublishLoading(true);
    setErrorMessage('');

    try {
      let finalPostId = postId;

      if (!finalPostId) {
        // Create first
        const { post, error } = await postService.createPost({
          authorId: user.id,
          title: title.trim(),
          subtitle,
          content,
          category,
          excerpt: excerpt || extractExcerpt(content),
          coverImageUrl,
          coverImageKey,
          status: 'published',
        });

        if (error || !post) throw error || new Error('Publishing failed.');
        finalPostId = post.id;
        navigate(`/story/${post.slug}`, { replace: true });
      } else {
        // Update to published
        const { post, error } = await postService.updatePost(finalPostId, {
          title: title.trim(),
          subtitle,
          content,
          category,
          excerpt: excerpt || extractExcerpt(content),
          coverImageUrl,
          coverImageKey,
          status: 'published',
        });

        if (error || !post) throw error || new Error('Publishing failed.');
        navigate(`/story/${post.slug}`, { replace: true });
      }
    } catch (err) {
      console.error('Publishing error:', err);
      setErrorMessage(err.message || 'An error occurred while publishing.');
      setPublishLoading(false);
    }
  };

  const readingTime = estimateReadingTime(content);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-[#FF6719] mr-2" />
        <span>Loading story draft...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col selection:bg-orange-950/60 selection:text-orange-200">
      {/* Top Fixed Editorial Toolbar */}
      <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-[#222226] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#1c1c22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          {/* Auto-save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 select-none">
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="text-zinc-400">Saving draft...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-zinc-500">Saved to cloud</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-zinc-500 italic">Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-400">Save error</span>
            )}
          </div>
        </div>

        {/* Right Action buttons: Preview & Publish */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 mr-2">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c20] hover:bg-[#26262c] text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/60 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition-all"
          >
            <span>{status === 'published' ? 'Update & Publish' : 'Publish'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Writing Canvas */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cover Image Upload Area */}
        <div className="group relative">
          {coverImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#26262a] max-h-80 w-full shadow-lg">
              <img
                src={coverImageUrl}
                alt="Article Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                <label className="cursor-pointer text-xs font-semibold text-zinc-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  Change Cover
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                  title="Remove Cover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-[#18181c] w-fit cursor-pointer border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors">
              <ImageIcon className="w-4 h-4 text-[#FF6719]" />
              <span>{isUploadingCover ? 'Uploading cover image...' : 'Add cover image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
              />
            </label>
          )}
        </div>

        {/* Title Input */}
        <div>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            placeholder="Title"
            rows={1}
            maxLength={200}
            className="w-full bg-transparent font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white placeholder:text-zinc-600 focus:outline-none resize-none tracking-tight leading-tight"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <div className="flex justify-end text-[11px] text-zinc-600 mt-1">
            {title.length}/200
          </div>
        </div>

        {/* Subtitle Input */}
        <div>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value.slice(0, 300))}
            placeholder="Add a subtitle..."
            maxLength={300}
            className="w-full bg-transparent font-serif text-lg sm:text-xl text-zinc-300 placeholder:text-zinc-600 focus:outline-none border-b border-[#202024] pb-3"
          />
          <div className="flex justify-end text-[11px] text-zinc-600 mt-1">
            {subtitle.length}/300
          </div>
        </div>

        {/* Rich Text Editor */}
        <RichTextEditor
          content={content}
          onChange={(newContent) => setContent(newContent)}
          placeholder="Tell your story..."
        />
      </main>

      {/* Publish Settings Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#161619] border border-[#2a2a30] rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242428]">
              <h3 className="font-serif text-xl font-bold text-white">Publishing Settings</h3>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121214] border border-[#282830] rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#FF6719]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Story Preview Description (Excerpt)
              </label>
              <textarea
                value={excerpt || extractExcerpt(content)}
                onChange={(e) => setExcerpt(e.target.value.slice(0, 240))}
                rows={3}
                maxLength={240}
                placeholder="Brief summary shown on feeds and social shares..."
                className="w-full bg-[#121214] border border-[#282830] rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FF6719] resize-none"
              />
              <span className="text-[11px] text-zinc-500 float-right">
                {(excerpt || extractExcerpt(content)).length}/240
              </span>
            </div>

            {/* Publish Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242428]">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishLoading || !title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition-all disabled:opacity-50"
              >
                {publishLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Publish Now</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-150">
          <div className="max-w-3xl mx-auto bg-[#121214] border border-[#242428] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[#1c1c20] text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Preview Banner */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6719] text-xs font-semibold mb-6">
              <Eye className="w-3.5 h-3.5" />
              <span>Story Preview Mode</span>
            </div>

            {/* Preview Cover */}
            {coverImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#26262a] max-h-80 w-full mb-6">
                <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Preview Header */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {title || 'Untitled Story'}
            </h1>

            {subtitle && (
              <p className="font-serif text-lg text-zinc-400 mb-6 italic">{subtitle}</p>
            )}

            {/* Author info pill */}
            <div className="flex items-center gap-3 py-4 border-y border-[#202024] mb-8">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name}
                username={profile?.username}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-white">{profile?.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>@{profile?.username}</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span className="text-[#FF6719]">{category}</span>
                </div>
              </div>
            </div>

            {/* Preview Body */}
            <div
              className="prose prose-invert max-w-none font-serif text-lg leading-relaxed text-zinc-200"
              dangerouslySetInnerHTML={{ __html: content || '<p><i>No content yet...</i></p>' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
