import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Feather,
  Home,
  Bookmark,
  MessageSquare,
  Bell,
  Compass,
  User,
  Plus,
  MoreHorizontal,
  PenTool,
  FileText,
  LogOut,
  Settings,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../common/UserAvatar';
import NotificationBadge from '../notifications/NotificationBadge';

export default function Sidebar({ className = '' }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Create menu state
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [createNoticeType, setCreateNoticeType] = useState('');
  const createMenuRef = useRef(null);

  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileUsername = profile?.username || user?.id || '';

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Saved', path: '/bookmarks', icon: Bookmark },
    { name: 'Subscriptions', path: '/subscriptions', icon: Sparkles },
    { name: 'Stories', path: '/dashboard', icon: FileText },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Activity', path: '/activity', icon: Bell },
    {
      name: 'Profile',
      path: profileUsername ? `/profile/${profileUsername}` : '/login',
      icon: User,
    },
  ];

  const handleCreateClick = (type) => {
    setShowCreateMenu(false);
    navigate('/write');
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <aside
      className={`w-64 flex flex-col justify-between py-6 px-4 bg-[#0e0e10] border-r border-[#222226] select-none h-screen sticky top-0 ${className}`}
    >
      {/* Top section: Logo & Nav items */}
      <div className="flex flex-col gap-6">
        {/* WriteSpace Logo */}
        <NavLink
          to="/home"
          className="flex items-center gap-3 px-3 py-2 text-white hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6719] to-orange-700 flex items-center justify-center text-white shadow-lg shadow-orange-900/30">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-white">
            WriteSpace
          </span>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1c1c20] text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#161619]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#FF6719]' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                </div>
                <span>{item.name}</span>
                {item.path === '/activity' && (
                  <NotificationBadge className="ml-auto" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Prominent Substack-style Orange Create Button */}
        <div className="relative px-1 pt-2" ref={createMenuRef}>
          <button
            type="button"
            onClick={() => setShowCreateMenu((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-[#FF6719] hover:bg-[#e8590c] active:scale-[0.98] text-white font-semibold text-base shadow-md shadow-orange-950/40 transition-all duration-150"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create</span>
            <ChevronDown
              className={`w-4 h-4 ml-0.5 transition-transform duration-200 ${
                showCreateMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Create Dropdown Menu */}
          {showCreateMenu && (
            <div className="absolute left-2 right-2 mt-2 p-1.5 bg-[#18181c] border border-[#2a2a30] rounded-2xl shadow-2xl z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => handleCreateClick('Article')}
                className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-[#222228] transition-colors group"
              >
                <div className="p-2 rounded-lg bg-orange-500/10 text-[#FF6719] group-hover:bg-[#FF6719] group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    Write an article
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-sans">
                      Phase 4
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Long-form editorial post with formatting & cover.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCreateClick('Post')}
                className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-[#222228] transition-colors group mt-0.5"
              >
                <div className="p-2 rounded-lg bg-orange-500/10 text-[#FF6719] group-hover:bg-[#FF6719] group-hover:text-white transition-colors">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    Create a post
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-sans">
                      Phase 4
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Short-form idea, thought, or note for followers.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: User Profile Menu & More */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#202024]">
        {/* User Profile Pill */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#18181c] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                username={profile?.username}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white">
                  {profile?.full_name || 'My Account'}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  @{profile?.username || 'user'}
                </p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
          </button>

          {/* User Profile Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[#18181c] border border-[#2a2a30] rounded-2xl shadow-2xl z-50 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  if (profile?.username) navigate(`/profile/${profile.username}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-[#222228] transition-colors"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/dashboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-[#222228] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#FF6719]" />
                <span>My Stories & Drafts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/bookmarks');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-[#222228] transition-colors"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Saved Stories</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings/profile');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-[#222228] transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Edit Profile & Settings</span>
              </button>

              <div className="my-1 border-t border-[#2a2a30]" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notice Modal for Phase 4 Create actions */}
      {showCreateNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#18181c] border border-[#2e2e36] rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF6719] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              {createNoticeType === 'Article' ? 'Article Editor' : 'Post Composer'} Coming in Phase 4
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              WriteSpace is built modularly phase-by-phase. Phase 3 focuses on the authenticated social feed and database connections. The rich markdown editor, cover uploads, and article publishing pipeline arrive in **Phase 4**.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateNotice(false)}
                className="px-5 py-2.5 rounded-xl bg-[#FF6719] hover:bg-[#e8590c] text-white font-medium text-sm transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
