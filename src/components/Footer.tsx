import Link from 'next/link';
import Image from 'next/image';
import { GitBranch, AtSign, Briefcase } from 'lucide-react';

const FOOTER_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

const SOCIAL_LINKS = [
  { href: '#', label: 'GitHub', icon: GitBranch },
  { href: '#', label: 'Twitter', icon: AtSign },
  { href: '#', label: 'LinkedIn', icon: Briefcase },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-deep/10 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Rolecheck"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span className="font-display text-lg font-bold text-slate-deep">
                Rolecheck
              </span>
            </Link>
            <p className="text-sm text-slate-light leading-relaxed max-w-xs">
              Write inclusive, effective job descriptions that attract diverse
              talent pools.
            </p>
            <p className="text-xs text-slate-light/60">
              Powered by Claude AI
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-deep mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-light hover:text-slate-deep transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-slate-deep mb-4">
              Connect
            </h4>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-deep/5 flex items-center justify-center text-slate-light hover:text-slate-deep hover:bg-slate-deep/10 transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-deep/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-light/60">
            &copy; {new Date().getFullYear()} Rolecheck. All rights reserved.
          </p>
          <p className="text-xs text-slate-light/40">
            Built for better hiring.
          </p>
        </div>
      </div>
    </footer>
  );
}
