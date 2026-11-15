import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Menu, X, ArrowRight, User, Settings, LogOut, PenLine, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Navbar({ onOpenAuth }) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const authorHandle = profile?.username || 'me';
  const authorName = profile?.full_name || user?.profile?.name || user?.email?.split('@')[0] || 'Writer';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas-light/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-3.5'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
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
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors"
            >
              Home
            </Link>
            <a
              href="/#explore"
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors"
            >
              Explore
            </a>
            <a
              href="/#about"
              className="text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors"
            >
              About
            </a>

            {/* Write button (available for logged-in users, with Phase 4 marker) */}
            {isAuthenticated && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => alert('Article composer & publishing studio unlocks in Phase 4!')}
                  className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-brand-700 transition-colors"
                >
                  <PenLine className="w-4 h-4 text-brand-700" />
                  <span>Write</span>
                  <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-1.5 py-0.5 rounded-full border border-brand-200">
                    Phase 4
                  </span>
                </button>
              </div>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              /* Authenticated User Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-700/20"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand-100">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-stone-800 max-w-[120px] truncate">
                    {authorName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{authorName}</p>
                      <p className="text-[11px] text-stone-500 truncate">@{authorHandle}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={`/profile/${authorHandle}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>View Profile</span>
                      </Link>

                      <Link
                        to="/settings/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none"
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
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              Home
            </Link>
            <a
              href="/#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              Explore Stories
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
            >
              About WriteSpace
            </a>

            {isAuthenticated && (
              <>
                <Link
                  to={`/profile/${authorHandle}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>My Profile</span>
                  <span className="text-xs text-stone-400">@{authorHandle}</span>
                </Link>
                <Link
                  to="/settings/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-brand-700 rounded-lg transition-colors"
                >
                  Edit Profile & Settings
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-100">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={handleLogout}
                className="w-full justify-center text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Log Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
