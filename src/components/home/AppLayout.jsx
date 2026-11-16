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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import UserAvatar from '../common/UserAvatar';

export default function AppLayout({ children, activeNav = 'home' }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileUsername = profile?.username || user?.id || '';

  const mobileNavItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Subscriptions', path: '/subscriptions', icon: Bookmark },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
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
    <div className="min-h-screen bg-[#0e0e10] text-zinc-100 flex flex-col">
      {/* Mobile Top Header (Visible on screens < lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-[#222226] px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6719] to-orange-700 flex items-center justify-center text-white shadow-md">
            <Feather className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-white">
            WriteSpace
          </span>
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f1f24] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (When menu open) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#26262c]">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={profile?.avatar_url}
                  name={profile?.full_name}
                  username={profile?.username}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-white text-sm">{profile?.full_name}</p>
                  <p className="text-xs text-zinc-400">@{profile?.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 mt-6">
              {[
                { name: 'Write a Story', path: '/write', icon: Plus, highlight: true },
                { name: 'Home Feed', path: '/home', icon: Home },
                { name: 'Saved Stories', path: '/bookmarks', icon: Bookmark },
                { name: 'My Stories & Drafts', path: '/dashboard', icon: Bookmark },
                { name: 'Subscriptions', path: '/subscriptions', icon: Bookmark },
                { name: 'Chat', path: '/chat', icon: MessageSquare },
                { name: 'Activity', path: '/activity', icon: Bell },
                { name: 'Explore', path: '/explore', icon: Compass },
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
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      item.highlight
                        ? 'bg-[#FF6719] text-white font-semibold'
                        : 'text-zinc-200 hover:text-white hover:bg-[#1c1c22]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-[#26262c]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Desktop & Tablet Layout Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex justify-center">
        {/* Left Column: Navigation Sidebar (Hidden on mobile < lg) */}
        <Sidebar className="hidden lg:flex" />

        {/* Center Column: Main Feed / Page Content */}
        <main className="flex-1 max-w-2xl w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8 border-x-0 lg:border-x border-[#222226] min-h-screen">
          {children}
        </main>

        {/* Right Column: Discovery Sidebar (Hidden on < xl) */}
        <RightSidebar className="hidden xl:flex" />
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop lg+) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121214]/95 backdrop-blur-md border-t border-[#222226] py-2 px-3 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive ? 'text-[#FF6719]' : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
