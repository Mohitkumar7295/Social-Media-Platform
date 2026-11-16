import React, { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  Globe,
  X,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';
import { postService } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';

export default function RichTextEditor({ content = '', onChange, placeholder = 'Tell your story...' }) {
  const { user } = useAuth();

  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Image modal & upload state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  // Directly insert an image into the editor
  const insertImage = useCallback((editorInstance, src, alt = '') => {
    if (!src || !editorInstance) return;
    editorInstance
      .chain()
      .focus()
      .setImage({ src, alt: alt || 'Article Illustration' })
      .run();
  }, []);

  // Upload an image file to InsForge storage and insert it
  const handleUploadAndInsertFile = useCallback(
    async (file, editorInstance) => {
      if (!file) return;
      setIsUploadingImage(true);
      setImageError('');

      try {
        const authorId = user?.id || 'writer';
        const { url, error } = await postService.uploadInlineImage(file, authorId);

        if (error) {
          throw new Error(error.message || 'Image upload to storage failed.');
        }

        if (url && editorInstance) {
          insertImage(editorInstance, url, file.name);
          setImageModalOpen(false);
          setSelectedFile(null);
          setFilePreview(null);
          setImageUrlInput('');
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
        setImageError(err.message || 'Failed to upload image. Max 10MB (JPG, PNG, WebP, GIF).');
      } finally {
        setIsUploadingImage(false);
      }
    },
    [user?.id, insertImage]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#0F8178] underline underline-offset-4 hover:text-[#086B64]',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-8 mx-auto border border-[#E8EAE8] shadow-md block',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[400px] focus:outline-none text-[#292524] font-serif text-lg leading-relaxed selection:bg-[#E9F8F5] selection:text-[#0F8178]',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              handleUploadAndInsertFile(file, editor);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleUploadAndInsertFile(file, editor);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Link handler
  const handleAddLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
    }
    setLinkUrl('');
    setLinkModalOpen(false);
  };

  // File change in image modal
  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    setSelectedFile(file);

    // Create local preview
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // URL insert in image modal
  const handleInsertUrl = () => {
    if (!imageUrlInput.trim() || !editor) return;
    let url = imageUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    insertImage(editor, url);
    setImageUrlInput('');
    setImageModalOpen(false);
  };

  if (!editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-zinc-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Editorial Floating / Fixed Toolbar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center gap-1 p-2 bg-white/95 backdrop-blur-md border border-[#E8EAE8] rounded-2xl shadow-xs">
        {/* Text styling group */}
        <div className="flex items-center gap-0.5 border-r border-[#E8EAE8] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('bold')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('italic')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('underline')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Headings group */}
        <div className="flex items-center gap-0.5 border-r border-[#E8EAE8] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes group */}
        <div className="flex items-center gap-0.5 border-r border-[#E8EAE8] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded-xl text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
            title="Divider Line"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Links & Images group */}
        <div className="flex items-center gap-0.5 border-r border-[#E8EAE8] pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => {
              setLinkUrl(editor.getAttributes('link').href || '');
              setLinkModalOpen(true);
            }}
            className={`p-2 rounded-xl transition-colors ${
              editor.isActive('link')
                ? 'bg-[#E9F8F5] text-[#0F8178]'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </button>
          )}

          {/* Add Image Button (Opens modal for upload or URL) */}
          <button
            type="button"
            onClick={() => {
              setImageError('');
              setImageModalOpen(true);
            }}
            className={`p-2 rounded-xl transition-colors ${
              isUploadingImage
                ? 'bg-[#E9F8F5] text-[#0F8178] animate-pulse'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Insert Image (Upload or URL)"
          >
            {isUploadingImage ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#0F8178]" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Undo / Redo group */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-xl text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-xl text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Status Banner when image is uploading */}
      {isUploadingImage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#E9F8F5] border border-[#0F8178]/20 rounded-xl text-xs font-medium text-[#0F8178] animate-in fade-in">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Uploading picture to cloud storage...</span>
        </div>
      )}

      {/* Link Input Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-2xl">
            <h4 className="text-base font-serif font-bold text-[#201F1D] mb-3">Add or Edit Link</h4>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[#F8FAF9] border border-[#E8EAE8] rounded-xl px-4 py-2.5 text-sm text-[#201F1D] placeholder:text-stone-400 focus:outline-none focus:border-[#0F8178] mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddLink();
              }}
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-5 py-2 rounded-xl bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal (Upload or Web URL) */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E8EAE8] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-serif font-bold text-[#201F1D]">Insert Picture</h4>
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setImageError('');
                }}
                className="p-1 rounded-lg text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#F8FAF9] rounded-xl mb-4 border border-[#E8EAE8]">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  imageTab === 'upload'
                    ? 'bg-white text-[#0F8178] shadow-xs'
                    : 'text-[#777777] hover:text-[#201F1D]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  imageTab === 'url'
                    ? 'bg-white text-[#0F8178] shadow-xs'
                    : 'text-[#777777] hover:text-[#201F1D]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* Error Message */}
            {imageError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Tab 1: Upload File */}
            {imageTab === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={onFileSelect}
                />

                {filePreview ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-[#E8EAE8] max-h-56 bg-stone-50 flex items-center justify-center">
                      <img src={filePreview} alt="Preview" className="max-h-56 w-auto object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-stone-900/70 text-white rounded-lg hover:bg-stone-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#777777] truncate">
                      {selectedFile?.name} ({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8EAE8] hover:border-[#0F8178] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F8FAF9] hover:bg-[#F0FAF8] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E8EAE8] group-hover:border-[#0F8178]/30 text-[#0F8178] flex items-center justify-center mx-auto mb-2 shadow-xs transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-[#201F1D] mb-1">
                      Click to choose an image
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      JPG, PNG, WebP, GIF, AVIF up to 10MB
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageModalOpen(false);
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || isUploadingImage}
                    onClick={() => handleUploadAndInsertFile(selectedFile, editor)}
                    className="px-5 py-2 rounded-xl bg-[#0F8178] hover:bg-[#086B64] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isUploadingImage && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Insert into Story'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Insert Image by URL */}
            {imageTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                    Web Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#F8FAF9] border border-[#E8EAE8] rounded-xl px-4 py-2.5 text-xs text-[#201F1D] placeholder:text-stone-400 focus:outline-none focus:border-[#0F8178]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInsertUrl();
                    }}
                  />
                  <p className="text-[11px] text-[#777777] mt-1.5">
                    Paste any public image link (Unsplash, CDN, etc.).
                  </p>
                </div>

                {imageUrlInput.trim() && (
                  <div className="rounded-xl overflow-hidden border border-[#E8EAE8] max-h-48 bg-stone-50 flex items-center justify-center p-2">
                    <img
                      src={imageUrlInput}
                      alt="URL Preview"
                      className="max-h-44 w-auto object-contain rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageModalOpen(false);
                      setImageUrlInput('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!imageUrlInput.trim()}
                    onClick={handleInsertUrl}
                    className="px-5 py-2 rounded-xl bg-[#0F8178] hover:bg-[#086B64] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Insert Picture
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TipTap Editable Content Area */}
      <div className="py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
