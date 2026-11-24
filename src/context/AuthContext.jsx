import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge } from '../lib/insforge';
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
    const cleanEmail = email.trim().toLowerCase();
    let authResult = await authService.signUp({ email: cleanEmail, password, name });

    // If user already exists in Auth from a previous attempt, attempt to sign in with password
    if (
      authResult.error &&
      (authResult.error.message?.includes('already registered') ||
        authResult.error.message?.includes('already exists') ||
        authResult.error.statusCode === 409 ||
        authResult.error.code === 'USER_ALREADY_EXISTS')
    ) {
      const signInResult = await authService.signIn({ email: cleanEmail, password });
      if (!signInResult.error) {
        authResult = signInResult;
      }
    }

    if (authResult.error) {
      return { success: false, error: authResult.error };
    }

    const data = authResult.data;

    // Persist session token immediately
    if (data?.accessToken) {
      insforge.auth.saveSessionFromResponse(data);
    }

    // Direct registration without OTP requirement
    if (data?.user) {
      setUser(data.user);
      if (username && name) {
        try {
          const existingProfile = await loadProfile(data.user.id);
          if (!existingProfile) {
            const { profile: createdProfile } = await profileService.createProfile({
              id: data.user.id,
              username: username.trim(),
              fullName: name.trim(),
            });
            setProfile(createdProfile || null);
          } else {
            setProfile(existingProfile);
          }
        } catch (pErr) {
          console.error('Error creating user profile during signup:', pErr);
        }
      }
    }

    return {
      success: true,
      data,
      requireEmailVerification: false,
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
