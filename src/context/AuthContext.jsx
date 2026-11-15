import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to load profile for a given user
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    const { profile: userProfile, error } = await profileService.getProfileById(userId);
    if (!error && userProfile) {
      setProfile(userProfile);
      return userProfile;
    }
    return null;
  }, []);

  // Initialize and restore session on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      setIsLoading(true);
      try {
        const { user: currentUser } = await authService.getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
            await loadProfile(currentUser.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  // Login handler
  const login = async ({ email, password }) => {
    const { data, error } = await authService.signIn({ email, password });
    if (error) {
      return { success: false, error };
    }

    if (data?.user) {
      setUser(data.user);
      let userProfile = await loadProfile(data.user.id);

      // If user profile does not exist yet in PostgreSQL, generate it gracefully
      if (!userProfile) {
        const fallbackUsername = (data.user.profile?.name || data.user.email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .slice(0, 30);
        const { profile: createdProfile } = await profileService.createProfile({
          id: data.user.id,
          username: fallbackUsername,
          fullName: data.user.profile?.name || data.user.email.split('@')[0],
        });
        userProfile = createdProfile || null;
        setProfile(userProfile);
      }

      return { success: true, user: data.user, profile: userProfile };
    }

    return { success: false, error: new Error('Sign in failed') };
  };

  // Register / Sign Up handler
  const register = async ({ email, password, name, username }) => {
    const { data, error } = await authService.signUp({ email, password, name });
    if (error) {
      return { success: false, error };
    }

    const needsVerification = data?.requireEmailVerification || false;

    // If verification is not required, session is active immediately
    if (!needsVerification && data?.user) {
      setUser(data.user);
      if (username && name) {
        const { profile: createdProfile } = await profileService.createProfile({
          id: data.user.id,
          username: username.trim(),
          fullName: name.trim(),
        });
        setProfile(createdProfile || null);
      }
    }

    return {
      success: true,
      data,
      requireEmailVerification: needsVerification,
    };
  };

  // Verify Email OTP handler
  const verifyEmailOtp = async ({ email, otp, username, fullName }) => {
    const { data, error } = await authService.verifyEmail({ email, otp });
    if (error) {
      return { success: false, error };
    }

    if (data?.user) {
      setUser(data.user);

      // Check if profile exists, if not, create it in PostgreSQL
      let userProfile = await loadProfile(data.user.id);
      if (!userProfile && username && fullName) {
        const { profile: createdProfile } = await profileService.createProfile({
          id: data.user.id,
          username,
          fullName,
        });
        userProfile = createdProfile || null;
        setProfile(userProfile);
      }

      return { success: true, user: data.user, profile: userProfile };
    }

    return { success: false, error: new Error('Verification failed') };
  };

  // Resend Verification Code handler
  const resendCode = async ({ email }) => {
    return await authService.resendVerificationEmail({ email });
  };

  // Sign out handler
  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  // Manually refresh current profile state (e.g. after editing profile)
  const refreshProfile = async () => {
    if (user?.id) {
      return await loadProfile(user.id);
    }
    return null;
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    verifyEmailOtp,
    resendCode,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
