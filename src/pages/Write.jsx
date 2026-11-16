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
  Globe,
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

  // Cover image URL modal state
  const [coverUrlModalOpen, setCoverUrlModalOpen] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');

  // Cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setErrorMessage('');

    try {
      const authorId = user?.id || 'writer';
      const { url, key, error } = await postService.uploadCoverImage(file, authorId);
      if (error) {
        setErrorMessage(error.message || 'Failed to upload cover image. Max 10MB (JPG, PNG, WebP, GIF).');
      } else if (url) {
        setCoverImageUrl(url);
        setCoverImageKey(key);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Cover upload failed.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Apply cover image from URL
  const handleApplyCoverUrl = () => {
    if (!coverUrlInput.trim()) return;
    let url = coverUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    setCoverImageUrl(url);
    setCoverImageKey(null);
    setCoverUrlInput('');
    setCoverUrlModalOpen(false);
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
        navigate(`/p/${post.slug}`, { replace: true });
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
        navigate(`/p/${post.slug}`, { replace: true });
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
      <div className="min-h-screen bg-white flex items-center justify-center text-[#777777]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#0F8178] mr-2" />
        <span>Loading story draft...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#201F1D] flex flex-col selection:bg-[#E9F8F5] selection:text-[#0F8178]">
      {/* Top Fixed Editorial Toolbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAE8] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="flex items-center gap-1.5 text-[#777777] hover:text-[#201F1D] text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-[#F0FAF8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          {/* Auto-save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#777777] select-none">
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="text-[#777777]">Saving draft...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-[#0F8178]" />
                <span className="text-[#777777]">Saved to cloud</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-[#777777] italic">Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-500">Save error</span>
            )}
          </div>
        </div>

        {/* Right Action buttons: Preview & Publish */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-xs text-[#777777] mr-2">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#201F1D] text-xs font-semibold border border-[#E8EAE8] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all"
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
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cover Image Upload Area */}
        <div className="group relative">
          {coverImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#E8EAE8] max-h-80 w-full shadow-md">
              <img
                src={coverImageUrl}
                alt="Article Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-stone-900/75 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                <label className="cursor-pointer text-xs font-semibold text-stone-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
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
                  onClick={() => {
                    setCoverUrlInput(coverImageUrl || '');
                    setCoverUrlModalOpen(true);
                  }}
                  className="cursor-pointer text-xs font-semibold text-stone-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors"
                  title="Remove Cover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:text-[#0F8178] hover:bg-[#F0FAF8] cursor-pointer border border-dashed border-[#E8EAE8] hover:border-[#0F8178] transition-colors">
                {isUploadingCover ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0F8178]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#0F8178]" />
                )}
                <span>{isUploadingCover ? 'Uploading cover...' : 'Upload Cover Image'}</span>
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
                onClick={() => setCoverUrlModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:text-[#0F8178] hover:bg-[#F0FAF8] cursor-pointer border border-dashed border-[#E8EAE8] hover:border-[#0F8178] transition-colors"
              >
                <Globe className="w-4 h-4 text-[#0F8178]" />
                <span>Add Cover via URL</span>
              </button>
            </div>
          )}
        </div>

        {/* Cover Image URL Modal */}
        {coverUrlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-serif font-bold text-[#201F1D]">Article Cover Image Link</h4>
                <button
                  type="button"
                  onClick={() => setCoverUrlModalOpen(false)}
                  className="p-1 rounded-lg text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#777777] mb-3">
                Paste any high-resolution public image URL (e.g. from Unsplash or image CDN).
              </p>

              <input
                type="url"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#F8FAF9] border border-[#E8EAE8] rounded-xl px-4 py-2.5 text-xs text-[#201F1D] placeholder:text-stone-400 focus:outline-none focus:border-[#0F8178] mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCoverUrl();
                }}
              />

              {coverUrlInput.trim() && (
                <div className="rounded-xl overflow-hidden border border-[#E8EAE8] max-h-44 bg-stone-50 flex items-center justify-center mb-4">
                  <img
                    src={coverUrlInput}
                    alt="Cover preview"
                    className="max-h-40 w-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCoverUrlModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!coverUrlInput.trim()}
                  onClick={handleApplyCoverUrl}
                  className="px-5 py-2 rounded-xl bg-[#0F8178] hover:bg-[#086B64] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Set Cover Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title Input */}
        <div>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            placeholder="Title"
            rows={1}
            maxLength={200}
            className="w-full bg-transparent font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#201F1D] placeholder:text-stone-300 focus:outline-none resize-none tracking-tight leading-tight"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <div className="flex justify-end text-[11px] text-[#777777] mt-1">
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
            className="w-full bg-transparent font-serif text-lg sm:text-xl text-[#555555] placeholder:text-stone-300 focus:outline-none border-b border-[#E8EAE8] pb-3"
          />
          <div className="flex justify-end text-[11px] text-[#777777] mt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE8]">
              <h3 className="font-serif text-xl font-bold text-[#201F1D]">Publishing Settings</h3>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-lg text-[#777777] hover:text-[#201F1D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-[#201F1D] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F8FAF9] border border-[#E8EAE8] rounded-xl px-3.5 py-2.5 text-sm text-[#201F1D] focus:outline-none focus:border-[#0F8178]"
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
              <label className="block text-xs font-semibold text-[#201F1D] mb-2">
                Story Preview Description (Excerpt)
              </label>
              <textarea
                value={excerpt || extractExcerpt(content)}
                onChange={(e) => setExcerpt(e.target.value.slice(0, 240))}
                rows={3}
                maxLength={240}
                placeholder="Brief summary shown on feeds and social shares..."
                className="w-full bg-[#F8FAF9] border border-[#E8EAE8] rounded-xl p-3 text-xs text-[#201F1D] placeholder:text-stone-400 focus:outline-none focus:border-[#0F8178] resize-none"
              />
              <span className="text-[11px] text-[#777777] float-right">
                {(excerpt || extractExcerpt(content)).length}/240
              </span>
            </div>

            {/* Publish Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAE8]">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishLoading || !title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F8178] hover:bg-[#086B64] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-150">
          <div className="max-w-3xl mx-auto bg-white border border-[#E8EAE8] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[#F8FAF9] text-[#777777] hover:text-[#201F1D]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Preview Banner */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] text-xs font-semibold mb-6">
              <Eye className="w-3.5 h-3.5" />
              <span>Story Preview Mode</span>
            </div>

            {/* Preview Cover */}
            {coverImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#E8EAE8] max-h-80 w-full mb-6">
                <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Preview Header */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#201F1D] mb-2 leading-tight">
              {title || 'Untitled Story'}
            </h1>

            {subtitle && (
              <p className="font-serif text-lg text-[#555555] mb-6 italic">{subtitle}</p>
            )}

            {/* Author info pill */}
            <div className="flex items-center gap-3 py-4 border-y border-[#E8EAE8] mb-8">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name}
                username={profile?.username}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-[#201F1D]">{profile?.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-[#777777]">
                  <span>@{profile?.username}</span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span className="text-[#0F8178] font-semibold">{category}</span>
                </div>
              </div>
            </div>

            {/* Preview Body */}
            <div
              className="prose max-w-none font-serif text-lg leading-relaxed text-[#292524]"
              dangerouslySetInnerHTML={{ __html: content || '<p><i>No content yet...</i></p>' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
