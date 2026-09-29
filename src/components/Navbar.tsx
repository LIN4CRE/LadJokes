import React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';
import { UserAccount } from '../types';
import { LadTierBadge } from './LadTierBadge';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  user: UserAccount | null;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  onOpenNotifications,
  onOpenAuth,
  user,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090d]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('dadJokes')}
          className="text-2xl font-display font-bold tracking-widest text-amber-500 hover:text-amber-400 transition-colors cursor-pointer select-none"
        >
          LAD JOKES
        </button>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('dadJokes')}
            className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'dadJokes'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dad Jokes</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
              Start
            </span>
          </button>
          <button
            onClick={() => onNavigate('book')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'book'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            The Book (18+)
          </button>
          <button
            onClick={() => onNavigate('community')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'community'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Confessions
          </button>
          <button
            onClick={() => onNavigate('polls')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'polls'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banter Polls
          </button>
          <button
            onClick={() => onNavigate('lounge')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'lounge'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Encrypted Lounge
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'admin'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Portal
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNotifications}
            aria-label="Open notifications"
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {user?.biometricRegistered ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="hidden sm:inline font-mono">
              {user ? user.nickname : 'Sign In'}
            </span>
            {user && (
              <span className="hidden md:inline">
                <LadTierBadge tier={user.tier || 'Pub Legend'} size="sm" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
