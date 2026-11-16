import React, { useState } from 'react';
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
} from 'lucide-react';
import { postService } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';

export default function RichTextEditor({ content = '', onChange, placeholder = 'Tell your story...' }) {
  const { user } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

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
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 mx-auto border border-[#E8EAE8] shadow-md',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[400px] focus:outline-none text-[#292524] font-serif text-lg leading-relaxed selection:bg-[#E9F8F5] selection:text-[#0F8178]',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-zinc-500">
        Loading editor...
      </div>
    );
  }

  // Handle inline image upload to InsForge storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingImage(true);
    try {
      const { url, error } = await postService.uploadInlineImage(file, user.id);
      if (!error && url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (err) {
      console.error('Error uploading inline image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle link modal
  const handleAddLink = () => {
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

          <label
            className={`p-2 rounded-xl cursor-pointer transition-colors ${
              isUploadingImage
                ? 'opacity-50 pointer-events-none'
                : 'text-[#777777] hover:text-[#201F1D] hover:bg-[#F0FAF8]'
            }`}
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
            />
          </label>
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

      {/* TipTap Editable Content Area */}
      <div className="py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
