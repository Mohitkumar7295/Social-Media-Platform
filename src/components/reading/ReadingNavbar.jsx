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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';
import ShareButton from './ShareButton';

export default function ReadingNavbar({ post }) {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    await logout();
    navigate('/', { replace: true });
  };

  const authorHandle = profile?.username || 'me';

  return (
    <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-[#222226] px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Left: Back & Logo */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-[#1c1c22] transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <Link
          to={isAuthenticated ? '/home' : '/'}
          className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FF6719] flex items-center justify-center text-white shadow-sm">
            <Feather className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">WriteSpace</span>
        </Link>
      </div>

      {/* Right: Actions, Share & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Explore link */}
        <Link
          to="/explore"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-xl hover:bg-[#1a1a20] transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>

        {/* Quick Share Button */}
        <ShareButton
          title={post?.title}
          text={post?.excerpt}
          className="px-3 py-1.5 rounded-full bg-[#1c1c20] hover:bg-[#282830] text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/60"
        />

        {/* Authenticated User Menu or Guest Sign In */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#1c1c20] transition-colors focus:outline-none"
            >
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                username={profile?.username}
                size="sm"
              />
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#18181c] border border-[#2a2a30] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[#242428]">
                  <p className="text-xs font-semibold text-white truncate">
                    {profile?.full_name || 'My Account'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">@{authorHandle}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={`/profile/${authorHandle}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-[#222228] rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-[#222228] rounded-xl transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>My Stories</span>
                  </Link>

                  <Link
                    to="/settings/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-[#222228] rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#242428]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
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
              className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-[#1a1a20] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-full bg-[#FF6719] hover:bg-[#e8590c] text-white text-xs font-semibold shadow transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
