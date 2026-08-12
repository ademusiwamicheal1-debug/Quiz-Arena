import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { BarChart3, Trophy, Award, Flame, Clock, Sparkles, CheckCircle2, Lock, HelpCircle } from 'lucide-react';
import { UserStats } from '../types';
import { BADGES } from '../data/badges';

interface UserStatsViewProps {
  userStats: UserStats;
  primaryColor: string;
}

export const UserStatsView: React.FC<UserStatsViewProps> = ({ userStats, primaryColor }) => {
  const avgAccuracy = userStats.totalQuestionsAnswered > 0
    ? Math.round((userStats.totalCorrectAnswers / userStats.totalQuestionsAnswered) * 100)
    : 0;

  // Prepare chart data for history trend
  const historyChartData = userStats.quizHistory.slice(-7).map((item, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: item.score,
    accuracy: item.accuracy,
    title: item.quizTitle,
  }));

  // Prepare category breakdown chart data
  const categoryData = (Object.entries(userStats.categoryStats) as [string, { played: number; correct: number }][]).map(([cat, stat]) => ({
    category: cat.length > 12 ? `${cat.substring(0, 10)}...` : cat,
    accuracy: stat.played > 0 ? Math.round((stat.correct / stat.played) * 100) : 0,
    played: stat.played,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn" id="user-stats-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={userStats.avatar}
            alt={userStats.username}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-lg shrink-0"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">
              {userStats.username}'s Analytics
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Personalized performance, streaks, history, and achievements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            Best Streak: {userStats.bestStreak}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            Total: {userStats.totalScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-1 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Quizzes Played</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
            {userStats.totalQuizzesPlayed}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Avg Accuracy</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-green-400">
            {avgAccuracy}%
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-1 font-mono">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Current Streak</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-orange-400">
            {userStats.currentStreak}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-slate-500 mb-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Time Spent</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400">
            {Math.round(userStats.totalTimeSpentSeconds / 60)}m
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score History Line Chart */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 mb-4 font-mono uppercase tracking-wider">
            Recent Quiz Score Progression
          </h3>

          {historyChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-mono">
              Play a quiz to unlock your score progression trend chart!
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Performance Bar Chart */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 mb-4 font-mono uppercase tracking-wider">
            Category Mastery Accuracy (%)
          </h3>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-mono">
              Complete quizzes across different categories to see your mastery map!
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase font-mono tracking-wider">
              Unlocked Badges & Achievements
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">
            {userStats.unlockedBadgeIds.length} / {BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map(badge => {
            const isUnlocked = userStats.unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-lg border text-center transition-all ${
                  isUnlocked
                    ? 'border-indigo-500/40 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/50 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-white ${
                    isUnlocked ? 'bg-indigo-600 shadow-md' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <h4 className="font-bold text-xs text-slate-200 mb-1">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent History Log */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl">
        <h3 className="font-bold text-sm text-slate-200 mb-4 uppercase font-mono tracking-wider">
          Recent Attempt History
        </h3>

        {userStats.quizHistory.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-6 text-center">
            No past quiz attempts recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {userStats.quizHistory.slice(-10).reverse().map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-200">
                    {item.quizTitle}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.category} • {item.date}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="font-bold text-sm text-indigo-400 block">
                    {item.score.toLocaleString()} pts
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.accuracy}% acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
