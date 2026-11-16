import { insforge } from '../lib/insforge';

/**
 * Authentication Service wrapping @insforge/sdk auth methods
 */
export const authService = {
  /**
   * Register a new user with email, password, and display name.
   */
  async signUp({ email, password, name }) {
    try {
      const { data, error } = await insforge.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });
      if (data?.accessToken) {
        insforge.auth.saveSessionFromResponse(data);
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Verify an email address using the 6-digit OTP code sent by InsForge.
   */
  async verifyEmail({ email, otp }) {
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Resend the verification OTP code to the user's email.
   */
  async resendVerificationEmail({ email }) {
    try {
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email: email.trim().toLowerCase(),
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Normal login using email and password ONLY (no OTP).
   */
  async signIn({ email, password }) {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Sign out the active user and clear session.
   */
  async signOut() {
    try {
      const { error } = await insforge.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  /**
   * Get the current authenticated user session from InsForge.
   */
  async getCurrentUser() {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      return { user: data?.user || null, error };
    } catch (err) {
      return { user: null, error: err };
    }
  },

  /**
   * Request password reset email.
   */
  async sendResetPasswordEmail({ email, redirectTo }) {
    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({
        email: email.trim().toLowerCase(),
        redirectTo,
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Exchange 6-digit code for a reset password token.
   */
  async exchangeResetPasswordToken({ email, code }) {
    try {
      const { data, error } = await insforge.auth.exchangeResetPasswordToken({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Reset password with the token.
   */
  async resetPassword({ newPassword, otp }) {
    try {
      const { data, error } = await insforge.auth.resetPassword({
        newPassword,
        otp,
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
