import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Crown,
  Users,
  Trophy,
  Trash2,
  RefreshCw,
  Database,
  Search,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { LeaderboardItem } from '../types';
import {
  getLeaderboardFromFirestore,
  deleteLeaderboardItemFromFirestore,
  getAllFirestoreUsers,
  isAdminUser,
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminViewProps {
  currentUser: FirebaseUser | null;
  primaryColor: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, primaryColor }) => {
  const isAdmin = isAdminUser(currentUser);

  const [activeAdminTab, setActiveAdminTab] = useState<'leaderboard' | 'users' | 'analytics'>('leaderboard');
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardItem[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setDeleteStatus(null);
    try {
      const items = await getLeaderboardFromFirestore('all', 'All');
      setLeaderboardItems(items);

      const users = await getAllFirestoreUsers();
      setFirestoreUsers(users);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteLeaderboardItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}'s score from the global leaderboard?`)) {
      return;
    }
    try {
      await deleteLeaderboardItemFromFirestore(id);
      setLeaderboardItems(prev => prev.filter(item => item.id !== id));
      setDeleteStatus(`Removed entry for ${name}`);
    } catch (e) {
      console.error('Failed to delete item:', e);
      setDeleteStatus('Failed to delete entry.');
    }
  };

  const filteredLeaderboard = leaderboardItems.filter(
    item =>
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = firestoreUsers.filter(
    u =>
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Admin Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/40 font-mono">
            <Crown className="w-3.5 h-3.5" /> Official Admin Portal & Control Panel
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Firestore Moderation
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
            Manage global quiz leaderboards, view authenticated users, inspect Firestore database records, and monitor overall app performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveAdminTab('leaderboard')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeAdminTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard Moderation ({leaderboardItems.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeAdminTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Registered Users ({firestoreUsers.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeAdminTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            System Metrics
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search records or users..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {deleteStatus && (
        <div className="mb-4 p-3 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold font-mono">
          {deleteStatus}
        </div>
      )}

      {/* TAB 1: LEADERBOARD MODERATION */}
      {activeAdminTab === 'leaderboard' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Global Leaderboard Records ({filteredLeaderboard.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Firestore Collection</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3">Subject / Category</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Accuracy</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-sans">
                      No leaderboard items found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3.5 font-sans">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.username}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-200">{item.username}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{item.createdAt?.slice(0, 10)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-indigo-400">{item.score.toLocaleString()} pts</td>
                      <td className="px-6 py-3.5 text-emerald-400">{item.accuracy}%</td>
                      <td className="px-6 py-3.5 text-slate-400">{item.timeSpentSeconds}s</td>
                      <td className="px-6 py-3.5 text-right font-sans">
                        <button
                          onClick={() => handleDeleteLeaderboardItem(item.id, item.username)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED FIRESTORE USERS */}
      {activeAdminTab === 'users' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Authenticated Firestore Accounts ({filteredUsers.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">users collection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredUsers.length === 0 ? (
              <p className="text-slate-500 text-xs font-mono col-span-3 text-center py-6">
                No registered user accounts found yet.
              </p>
            ) : (
              filteredUsers.map(u => (
                <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={u.username}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-200 truncate">{u.username || 'Quizzer'}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{u.email || 'Google / Email User'}</p>

                    <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">Total Score</span>
                        <span className="font-bold text-indigo-400">{u.totalScore || 0} pts</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Quizzes Taken</span>
                        <span className="font-bold text-emerald-400">{u.totalQuizzesPlayed || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM METRICS */}
      {activeAdminTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">Total Accounts</p>
            <p className="text-3xl font-extrabold text-white font-mono">{firestoreUsers.length}</p>
            <p className="text-[11px] text-slate-500">Authenticated via Google OAuth & Email</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">Leaderboard Scores</p>
            <p className="text-3xl font-extrabold text-white font-mono">{leaderboardItems.length}</p>
            <p className="text-[11px] text-slate-500">Entries recorded in Firestore database</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">Database Status</p>
            <p className="text-xl font-extrabold text-emerald-400 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Active & Synced
            </p>
            <p className="text-[11px] text-slate-500">Firestore (default) Cloud Database</p>
          </div>
        </div>
      )}
    </div>
  );
};
