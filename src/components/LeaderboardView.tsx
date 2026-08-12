import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Filter, RefreshCw } from 'lucide-react';
import { LeaderboardItem } from '../types';
import { getLeaderboardFromFirestore } from '../lib/firebase';

interface LeaderboardViewProps {
  primaryColor: string;
}

const CATEGORY_OPTIONS = [
  'All',
  'Mathematics',
  'Further Mathematics',
  'Biology',
  'Agricultural Science',
  'Physics',
  'Chemistry',
  'English Language',
  'Literature in English',
  'Civic Education',
  'Government & Politics',
  'Fine Arts',
  'Music',
  'French',
  'Economics',
  'Commerce',
  'Financial Accounting',
  'Technology & AI',
  'Information Technology',
  'World History',
  'Geography',
  'Pop Culture',
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ primaryColor }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Firestore persistent database
      const firestoreItems = await getLeaderboardFromFirestore(timeframe, categoryFilter);

      // 2. Fetch from local backend API as fallback/supplement
      const url = `/api/leaderboard?timeframe=${timeframe}&category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      const apiItems = data.leaderboard || [];

      // Combine and deduplicate
      const combinedMap = new Map<string, LeaderboardItem>();
      firestoreItems.forEach(item => combinedMap.set(item.id, item));
      apiItems.forEach((item: LeaderboardItem) => {
        if (!combinedMap.has(item.id)) {
          combinedMap.set(item.id, item);
        }
      });

      const sorted = Array.from(combinedMap.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.timeSpentSeconds - b.timeSpentSeconds;
      });

      setLeaderboard(sorted);
    } catch (e) {
      console.error('Error fetching leaderboards:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, categoryFilter]);

  // Podium positions
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restList = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" id="leaderboard-container">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-3 border border-indigo-500/30 font-mono">
          <Trophy className="w-3.5 h-3.5 text-orange-400" /> Global Hall of Fame
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-2">
          Live Quiz Leaderboards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          See who dominates the 30-second speed challenge rankings worldwide!
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Timeframe Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setTimeframe('daily')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              timeframe === 'daily'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              timeframe === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLeaderboard}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 3 Winners Podium */}
      {leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end mb-10 pt-4">
          {/* 2nd Place */}
          <div className="text-center order-1">
            {top2 ? (
              <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-xl relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl overflow-hidden ring-2 ring-slate-600 mb-2">
                  <img src={top2.avatar} alt={top2.username} className="w-full h-full object-cover" />
                </div>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold text-xs mb-1 font-mono">
                  02
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                  {top2.username}
                </h3>
                <p className="font-bold font-mono text-sm text-indigo-400 mt-1">
                  {top2.score.toLocaleString()} pts
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">{top2.accuracy}% acc</span>
              </div>
            ) : (
              <div className="h-32 bg-slate-900/40 rounded-xl border border-dashed border-slate-800" />
            )}
          </div>

          {/* 1st Place Champion */}
          <div className="text-center order-2 -mt-4">
            {top1 ? (
              <div className="bg-slate-900 p-5 sm:p-7 rounded-xl border-2 border-indigo-500/50 shadow-2xl relative">
                <Crown className="w-7 h-7 text-amber-400 mx-auto mb-1 animate-bounce" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl overflow-hidden ring-2 ring-indigo-500 mb-2 shadow-lg">
                  <img src={top1.avatar} alt={top1.username} className="w-full h-full object-cover" />
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-500 text-slate-950 font-extrabold text-xs mb-1 font-mono">
                  01
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
                  {top1.username}
                </h3>
                <p className="font-bold font-mono text-lg text-orange-400 mt-1">
                  {top1.score.toLocaleString()} pts
                </p>
                <span className="text-[10px] text-indigo-400 font-mono font-bold block">
                  {top1.accuracy}% acc
                </span>
              </div>
            ) : (
              <div className="h-40 bg-slate-900/40 rounded-xl border border-dashed border-slate-800" />
            )}
          </div>

          {/* 3rd Place */}
          <div className="text-center order-3">
            {top3 ? (
              <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-xl relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl overflow-hidden ring-2 ring-slate-700 mb-2">
                  <img src={top3.avatar} alt={top3.username} className="w-full h-full object-cover" />
                </div>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-slate-400 font-bold text-xs mb-1 font-mono">
                  03
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                  {top3.username}
                </h3>
                <p className="font-bold font-mono text-sm text-indigo-400 mt-1">
                  {top3.score.toLocaleString()} pts
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">{top3.accuracy}% acc</span>
              </div>
            ) : (
              <div className="h-32 bg-slate-900/40 rounded-xl border border-dashed border-slate-800" />
            )}
          </div>
        </div>
      )}

      {/* Rankings Table List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
          <span>Rank & Player</span>
          <span>Category</span>
          <span>Accuracy</span>
          <span className="text-right">Score</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No score records found for this filter. Be the first to claim a rank!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((item, index) => (
              <div
                key={item.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono font-bold text-xs text-slate-500 text-center">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                  <img
                    src={item.avatar}
                    alt={item.username}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">
                      {item.username}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timeSpentSeconds}s elapsed
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {item.category}
                </span>

                <span className="text-xs font-mono font-bold text-green-400">
                  {item.accuracy}%
                </span>

                <span className="font-mono font-bold text-sm text-indigo-400 text-right">
                  {item.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
