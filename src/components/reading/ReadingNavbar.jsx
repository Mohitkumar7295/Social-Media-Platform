import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  ArrowLeft,
  Search,
  Compass,
  User,
  Settings,
  LogOut,
  FileText,
  ChevronDown,
  Type,
  Check,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';
import ShareButton from './ShareButton';

export default function ReadingNavbar({
  post,
  fontSize = 'normal',
  setFontSize,
  fontFamily = 'serif',
  setFontFamily,
}) {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fontMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target)) {
        setFontMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const authorHandle = profile?.username || 'me';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAE8] px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Left: Back & Logo */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#777777] hover:text-[#201F1D] text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-[#F0FAF8] transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <Link
          to={isAuthenticated ? '/home' : '/'}
          className="flex items-center gap-2.5 text-[#201F1D] hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0F8178] flex items-center justify-center text-white shadow-2xs">
            <Feather className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">WriteSpace</span>
        </Link>
      </div>

      {/* Right: Actions, Text Appearance, Share & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Explore link */}
        <Link
          to="/explore"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#201F1D] px-3 py-1.5 rounded-xl hover:bg-[#F0FAF8] transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>

        {/* Text Appearance Customizer */}
        {setFontSize && (
          <div className="relative" ref={fontMenuRef}>
            <button
              type="button"
              onClick={() => setFontMenuOpen((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                fontMenuOpen
                  ? 'bg-[#E9F8F5] text-[#0F8178] border-[#0F8178]/30'
                  : 'bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#555555] hover:text-[#201F1D] border-[#E8EAE8]'
              }`}
              title="Text appearance & size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[11px] font-sans font-bold">Aa</span>
            </button>

            {fontMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8EAE8] rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in duration-150">
                <div className="text-xs font-semibold text-[#201F1D] mb-2.5">
                  Reader Display
                </div>

                {/* Font Size Toggle */}
                <div className="mb-3">
                  <div className="text-[11px] text-[#777777] mb-1.5 font-medium">Text Size</div>
                  <div className="grid grid-cols-3 gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#E8EAE8]">
                    <button
                      type="button"
                      onClick={() => setFontSize('small')}
                      className={`py-1 text-xs font-medium rounded-lg transition-colors ${
                        fontSize === 'small'
                          ? 'bg-white text-[#0F8178] shadow-2xs font-semibold'
                          : 'text-[#777777] hover:text-[#201F1D]'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('normal')}
                      className={`py-1 text-xs font-medium rounded-lg transition-colors ${
                        fontSize === 'normal'
                          ? 'bg-white text-[#0F8178] shadow-2xs font-semibold'
                          : 'text-[#777777] hover:text-[#201F1D]'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('large')}
                      className={`py-1 text-xs font-medium rounded-lg transition-colors ${
                        fontSize === 'large'
                          ? 'bg-white text-[#0F8178] shadow-2xs font-semibold'
                          : 'text-[#777777] hover:text-[#201F1D]'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Font Family Toggle */}
                {setFontFamily && (
                  <div>
                    <div className="text-[11px] text-[#777777] mb-1.5 font-medium">Font Family</div>
                    <div className="grid grid-cols-2 gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#E8EAE8]">
                      <button
                        type="button"
                        onClick={() => setFontFamily('serif')}
                        className={`py-1.5 text-xs font-serif rounded-lg transition-colors ${
                          fontFamily === 'serif'
                            ? 'bg-white text-[#0F8178] shadow-2xs font-bold'
                            : 'text-[#777777] hover:text-[#201F1D]'
                        }`}
                      >
                        Serif (Editorial)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontFamily('sans')}
                        className={`py-1.5 text-xs font-sans rounded-lg transition-colors ${
                          fontFamily === 'sans'
                            ? 'bg-white text-[#0F8178] shadow-2xs font-bold'
                            : 'text-[#777777] hover:text-[#201F1D]'
                        }`}
                      >
                        Sans (Modern)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Share Button */}
        <ShareButton
          title={post?.title}
          text={post?.excerpt}
          className="px-3 py-1.5 rounded-full bg-[#F8FAF9] hover:bg-[#F0FAF8] text-[#201F1D] text-xs font-semibold border border-[#E8EAE8]"
        />

        {/* Authenticated User Menu or Guest Sign In */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F0FAF8] transition-colors focus:outline-none"
            >
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                username={profile?.username}
                size="sm"
              />
              <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8EAE8] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[#E8EAE8]">
                  <p className="text-xs font-semibold text-[#201F1D] truncate">
                    {profile?.full_name || 'My Account'}
                  </p>
                  <p className="text-[11px] text-[#777777] truncate">@{authorHandle}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={`/profile/${authorHandle}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#F0FAF8] rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#777777]" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#F0FAF8] rounded-xl transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#777777]" />
                    <span>My Stories</span>
                  </Link>

                  <Link
                    to="/settings/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#F0FAF8] rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#E8EAE8]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#555555] hover:text-[#201F1D] px-3 py-1.5 rounded-xl hover:bg-[#F0FAF8] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-full bg-[#0F8178] hover:bg-[#086B64] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
