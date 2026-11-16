import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  Home,
  Bookmark,
  MessageSquare,
  Bell,
  Compass,
  User,
  Menu,
  X,
  Plus,
  LogOut,
  Settings,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import UserAvatar from '../common/UserAvatar';
import NotificationBadge from '../notifications/NotificationBadge';

/**
 * AppLayout Component
 * Standard 3-column editorial layout (Left Nav, Center Feed, Right Discovery)
 * Designed with a clean white/off-white background, subtle borders, and teal branding.
 */
export default function AppLayout({ children, activeNav = 'home' }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileUsername = profile?.username || user?.id || '';

  const mobileNavItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Saved', path: '/bookmarks', icon: Bookmark },
    { name: 'Activity', path: '/activity', icon: Bell },
    {
      name: 'Profile',
      path: profileUsername ? `/profile/${profileUsername}` : '/login',
      icon: User,
    },
  ];

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#201F1D] flex flex-col selection:bg-[#E9F8F5] selection:text-[#0F8178]">
      {/* Mobile Top Header (Visible on screens < lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAE8] px-4 py-3 flex items-center justify-between shadow-xs">
        <Link to="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F8178] text-white flex items-center justify-center shadow-xs">
            <Feather className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#201F1D] leading-none">
              WriteSpace
            </span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#0F8178] leading-none mt-0.5">
              Editorial
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to={profileUsername ? `/profile/${profileUsername}` : '/login'}>
            <UserAvatar
              src={profile?.avatar_url}
              name={profile?.full_name}
              username={profile?.username}
              size="sm"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#201F1D] hover:bg-[#E9F8F5] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (When menu open) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-between p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#E8EAE8] max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#E8EAE8]">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={profile?.avatar_url}
                    name={profile?.full_name}
                    username={profile?.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#201F1D] text-sm truncate">
                      {profile?.full_name || 'My Account'}
                    </p>
                    <p className="text-xs text-[#777777] truncate">@{profile?.username || 'user'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#777777] hover:text-[#201F1D] hover:bg-stone-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 mt-5">
                {[
                  { name: 'Write a Story', path: '/write', icon: Plus, highlight: true },
                  { name: 'Home Feed', path: '/home', icon: Home },
                  { name: 'Explore', path: '/explore', icon: Compass },
                  { name: 'Saved Stories', path: '/bookmarks', icon: Bookmark },
                  { name: 'Subscriptions', path: '/subscriptions', icon: Sparkles },
                  { name: 'My Stories & Drafts', path: '/dashboard', icon: FileText },
                  { name: 'Activity & Alerts', path: '/activity', icon: Bell },
                  { name: 'Chat', path: '/chat', icon: MessageSquare },
                  {
                    name: 'My Profile',
                    path: profileUsername ? `/profile/${profileUsername}` : '/login',
                    icon: User,
                  },
                  { name: 'Edit Profile & Settings', path: '/settings/profile', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        item.highlight
                          ? 'bg-[#0F8178] text-white font-semibold shadow-xs'
                          : 'text-[#201F1D] hover:text-[#0F8178] hover:bg-[#E9F8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-[#777777]'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.path === '/activity' && <NotificationBadge />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E8EAE8]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop & Tablet Layout Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex justify-center">
        {/* Left Column: Navigation Sidebar (Hidden on mobile < lg) */}
        <Sidebar className="hidden lg:flex" />

        {/* Center Column: Main Feed / Page Content */}
        <main className="flex-1 max-w-2xl w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8 border-x-0 lg:border-x border-[#E8EAE8] bg-[#F8FAF9] min-h-screen">
          {children}
        </main>

        {/* Right Column: Discovery Sidebar (Hidden on < xl) */}
        <RightSidebar className="hidden xl:flex" />
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop lg+) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EAE8] py-2 px-3 flex items-center justify-around shadow-sm">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive ? 'text-[#0F8178] font-semibold' : 'text-[#777777] hover:text-[#201F1D]'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.path === '/activity' && (
                  <NotificationBadge className="absolute -top-1 -right-2 text-[9px] min-w-[14px] h-[14px] px-1" />
                )}
              </div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
