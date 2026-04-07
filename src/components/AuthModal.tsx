'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Globe } from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Account created! Redirecting...');
        setTimeout(() => {
          onClose();
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
      };
      setError(errorMessages[firebaseError.code || ''] || firebaseError.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-slate-deep/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl bg-cream p-8 shadow-elevated"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-light hover:text-slate-deep hover:bg-slate-deep/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-slate-deep">
                  {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="mt-2 text-sm text-slate-light">
                  {mode === 'signin'
                    ? 'Sign in to access your dashboard'
                    : 'Start writing better job descriptions'}
                </p>
              </div>

              {/* Google sign in */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-deep/10 bg-white px-4 py-3 text-sm font-medium text-slate-deep hover:bg-slate-deep/[0.03] transition-colors disabled:opacity-50"
              >
                <Globe className="w-5 h-5" />
                Sign in with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-deep/10" />
                <span className="text-xs text-slate-light">or</span>
                <div className="flex-1 h-px bg-slate-deep/10" />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-medium text-slate-deep mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full rounded-xl border border-slate-deep/10 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-deep placeholder:text-slate-light/50 outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-medium text-slate-deep mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === 'signup'
                          ? 'At least 6 characters'
                          : 'Enter your password'
                      }
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-deep/10 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-deep placeholder:text-slate-light/50 outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-all"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    className="text-sm text-coral bg-coral-bg rounded-lg px-3 py-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* Success message */}
                {message && (
                  <motion.p
                    className="text-sm text-mint bg-mint-bg rounded-lg px-3 py-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-deep py-3 text-sm font-semibold text-cream hover:bg-slate-medium transition-colors disabled:opacity-50"
                >
                  {loading
                    ? 'Loading...'
                    : mode === 'signin'
                    ? 'Sign in'
                    : 'Create account'}
                </button>
              </form>

              {/* Toggle mode */}
              <p className="mt-6 text-center text-sm text-slate-light">
                {mode === 'signin'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-coral hover:text-coral-dark transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
