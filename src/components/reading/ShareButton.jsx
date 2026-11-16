import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

export default function ShareButton({ title, text, url, className = '', buttonText = 'Share' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareData = {
      title: title || 'Story on WriteSpace',
      text: text || 'Read this story on WriteSpace',
      url: shareUrl,
    };

    // 1. Try Native Web Share API (Mobile & supported browsers)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Clipboard Fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className={`flex items-center gap-1.5 transition-colors ${className}`}
        title="Share article link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[#0F8178]" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {buttonText && <span>{copied ? 'Copied!' : buttonText}</span>}
      </button>

      {/* Toast confirmation */}
      {copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#201F1D] border border-stone-800 text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 z-50">
          Article link copied to clipboard!
        </div>
      )}
    </div>
  );
}
