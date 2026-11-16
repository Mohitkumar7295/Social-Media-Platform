import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Twitter, Github, Linkedin, Rss, Heart } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-stone-800">
          
          {/* Brand Column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={scrollToTop}>
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight text-white">
                WriteSpace
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              WriteSpace is an open editorial home for thinkers, essayists, and engineers. We combine long-form publishing with modern community discourse.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-brand-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Mohitkumar7295/Social-Media-Platform"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-brand-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-brand-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#rss"
                onClick={(e) => {
                  e.preventDefault();
                  alert('RSS Feeds will become active in Phase 9 (Feeds & Syndication).');
                }}
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-brand-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="RSS Feed"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About WriteSpace
                </Link>
              </li>
              <li>
                <Link to="/write" className="hover:text-white transition-colors">
                  Start Writing
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Writers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100">
              Writers
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => onOpenAuth('get-started')}
                  className="hover:text-white transition-colors text-left"
                >
                  Start Writing
                </button>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Editorial Philosophy
                </a>
              </li>
              <li>
                <a
                  href="#guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Community guidelines promote nuanced discussion and constructive peer feedback.');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('sign-in')}
                  className="hover:text-white transition-colors text-left"
                >
                  Author Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100">
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Privacy Policy: WriteSpace prioritizes privacy. No third-party ad tracking or personal data brokers.');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Terms and Conditions: Authors retain full ownership of their intellectual property.');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@writespace.app"
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {currentYear} WriteSpace Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted for thoughtful minds with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>and editorial care.</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
