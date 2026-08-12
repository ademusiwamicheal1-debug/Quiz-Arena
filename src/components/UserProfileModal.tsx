import React, { useState } from 'react';
import {
  X,
  Check,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Crown,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { UserStats } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  logoutUser,
  getUserStatsFromFirestore,
  saveUserStatsToFirestore,
  isAdminUser,
} from '../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  currentUser: FirebaseUser | null;
  primaryColor: string;
  initialAuthError?: string | null;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userStats,
  setUserStats,
  currentUser,
  primaryColor,
  initialAuthError,
}) => {
  const [usernameInput, setUsernameInput] = useState(userStats.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.avatar);

  // Auth Mode: 'google' | 'email-signin' | 'email-signup' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'google' | 'email-signin' | 'email-signup' | 'forgot-password'>('google');

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading & Messages
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(initialAuthError || null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialAuthError) {
      setAuthError(initialAuthError);
      setAuthMode('email-signin');
    }
  }, [isOpen, initialAuthError]);

  if (!isOpen) return null;

  const isAdmin = isAdminUser(currentUser);

  const handleGoogleSignIn = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setAuthSuccess(`Welcome, ${user.displayName || user.email}!`);
        const firestoreStats = await getUserStatsFromFirestore(user.uid);
        if (firestoreStats) {
          setUserStats(firestoreStats);
          setUsernameInput(firestoreStats.username);
          setSelectedAvatar(firestoreStats.avatar);
        } else {
          const newStats: UserStats = {
            ...userStats,
            username: user.displayName || userStats.username,
            avatar: user.photoURL || userStats.avatar,
          };
          setUserStats(newStats);
          setUsernameInput(newStats.username);
          setSelectedAvatar(newStats.avatar);
          await saveUserStatsToFirestore(user.uid, newStats, user.email || '');
        }
      }
    } catch (error: any) {
      let rawMsg = error?.message || error?.code || '';
      if (rawMsg.includes('auth/cancelled-popup-request') || rawMsg.includes('auth/popup-closed-by-user')) {
        return;
      }
      console.error('Google Auth Error:', error);
      let friendlyMsg = 'Failed to sign in with Google.';

      if (rawMsg.includes('auth/configuration-not-found') || rawMsg.includes('auth/operation-not-allowed')) {
        friendlyMsg =
          'Firebase Authentication is not yet enabled in the Firebase Console for project "quiz-pro-30283". To enable it, visit Firebase Console > Authentication > Sign-in method. You can also customize your Player Name below and play all quizzes right now!';
      } else if (rawMsg.includes('auth/popup-blocked')) {
        friendlyMsg = 'Browser blocked the popup window. Switched to Email Sign-In below.';
        setAuthMode('email-signin');
      } else if (rawMsg.includes('auth/unauthorized-domain')) {
        friendlyMsg = 'Current app domain is not listed in Authorized Domains in Firebase Console. Please use Email / Gmail Sign-In below.';
        setAuthMode('email-signin');
      } else if (rawMsg) {
        friendlyMsg = rawMsg;
      }

      setAuthError(friendlyMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === 'email-signup') {
        if (!emailInput || !passwordInput) {
          throw new Error('Please enter both email and password.');
        }
        if (passwordInput.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const user = await signUpWithEmail(emailInput, passwordInput, displayNameInput || 'Quizzer');
        setAuthSuccess('Account created successfully! Syncing profile...');
        
        const newStats: UserStats = {
          ...userStats,
          username: displayNameInput.trim() || emailInput.split('@')[0],
          avatar: selectedAvatar,
        };
        setUserStats(newStats);
        setUsernameInput(newStats.username);
        await saveUserStatsToFirestore(user.uid, newStats, user.email || '');
      } else if (authMode === 'email-signin') {
        if (!emailInput || !passwordInput) {
          throw new Error('Please enter your email and password.');
        }
        const user = await signInWithEmail(emailInput, passwordInput);
        setAuthSuccess(`Welcome back, ${user.displayName || user.email}!`);
        const firestoreStats = await getUserStatsFromFirestore(user.uid);
        if (firestoreStats) {
          setUserStats(firestoreStats);
          setUsernameInput(firestoreStats.username);
          setSelectedAvatar(firestoreStats.avatar);
        }
      } else if (authMode === 'forgot-password') {
        if (!emailInput) {
          throw new Error('Please enter your email address to receive reset instructions.');
        }
        await sendPasswordReset(emailInput);
        setAuthSuccess(`Password reset email sent to ${emailInput}. Check your inbox!`);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let msg = error.message || 'Authentication failed.';
      if (msg.includes('auth/configuration-not-found') || msg.includes('auth/operation-not-allowed')) {
        msg =
          'Firebase Authentication (Email Provider) is not enabled in Firebase Console for project "quiz-pro-30283". Enable Email/Password under Authentication > Sign-in method, or customize your local Player Profile below!';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid credentials or account does not exist. If you do not have an account yet, switch to "Create Account" above!';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try signing in instead!';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please provide a valid Gmail or email address.';
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await logoutUser();
      setAuthSuccess('Signed out successfully.');
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      const updatedStats: UserStats = {
        ...userStats,
        username: usernameInput.trim(),
        avatar: selectedAvatar,
      };
      setUserStats(updatedStats);

      if (currentUser) {
        await saveUserStatsToFirestore(currentUser.uid, updatedStats, currentUser.email || '');
      }

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-100"
        id="user-profile-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              {isAdmin ? <Crown className="w-5 h-5 text-amber-300" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-none text-slate-100">
                  {currentUser ? (isAdmin ? 'Admin Portal Account' : 'Player Account') : 'Authentication & Sign In'}
                </h3>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Google & Gmail Authentication + Firestore Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authenticated User Status Card OR Auth Options */}
        <div className="p-6 pb-2">
          {currentUser ? (
            <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-11 h-11 rounded-lg object-cover ring-2 ring-indigo-500 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authenticated ({isAdmin ? 'Admin' : 'User'})</span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {currentUser.displayName || userStats.username}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isAuthLoading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-400 border border-slate-700 shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
              {/* Auth Mode Toggle Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('google');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'google'
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Google 1-Click
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email-signin');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    authMode !== 'google'
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email / Gmail
                </button>
              </div>

              {/* GOOGLE OAuth Mode */}
              {authMode === 'google' && (
                <div className="text-center space-y-3 pt-1">
                  <p className="text-xs text-slate-300 font-medium">
                    Sign in or register instantly with your Google or Gmail account to sync stats and record scores on the global leaderboard.
                  </p>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-colors"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                    ) : (
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
                    )}
                    <span>Sign in with Google / Gmail</span>
                  </button>
                </div>
              )}

              {/* EMAIL / GMAIL Password Mode */}
              {authMode !== 'google' && (
                <form onSubmit={handleEmailAuthSubmit} className="space-y-3 pt-1">
                  {/* Email & Password Mode Switcher */}
                  <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email-signin');
                        setAuthError(null);
                      }}
                      className={`font-bold ${
                        authMode === 'email-signin' ? 'text-indigo-400 underline' : 'text-slate-400'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email-signup');
                        setAuthError(null);
                      }}
                      className={`font-bold ${
                        authMode === 'email-signup' ? 'text-indigo-400 underline' : 'text-slate-400'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setAuthError(null);
                      }}
                      className={`font-bold ${
                        authMode === 'forgot-password' ? 'text-indigo-400 underline' : 'text-slate-400'
                      }`}
                    >
                      Reset Password
                    </button>
                  </div>

                  {/* Display Name (Sign Up only) */}
                  {authMode === 'email-signup' && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Full Name / Display Nickname
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={displayNameInput}
                          onChange={e => setDisplayNameInput(e.target.value)}
                          placeholder="e.g. Alex Quizmaster"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Gmail or Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Password Input (if not forgot password mode) */}
                  {authMode !== 'forgot-password' && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={e => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : authMode === 'email-signup' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up with Email</span>
                      </>
                    ) : authMode === 'email-signin' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Account</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Status Feedback Banners */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs font-medium space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Authentication Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-100/90">{authError}</p>

                  {/* Quick helper buttons depending on error type */}
                  {authError.includes('Invalid credentials') && authMode === 'email-signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email-signup');
                        setAuthError(null);
                      }}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Switch to Create Account</span>
                    </button>
                  )}

                  {authError.includes('Firebase Console') && (
                    <div className="pt-1">
                      <p className="text-[10px] text-amber-300/80 font-mono mb-1">
                        💡 No Firebase Auth configured? You can still play all quizzes, record your scores locally, and personalize your display name below:
                      </p>
                    </div>
                  )}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[11px] text-emerald-100/90 font-bold">{authSuccess}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Customization Form */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5 border-t border-slate-800">
          {/* Username input */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Player Display Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="Enter your nickname..."
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Select Profile Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((avatarUrl, idx) => {
                const isSelected = selectedAvatar === avatarUrl;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(avatarUrl)}
                    className={`relative p-1 rounded-xl border-2 transition-all overflow-hidden ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={avatarUrl} alt="Avatar option" className="w-full h-14 object-cover rounded-lg" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-[1px] flex items-center justify-center text-white">
                        <Check className="w-5 h-5 drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
