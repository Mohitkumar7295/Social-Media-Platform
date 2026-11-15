import React, { useEffect } from 'react';
import { X, Sparkles, Feather } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, mode = 'get-started' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden z-10 border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">WriteSpace Preview</span>
            <h3 className="text-xl font-editorial font-bold text-stone-900">
              {mode === 'sign-in' ? 'Welcome Back' : 'Join WriteSpace'}
            </h3>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          {mode === 'sign-in'
            ? 'Access your published stories, drafted thoughts, and personalized subscriber reading lists.'
            : 'Create your author handle, publish long-form essays, and connect with thoughtful readers.'}
        </p>

        {/* Phase 1 Notice Box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 mb-6 text-xs text-amber-900 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-950 mb-0.5">Phase 1: Landing Page Mode</strong>
            Live account creation and InsForge BaaS authentication will be integrated in upcoming Phase 3. Explore the curated stories and platform overview below!
          </div>
        </div>

        {/* Interactive Demo Form */}
        <div className="space-y-4">
          {mode === 'get-started' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Elena Rostova"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="writer@writespace.app"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full mt-2"
            onClick={onClose}
          >
            {mode === 'sign-in' ? 'Sign In to WriteSpace' : 'Create Account'}
          </Button>

          <p className="text-center text-xs text-stone-500 pt-2">
            By proceeding, you agree to WriteSpace’s Terms & Privacy Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
