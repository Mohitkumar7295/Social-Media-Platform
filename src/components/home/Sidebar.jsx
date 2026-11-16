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
  FileText,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  PenTool,
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
      className={`w-64 flex flex-col justify-between py-6 px-4 bg-white border-r border-[#E8EAE8] select-none h-screen sticky top-0 ${className}`}
    >
      {/* Top section: Logo & Nav items */}
      <div className="flex flex-col gap-6">
        {/* WriteSpace Logo */}
        <NavLink
          to="/home"
          className="flex items-center gap-3 px-3 py-1.5 text-[#201F1D] hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F8178] text-white flex items-center justify-center shadow-xs">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-[#201F1D] leading-none">
              WriteSpace
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#0F8178] leading-none mt-1">
              Editorial Platform
            </span>
          </div>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E9F8F5] text-[#0F8178] font-semibold'
                    : 'text-[#777777] hover:text-[#0F8178] hover:bg-[#F0FAF8]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#0F8178]' : 'text-[#777777]'
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

        {/* Prominent Editorial Teal Create Button */}
        <div className="relative px-1 pt-1" ref={createMenuRef}>
          <button
            type="button"
            onClick={() => navigate('/write')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0F8178] hover:bg-[#086B64] active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Write Story</span>
          </button>
        </div>
      </div>

      {/* Bottom section: User Profile Menu & More */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#E8EAE8]">
        {/* User Profile Pill */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAF9] border border-transparent hover:border-[#E8EAE8] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                username={profile?.username}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#201F1D] truncate group-hover:text-[#0F8178]">
                  {profile?.full_name || 'My Account'}
                </p>
                <p className="text-xs text-[#777777] truncate">
                  @{profile?.username || 'user'}
                </p>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-[#777777] group-hover:text-[#201F1D] shrink-0" />
          </button>

          {/* User Profile Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white border border-[#E8EAE8] rounded-2xl shadow-xl z-50 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  if (profile?.username) navigate(`/profile/${profile.username}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <User className="w-4 h-4 text-[#777777]" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/dashboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#0F8178]" />
                <span>My Stories & Drafts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/bookmarks');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Saved Stories</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings/profile');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#201F1D] hover:text-[#0F8178] hover:bg-[#E9F8F5] transition-colors"
              >
                <Settings className="w-4 h-4 text-[#777777]" />
                <span>Edit Profile & Settings</span>
              </button>

              <div className="my-1 border-t border-[#E8EAE8]" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
