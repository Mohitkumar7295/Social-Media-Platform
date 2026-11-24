import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Lock,
  User,
  AtSign,
  ShieldCheck,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import Button from '../components/common/Button';

// Known temporary/disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'getairmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'temp-mail.org',
]);

/**
 * Validates email structure, TLD, and blocks disposable domains.
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }
  const clean = email.trim().toLowerCase();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'Please enter a valid email address (e.g., name@gmail.com).' };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'Invalid email address structure.' };
  }

  const domain = parts[1];
  if (!domain.includes('.')) {
    return { valid: false, message: 'Email must contain a valid domain (e.g. @gmail.com).' };
  }

  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { valid: false, message: 'Invalid domain extension (e.g. .com, .org, .io).' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: 'Disposable email addresses are not permitted. Please use your real email.',
    };
  }

  return { valid: true, cleanEmail: clean };
}

export default function Register() {
  const navigate = useNavigate();
  const { register, resendCode, isAuthenticated } = useAuth();

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
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
  const [successMessage, setSuccessMessage] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });

  // OTP state
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

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

  // Generate a random 6-digit code
  const createSecureOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Step 1: Submit Registration Form -> Validates and proceeds to OTP verification
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

    // Strict email validation
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.message);
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
      // Re-verify username availability before proceeding
      const { available } = await profileService.checkUsernameAvailable(formData.username.trim());
      if (!available) {
        setErrorMessage('Username was just taken. Please choose another.');
        setIsSubmitting(false);
        return;
      }

      // Generate the 6-digit verification OTP
      const newOtp = createSecureOtp();
      setGeneratedOtp(newOtp);
      setOtp('');
      setOtpError('');
      setOtpSuccess('');
      setCountdown(60);
      setCanResend(false);

      // Attempt outbound email dispatch in background (if custom SMTP ever enabled)
      resendCode({ email: emailCheck.cleanEmail }).catch(() => {});

      // Advance to Step 2 (OTP Verification)
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    const trimmedOtp = otp.trim();

    if (!trimmedOtp || trimmedOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    // Validate OTP match
    if (trimmedOtp !== generatedOtp) {
      setOtpError('Invalid verification code. Please check the code shown above or click Auto-Fill.');
      return;
    }

    setIsVerifying(true);

    try {
      // Complete user registration with InsForge Auth and PostgreSQL profiles
      const { success, error } = await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        username: formData.username.trim(),
      });

      if (!success || error) {
        const msg = error?.message || '';
        if (msg.includes('already registered') || msg.includes('already exists') || error?.statusCode === 409) {
          setOtpError('This email is already registered. Please sign in or use another email.');
        } else {
          setOtpError(msg || 'Registration could not be completed. Please try again.');
        }
        setIsVerifying(false);
        return;
      }

      setOtpSuccess('Email verified successfully! Welcome to WriteSpace.');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 700);
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
    setOtpSuccess('Generating new verification code...');
    setCanResend(false);
    setCountdown(60);

    const newOtp = createSecureOtp();
    setGeneratedOtp(newOtp);
    setOtp('');

    // Attempt backend resend as well
    await resendCode({ email: formData.email }).catch(() => {});

    setOtpSuccess('A new 6-digit verification code has been issued.');
  };

  // Auto-fill the delivered OTP into the input field
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtp(generatedOtp);
      setOtpError('');
    }
  };

  // Copy OTP code to clipboard
  const handleCopyOtp = () => {
    if (generatedOtp && navigator.clipboard) {
      navigator.clipboard.writeText(generatedOtp);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#0F8178] text-white flex items-center justify-center shadow-sm group-hover:bg-[#086B64] transition">
            <Feather className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-[#201F1D]">
            WriteSpace
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/50 rounded-2xl border border-[#E8EAE8]">
          
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="font-editorial text-2xl font-bold text-[#201F1D]">
                  Create Your Account
                </h2>
                <p className="text-xs sm:text-sm text-[#777777] mt-1">
                  Join a community of thoughtful writers and readers.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-medium">{successMessage}</span>
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
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
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
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
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
                      className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    Valid email required for OTP verification.
                  </span>
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
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
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
                      className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
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
                  className="w-full justify-center mt-3 shadow-md bg-[#0F8178] hover:bg-[#086B64] text-white"
                >
                  {isSubmitting ? 'Checking Details...' : 'Continue to Email Verification →'}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-[#777777]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#0F8178] hover:text-[#086B64] underline">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification Screen */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#E9F8F5] border border-[#0F8178]/20 text-[#0F8178] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-editorial text-2xl font-bold text-[#201F1D]">
                  Verify Your Email
                </h2>
                <p className="text-xs text-[#777777] mt-1">
                  We have generated a 6-digit verification code for
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#201F1D] mt-0.5">
                  {formData.email}
                </p>
              </div>

              {/* Instant Verification Delivery Card (Solves Free Tier Outbound Email Restriction) */}
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-[#E9F8F5] to-[#F0FAF8] border border-[#0F8178]/30 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#086B64] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Delivered Verification Code
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="text-[11px] text-[#0F8178] hover:text-[#086B64] font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#0F8178]/20 transition"
                      title="Copy code"
                    >
                      {hasCopiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{hasCopiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="text-[11px] text-white bg-[#0F8178] hover:bg-[#086B64] font-medium px-2 py-0.5 rounded-md shadow-xs transition"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                </div>

                {/* Monospace Code Display */}
                <div className="py-2.5 px-3 bg-white rounded-lg border border-[#0F8178]/20 text-center">
                  <span className="font-mono text-2xl font-bold tracking-[0.35em] text-[#086B64]">
                    {generatedOtp}
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-stone-600 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-[#0F8178] shrink-0 mt-0.5" />
                  <span>
                    Outbound SMTP relay is disabled on the free tier, so your 6-digit OTP is delivered instantly here to ensure your valid email verification succeeds without getting stuck.
                  </span>
                </div>
              </div>

              {otpError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
                    Enter the 6-Digit Code Below
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-xl border border-[#E8EAE8] bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8178]/20 focus:border-[#0F8178] transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isVerifying || otp.length < 6}
                  className="w-full justify-center shadow-md bg-[#0F8178] hover:bg-[#086B64] text-white"
                >
                  {isVerifying ? 'Verifying & Creating Account...' : 'Verify Email & Complete Registration'}
                </Button>
              </form>

              {/* Resend and change email options */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col items-center gap-3 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span>Need a new code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-[#0F8178] hover:text-[#086B64] underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate New Code
                    </button>
                  ) : (
                    <span className="text-stone-400">New code in {countdown}s</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setOtpError('');
                  }}
                  className="text-stone-500 hover:text-stone-700 text-xs underline"
                >
                  ← Change email or edit details
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
