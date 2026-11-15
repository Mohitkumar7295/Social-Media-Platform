import React, { useState, useEffect } from 'react';
import { Feather, Menu, X, ArrowRight, BookOpen } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar({ onOpenAuth }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas-light/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Name */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-800 transition-colors">
              <Feather className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold tracking-tight text-stone-900 leading-none">
                WriteSpace
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-700 leading-none mt-0.5">
                Editorial Platform
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('explore')}
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors cursor-pointer"
            >
              Explore
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenAuth('sign-in')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onOpenAuth('get-started')}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-700/20"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 pt-2 pb-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('explore')}
              className="text-left px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              Explore Stories
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-left px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              About WriteSpace
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              How It Works
            </button>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('sign-in');
              }}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('get-started');
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
