'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogIn } from 'lucide-react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

interface NavbarProps {
  onSignInClick?: () => void;
}

export default function Navbar({ onSignInClick }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream/80 backdrop-blur-xl border-b border-slate-deep/10 shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.svg"
              alt="Rolecheck"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-display text-xl font-bold text-slate-deep">
              Rolecheck
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-deep/70 hover:text-slate-deep transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth button - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-mint flex items-center justify-center text-white text-xs font-bold">
                    {(user.email || user.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-deep/70 max-w-[160px] truncate">
                    {user.email || user.displayName}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-slate-light hover:text-coral transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-deep px-4 py-2 text-sm font-medium text-cream hover:bg-slate-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-deep hover:bg-slate-deep/5 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-xl border-b border-slate-deep/10">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-slate-deep/70 hover:text-slate-deep py-2 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-deep/10">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-mint flex items-center justify-center text-white text-xs font-bold">
                      {(user.email || user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-deep/70 truncate">
                      {user.email || user.displayName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="text-sm text-slate-light hover:text-coral transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSignInClick?.();
                    setMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-deep px-4 py-2 text-sm font-medium text-cream hover:bg-slate-medium transition-colors w-full justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
