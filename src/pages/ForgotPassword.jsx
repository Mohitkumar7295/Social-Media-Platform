import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authService.sendResetPasswordEmail({
        email: email.trim(),
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to send reset email.');
        setIsSubmitting(false);
        return;
      }

      setIsSent(true);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          
          {!isSent ? (
            <div>
              <div className="mb-6 text-center">
                <h2 className="font-editorial text-2xl font-bold text-stone-900">
                  Reset Password
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Enter your email address to receive password recovery instructions.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="writer@writespace.app"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 transition"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full justify-center mt-3 shadow-md"
                >
                  {isSubmitting ? 'Sending Request...' : 'Send Recovery Code'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Check Your Email
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                If an account exists with <strong className="text-stone-900">{email}</strong>, you will receive password reset instructions.
              </p>
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full justify-center shadow-md"
                >
                  Enter Reset Code & Set Password
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
