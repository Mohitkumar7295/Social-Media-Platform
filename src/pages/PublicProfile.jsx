import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Feather, MapPin, Globe, Calendar, Users, Edit3, UserCheck, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { profileService } from '../services/profileService';
import { followService } from '../services/followService';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

export default function PublicProfile() {
  const { username } = useParams();
  const { user: currentUser, profile: currentProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const isOwnProfile =
    currentUser && profile && (currentUser.id === profile.id || currentProfile?.username === profile.username);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthorProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const { profile: authorProfile, error: profileError } =
          await profileService.getProfileByUsername(username);

        if (profileError || !authorProfile) {
          if (isMounted) {
            setError('Author profile not found.');
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setProfile(authorProfile);
        }

        // Load real follow counts from PostgreSQL follows table
        const counts = await followService.getFollowCounts(authorProfile.id);
        if (isMounted) {
          setFollowCounts(counts);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load profile.');
          setIsLoading(false);
        }
      }
    }

    loadAuthorProfile();

    return () => {
      isMounted = false;
    };
  }, [username]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light text-stone-900">
      <Navbar />

      <main className="flex-1 pt-20 pb-20">
        {isLoading ? (
          <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center animate-pulse mb-3">
              <Feather className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-sm text-stone-500">Loading writer profile...</p>
          </div>
        ) : error || !profile ? (
          <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
              Writer Not Found
            </h2>
            <p className="text-sm text-stone-600 mb-6">
              The writer <span className="font-semibold text-stone-800">@{username}</span> does not exist or has chosen a new handle.
            </p>
            <Link to="/">
              <Button variant="primary" size="md">
                Return to WriteSpace Home
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 1. Profile Cover Banner */}
            <div className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-stone-800 via-brand-900 to-stone-900 border border-stone-200 shadow-sm">
              {profile.cover_image_url ? (
                <img
                  src={profile.cover_image_url}
                  alt={`${profile.full_name}'s cover banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <Feather className="w-32 h-32 -rotate-12" />
                </div>
              )}
            </div>

            {/* 2. Profile Header & Overlapping Avatar */}
            <div className="relative px-4 sm:px-8 pb-6 -mt-16 sm:-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                
                {/* Circular Profile Avatar */}
                <div className="relative inline-block">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-3xl">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{profile.full_name?.charAt(0)?.toUpperCase() || 'W'}</span>
                    )}
                  </div>
                </div>

                {/* Profile Actions: Edit Profile (owner) or Disabled Follow (Phase 7 preview) */}
                <div className="flex items-center gap-3 pt-2 sm:pt-0">
                  {isOwnProfile ? (
                    <Link to="/settings/profile">
                      <Button variant="outline" size="sm" icon={Edit3}>
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <div className="relative group">
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed select-none"
                        title="Follow functionality will be implemented in Phase 7"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Follow (Phase 7)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Names & Bio */}
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                    {profile.full_name}
                  </h1>
                  <span className="text-sm font-medium text-stone-500">
                    @{profile.username}
                  </span>
                </div>

                {profile.bio && (
                  <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl font-serif">
                    {profile.bio}
                  </p>
                )}

                {/* Metadata Row: Location, Website, Joined Date */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-brand-700 transition"
                    >
                      <Globe className="w-3.5 h-3.5 text-stone-400" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Joined {formatDate(profile.created_at)}
                  </span>
                </div>

                {/* Real Followers & Following Counters from PostgreSQL */}
                <div className="flex items-center gap-6 pt-2 text-xs">
                  <div>
                    <strong className="font-bold text-stone-900 text-sm">
                      {followCounts.followersCount}
                    </strong>{' '}
                    <span className="text-stone-500">Followers</span>
                  </div>
                  <div>
                    <strong className="font-bold text-stone-900 text-sm">
                      {followCounts.followingCount}
                    </strong>{' '}
                    <span className="text-stone-500">Following</span>
                  </div>
                </div>
              </div>

              {/* 3. Profile Content Tabs */}
              <div className="mt-8 border-b border-stone-200">
                <nav className="flex space-x-8 text-sm font-medium">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${
                      activeTab === 'home'
                        ? 'border-brand-700 text-brand-700 font-semibold'
                        : 'border-transparent text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${
                      activeTab === 'posts'
                        ? 'border-brand-700 text-brand-700 font-semibold'
                        : 'border-transparent text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${
                      activeTab === 'about'
                        ? 'border-brand-700 text-brand-700 font-semibold'
                        : 'border-transparent text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    About
                  </button>
                </nav>
              </div>

              {/* 4. Tab Content Panels */}
              <div className="pt-6">
                {activeTab === 'home' && (
                  <div className="space-y-6">
                    {/* Welcome / Writer Introduction Card */}
                    <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Writer Introduction</span>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed">
                        {profile.bio || `${profile.full_name} is an active reader and author on WriteSpace.`}
                      </p>
                    </div>

                    {/* Clean Empty State for Articles (Phase 5 will activate real articles) */}
                    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
                      <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <h3 className="font-editorial text-lg font-bold text-stone-800">
                        No published articles yet
                      </h3>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                        When {profile.full_name} publishes an article on WriteSpace, it will appear here.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'posts' && (
                  <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
                    <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-editorial text-lg font-bold text-stone-800">
                      No posts published yet
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      Articles published in upcoming Phase 5 will be displayed chronologically in this tab.
                    </p>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                        About {profile.full_name}
                      </h3>
                      <p className="text-sm text-stone-700 leading-relaxed font-serif">
                        {profile.bio || 'This author has not added a detailed biography yet.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5">Member Since</span>
                        <span className="font-semibold text-stone-800">{formatDate(profile.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5">Author Handle</span>
                        <span className="font-semibold text-stone-800">@{profile.username}</span>
                      </div>
                      {profile.location && (
                        <div>
                          <span className="text-stone-400 block mb-0.5">Location</span>
                          <span className="font-semibold text-stone-800">{profile.location}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div>
                          <span className="text-stone-400 block mb-0.5">Personal Website</span>
                          <a
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-700 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
