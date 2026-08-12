import React from 'react';
import { Sparkles, Trophy, BarChart3, Palette, Volume2, VolumeX, User, Bot, HelpCircle, Crown, ShieldCheck } from 'lucide-react';
import { ThemeConfig, UserStats } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { User as FirebaseUser } from 'firebase/auth';
import { isAdminUser } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'explore' | 'ai-gen' | 'leaderboard' | 'stats' | 'admin';
  setActiveTab: (tab: 'explore' | 'ai-gen' | 'leaderboard' | 'stats' | 'admin') => void;
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  openThemeModal: () => void;
  openUserModal: () => void;
  onGoogleSignIn?: () => void;
  userStats: UserStats;
  currentUser: FirebaseUser | null;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  openThemeModal,
  openUserModal,
  onGoogleSignIn,
  userStats,
  currentUser,
  isMuted,
  setIsMuted,
}) => {
  const isAdmin = isAdminUser(currentUser);

  const toggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const toggleDarkMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 border-b border-slate-800 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo-button"
        >
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-400 transition-colors">
            Q
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
              QUIZ<span className="text-indigo-400">PRO</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live Arena
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            id="nav-tab-explore"
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Explore
          </button>

          <button
            id="nav-tab-aigen"
            onClick={() => setActiveTab('ai-gen')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ai-gen'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            AI Generator
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-indigo-500/30">
              Gemini
            </span>
          </button>

          <button
            id="nav-tab-leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-orange-400" />
            Leaderboard
          </button>

          <button
            id="nav-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            My Stats
          </button>

          {/* Admin Tab (visible for Admin users or toggleable) */}
          <button
            id="nav-tab-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-amber-400/90 hover:text-amber-200 hover:bg-amber-950/40'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            Admin Panel
            {isAdmin && (
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1 rounded uppercase font-bold border border-amber-400/30">
                ADMIN
              </span>
            )}
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Score Display */}
          <div className="hidden lg:flex flex-col items-end pr-2">
            <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider font-mono">Current Score</span>
            <span className="text-base font-mono font-bold text-indigo-400">{userStats.totalScore.toLocaleString()}</span>
          </div>

          {/* Theme Builder */}
          <button
            id="theme-builder-button"
            onClick={openThemeModal}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            title="Theme Builder"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-button"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/60"
            title={isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Dark/Light mode button */}
          <button
            id="dark-light-toggle-button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors text-xs font-bold border border-slate-700/60"
            title="Toggle Light / Dark Mode"
          >
            {theme.mode === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Quick Continue with Google Button (when unauthenticated) */}
          {!currentUser && (
            <button
              id="nav-google-signin-button"
              onClick={onGoogleSignIn || openUserModal}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all border border-slate-200 shrink-0"
              title="Continue with Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* User Profile Button */}
          <button
            id="user-profile-button"
            onClick={openUserModal}
            className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all border ${
              currentUser
                ? 'bg-indigo-950/70 border-indigo-500/50 hover:bg-indigo-900/80'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60'
            }`}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userStats.username}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500/50"
              />
            ) : (
              <img
                src={userStats.avatar}
                alt={userStats.username}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500/50"
              />
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100 truncate max-w-[90px] leading-tight">
                {currentUser?.displayName || userStats.username}
              </span>
              <span className="text-[9px] font-mono font-semibold text-emerald-400 leading-tight">
                {currentUser ? (isAdmin ? '👑 Admin' : '✓ Signed In') : 'Sign In'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-900 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center py-1 px-2.5 rounded font-medium ${
            activeTab === 'explore' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" />
          Explore
        </button>
        <button
          onClick={() => setActiveTab('ai-gen')}
          className={`flex flex-col items-center py-1 px-2.5 rounded font-medium ${
            activeTab === 'ai-gen' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4 mb-0.5" />
          AI Quiz
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded font-medium ${
            activeTab === 'leaderboard' ? 'text-orange-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          Ranks
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center py-1 px-2.5 rounded font-medium ${
            activeTab === 'stats' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          Stats
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 px-2.5 rounded font-medium ${
            activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Crown className="w-4 h-4 mb-0.5" />
          Admin
        </button>
      </div>
    </header>
  );
};
