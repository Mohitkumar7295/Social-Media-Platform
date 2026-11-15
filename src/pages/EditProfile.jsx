import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Camera, Upload, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Globe, MapPin, AtSign, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { storageService } from '../services/storageService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    website: '',
    location: '',
  });

  // Current images & preview states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Status indicators
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Username validation
  const [usernameCheck, setUsernameCheck] = useState({
    checking: false,
    available: null,
    message: '',
  });

  // Populate existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
      });
      setAvatarPreview(profile.avatar_url || null);
      setCoverPreview(profile.cover_image_url || null);
      setIsLoadingProfile(false);
    }
  }, [profile]);

  // Username check when username field changes
  useEffect(() => {
    const rawUsername = formData.username.trim().toLowerCase();
    if (!rawUsername || !profile) return;

    if (rawUsername === profile.username.toLowerCase()) {
      setUsernameCheck({ checking: false, available: true, message: 'Current username' });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUsername)) {
      setUsernameCheck({
        checking: false,
        available: false,
        message: 'Must be 3–30 characters, alphanumeric and underscores only.',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameCheck({ checking: true, available: null, message: 'Checking availability...' });
      const { available, error } = await profileService.checkUsernameAvailable(rawUsername, user.id);
      if (error) {
        setUsernameCheck({ checking: false, available: null, message: 'Could not check username' });
      } else if (available) {
        setUsernameCheck({ checking: false, available: true, message: 'Username is available' });
      } else {
        setUsernameCheck({ checking: false, available: false, message: 'Username is taken by another author' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username, profile, user?.id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Cover banner file selection
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }
    if (!formData.username.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(formData.username.trim())) {
      setErrorMessage('Username must be 3–30 alphanumeric characters or underscores.');
      return;
    }
    if (usernameCheck.available === false) {
      setErrorMessage('Please select an available username.');
      return;
    }

    setIsSaving(true);

    try {
      let newAvatarUrl = profile.avatar_url;
      let newAvatarKey = profile.avatar_key;
      let newCoverUrl = profile.cover_image_url;
      let newCoverKey = profile.cover_image_key;

      // 1. Upload new avatar if changed
      if (avatarFile) {
        const { data: uploadData, error: uploadError } = await storageService.uploadAvatar(
          user.id,
          avatarFile
        );
        if (uploadError) {
          setErrorMessage(`Failed to upload avatar: ${uploadError.message}`);
          setIsSaving(false);
          return;
        }
        newAvatarUrl = uploadData.url;
        newAvatarKey = uploadData.key;
      }

      // 2. Upload new cover banner if changed
      if (coverFile) {
        const { data: uploadData, error: uploadError } = await storageService.uploadCover(
          user.id,
          coverFile
        );
        if (uploadError) {
          setErrorMessage(`Failed to upload banner: ${uploadError.message}`);
          setIsSaving(false);
          return;
        }
        newCoverUrl = uploadData.url;
        newCoverKey = uploadData.key;
      }

      // 3. Update PostgreSQL profile record
      const { profile: updatedProfile, error: updateError } = await profileService.updateProfile(
        user.id,
        {
          fullName: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
          avatarUrl: newAvatarUrl,
          avatarKey: newAvatarKey,
          coverImageUrl: newCoverUrl,
          coverImageKey: newCoverKey,
        }
      );

      if (updateError || !updatedProfile) {
        setErrorMessage(updateError?.message || 'Failed to save profile changes.');
        setIsSaving(false);
        return;
      }

      // 4. Refresh global AuthContext state
      await refreshProfile();

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light text-stone-900">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
            <div>
              <Link
                to={profile ? `/profile/${profile.username}` : '/'}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Public Profile
              </Link>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                Edit Profile
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Manage your public author persona, avatar, and bio.
              </p>
            </div>

            {profile && (
              <Link to={`/profile/${profile.username}`}>
                <Button variant="ghost" size="sm">
                  View Public Profile
                </Button>
              </Link>
            )}
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-stone-200/80 shadow-sm">
            
            {/* 1. Cover Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Cover Banner
              </label>
              <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                    <Upload className="w-8 h-8 mb-1" />
                    <span className="text-xs">No cover image uploaded</span>
                  </div>
                )}
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold gap-2 backdrop-blur-[2px]">
                  <Camera className="w-4 h-4" />
                  <span>Change Cover Banner</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[11px] text-stone-400 block mt-1">Recommended: 1200x400 JPG, PNG or WebP. Max 5MB.</span>
            </div>

            {/* 2. Avatar Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-100 ring-2 ring-stone-200 shrink-0 group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-2xl">
                      {formData.fullName?.charAt(0)?.toUpperCase() || 'W'}
                    </div>
                  )}
                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-semibold gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Square photo recommended. JPG, PNG, or WebP up to 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Text Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-stone-100">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Elena Rostova"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="erostova"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                  />
                </div>
                {usernameCheck.message && (
                  <p
                    className={`text-[11px] mt-1 flex items-center gap-1 ${
                      usernameCheck.available === true
                        ? 'text-emerald-600'
                        : usernameCheck.available === false
                        ? 'text-rose-600'
                        : 'text-stone-500'
                    }`}
                  >
                    {usernameCheck.available === true && <CheckCircle2 className="w-3 h-3" />}
                    {usernameCheck.available === false && <AlertCircle className="w-3 h-3" />}
                    <span>{usernameCheck.message}</span>
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="San Francisco, CA"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://elenarostova.com"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                  />
                </div>
              </div>

              {/* Bio (Full width) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Author & Essayist exploring deep work, systems, and literature..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition font-serif"
                />
                <span className="text-[11px] text-stone-400 block mt-1">
                  Brief description of your background and publications.
                </span>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving || usernameCheck.available === false}
                className="shadow-md"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
