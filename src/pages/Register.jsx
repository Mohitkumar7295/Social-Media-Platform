import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import Button from '../components/common/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyEmailOtp, resendCode, isAuthenticated } = useAuth();

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step state: 1 = Registration form, 2 = OTP verification screen
  const [step, setStep] = useState(1);

  // Form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });

  // OTP state
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Debounced check username availability
  useEffect(() => {
    const rawUsername = formData.username.trim();
    if (!rawUsername) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUsername)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Must be 3–30 characters, alphanumeric and underscores only.',
      });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' });
      const { available, error } = await profileService.checkUsernameAvailable(rawUsername);
      if (error) {
        setUsernameStatus({ checking: false, available: null, message: 'Could not check username' });
      } else if (available) {
        setUsernameStatus({ checking: false, available: true, message: 'Username is available!' });
      } else {
        setUsernameStatus({ checking: false, available: false, message: 'Username is already taken.' });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage('');
  };

  // Step 1: Submit Registration Form
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!formData.username.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(formData.username.trim())) {
      setErrorMessage('Username must be 3–30 alphanumeric characters or underscores.');
      return;
    }
    if (usernameStatus.available === false) {
      setErrorMessage('Please select an available username.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 3 check again
      const { available } = await profileService.checkUsernameAvailable(formData.username.trim());
      if (!available) {
        setErrorMessage('Username was just taken. Please choose another.');
        setIsSubmitting(false);
        return;
      }

      // Step 4 & 5: Initiate InsForge Auth signup
      const { success, requireEmailVerification, error } = await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      });

      if (!success || error) {
        setErrorMessage(error?.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // If email verification is required, advance to Step 2 OTP Screen
      if (requireEmailVerification) {
        setStep(2);
        setCountdown(60);
        setCanResend(false);
      } else {
        // If email verification not required, finish profile creation and navigate
        navigate('/', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    if (!otp.trim() || otp.trim().length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      const { success, error } = await verifyEmailOtp({
        email: formData.email,
        otp: otp.trim(),
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
      });

      if (!success || error) {
        setOtpError(error?.message || 'Invalid or expired verification code. Please try again.');
        setIsVerifying(false);
        return;
      }

      setOtpSuccess('Email verified successfully! Welcome to WriteSpace.');
      setTimeout(() => {
        navigate(`/profile/${formData.username.trim().toLowerCase()}`, { replace: true });
      }, 1200);
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpError('');
    setOtpSuccess('Sending new code...');
    setCanResend(false);
    setCountdown(60);

    const { error } = await resendCode({ email: formData.email });
    if (error) {
      setOtpError(error.message || 'Failed to resend verification code.');
      setCanResend(true);
    } else {
      setOtpSuccess('A new 6-digit verification code has been sent to your email.');
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-800 transition">
            <Feather className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-stone-900">
            WriteSpace
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/50 rounded-2xl border border-stone-200/80">
          
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="font-editorial text-2xl font-bold text-stone-900">
                  Create Your Account
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Join a community of thoughtful writers and readers.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name
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
                      placeholder="Elena Rostova"
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Username
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
                      placeholder="erostova"
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                  </div>
                  {usernameStatus.message && (
                    <p
                      className={`text-[11px] mt-1 flex items-center gap-1 ${
                        usernameStatus.available === true
                          ? 'text-emerald-600'
                          : usernameStatus.available === false
                          ? 'text-rose-600'
                          : 'text-stone-500'
                      }`}
                    >
                      {usernameStatus.available === true && <CheckCircle2 className="w-3 h-3" />}
                      {usernameStatus.available === false && <AlertCircle className="w-3 h-3" />}
                      <span>{usernameStatus.message}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="elena@example.com"
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Minimum 6 characters</span>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || usernameStatus.available === false}
                  className="w-full justify-center mt-3 shadow-md"
                >
                  {isSubmitting ? 'Creating Account...' : 'Continue to Verification'}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-stone-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800 underline">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification Screen */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="font-editorial text-2xl font-bold text-stone-900">
                  Verify Your Email
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  We sent a 6-digit verification code to
                </p>
                <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-0.5">
                  {formData.email}
                </p>
              </div>

              {otpError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isVerifying || otp.length < 6}
                  className="w-full justify-center shadow-md"
                >
                  {isVerifying ? 'Verifying Code...' : 'Verify Email & Complete Registration'}
                </Button>
              </form>

              {/* Resend and change email options */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col items-center gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span>Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-brand-700 hover:text-brand-800 underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-stone-400">Resend in {countdown}s</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-stone-400 hover:text-stone-600 text-[11px] underline"
                >
                  Change email or details
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
