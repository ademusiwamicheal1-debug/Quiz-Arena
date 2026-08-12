import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Twitter, Copy, Download, Check, RotateCcw, ArrowRight, Award, CheckCircle2, XCircle, Sparkles, Send } from 'lucide-react';
import { Question, UserStats } from '../types';

import { User as FirebaseUser } from 'firebase/auth';

interface QuizResultsViewProps {
  results: {
    quizTitle: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    timeSpentSeconds: number;
    answers: { question: Question; selectedIndex: number | null; isCorrect: boolean; timeTakenSeconds: number }[];
  };
  userStats: UserStats;
  currentUser?: FirebaseUser | null;
  onGoogleSignIn?: () => void;
  onPlayAgain: () => void;
  onExploreMore: () => void;
  onSubmitLeaderboardScore: (scoreData: {
    username: string;
    avatar: string;
    score: number;
    accuracy: number;
    timeSpentSeconds: number;
    category: string;
    difficulty: string;
  }) => Promise<void>;
  primaryColor: string;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  results,
  userStats,
  currentUser,
  onGoogleSignIn,
  onPlayAgain,
  onExploreMore,
  onSubmitLeaderboardScore,
  primaryColor,
}) => {
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [badgeDownloaded, setBadgeDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Generate Score Badge Image on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    canvas.width = 600;
    canvas.height = 340;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 340);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 340);

    // Decorative circle
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath();
    ctx.arc(520, 60, 140, 0, Math.PI * 2);
    ctx.fill();

    // Border line
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 580, 320);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('QUIZ ARENA • OFFICIAL SCORE BADGE', 40, 50);

    // Category Badge
    ctx.fillStyle = primaryColor;
    ctx.fillRect(40, 70, 160, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'extrabold 12px sans-serif';
    ctx.fillText(results.category.toUpperCase(), 50, 90);

    // Quiz Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(results.quizTitle, 40, 145);

    // Score Banner
    ctx.fillStyle = '#10b981';
    ctx.font = 'black 54px sans-serif';
    ctx.fillText(`${results.score} PTS`, 40, 215);

    // Stats Row
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Accuracy: ${results.accuracy}%  |  Correct: ${results.correctAnswers}/${results.totalQuestions}  |  Time: ${results.timeSpentSeconds}s`,
      40,
      255
    );

    // Player Name Footer
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Player: @${userStats.username}`, 40, 295);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('Can you beat my score? Try in Quiz Arena!', 340, 295);
  }, [results, userStats, primaryColor]);

  const handleDownloadBadge = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QuizArena_Score_${results.score}pts.png`;
    link.href = dataUrl;
    link.click();
    setBadgeDownloaded(true);
    setTimeout(() => setBadgeDownloaded(false), 3000);
  };

  const handleShareTwitter = () => {
    const tweetText = `I just scored ${results.score} points with ${results.accuracy}% accuracy in "${results.quizTitle}" on Quiz Arena! 🏆\nCan you beat my score? #QuizArena #Trivia`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopyShareLink = () => {
    const text = `I scored ${results.score} pts (${results.accuracy}% accuracy) on Quiz Arena! Check it out: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiz Arena Score',
          text: `I scored ${results.score} pts with ${results.accuracy}% accuracy on "${results.quizTitle}"!`,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleLeaderboardSubmit = async () => {
    if (hasSubmittedScore || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitLeaderboardScore({
        username: userStats.username,
        avatar: userStats.avatar,
        score: results.score,
        accuracy: results.accuracy,
        timeSpentSeconds: results.timeSpentSeconds,
        category: results.category,
        difficulty: results.difficulty,
      });
      setHasSubmittedScore(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn" id="quiz-results-container">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-xl bg-indigo-600 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-2">
          Quiz Challenge Completed!
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Awesome work, <span className="text-slate-200 font-bold">{userStats.username}</span>! Here is your performance overview.
        </p>
      </div>

      {/* Main Score Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 font-mono">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Points
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-green-400">
            {results.score.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Accuracy
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-indigo-400">
            {results.accuracy}%
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Correct Answers
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-sky-400">
            {results.correctAnswers} / {results.totalQuestions}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Time Spent
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-orange-400">
            {results.timeSpentSeconds}s
          </span>
        </div>
      </div>

      {/* Leaderboard Submit Callout */}
      <div className="bg-slate-900 rounded-xl p-5 border border-indigo-500/40 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Claim Your Rank on Global Leaderboard</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Submit your score of {results.score} pts to compete against players worldwide!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!currentUser && onGoogleSignIn && (
            <button
              onClick={onGoogleSignIn}
              className="px-4 py-2.5 rounded-lg font-bold text-xs bg-white hover:bg-slate-100 text-slate-900 shadow-md transition-colors flex items-center gap-2 border border-slate-200"
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

          <button
            onClick={handleLeaderboardSubmit}
            disabled={hasSubmittedScore || isSubmitting}
            className={`px-5 py-2.5 rounded-lg font-bold text-xs shadow-md transition-colors flex items-center gap-2 ${
              hasSubmittedScore
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {hasSubmittedScore ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Score Posted!
              </>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Post to Leaderboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Media Share Badge Section */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-200 uppercase font-mono tracking-wider">
              Social Media Score Badge
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Share & Challenge Friends
          </span>
        </div>

        {/* Hidden Canvas rendered for badge */}
        <div className="rounded-lg overflow-hidden mb-5 border border-slate-800 bg-slate-950 flex justify-center">
          <canvas ref={canvasRef} className="w-full max-w-xl h-auto" />
        </div>

        {/* Share Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleDownloadBadge}
            className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            {badgeDownloaded ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Download className="w-3.5 h-3.5" />}
            {badgeDownloaded ? 'Saved!' : 'Download Badge'}
          </button>

          <button
            onClick={handleShareTwitter}
            className="py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Twitter className="w-3.5 h-3.5 fill-current" />
            Share on X
          </button>

          <button
            onClick={handleCopyShareLink}
            className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share App
          </button>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl mb-8">
        <h3 className="font-bold text-sm text-slate-200 mb-5 uppercase font-mono tracking-wider">
          Question Review & Educational Explanations
        </h3>

        <div className="space-y-4">
          {results.answers.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                item.isCorrect
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                    {item.question.question}
                  </h4>
                </div>

                {item.isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-green-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400 shrink-0">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              {/* Options breakdown */}
              <div className="text-xs font-mono space-y-1 mb-3 pl-7">
                <div>
                  <span className="text-slate-400">Your choice: </span>
                  <span className={`font-bold ${item.isCorrect ? 'text-green-400' : 'text-rose-400'}`}>
                    {item.selectedIndex !== null ? item.question.options[item.selectedIndex] : 'Time Expired'}
                  </span>
                </div>
                {!item.isCorrect && (
                  <div>
                    <span className="text-slate-400">Correct answer: </span>
                    <span className="font-bold text-green-400">
                      {item.question.options[item.question.correctIndex]}
                    </span>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded border border-slate-800 leading-relaxed font-sans pl-7">
                {item.question.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 rounded-lg font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Play Again
        </button>

        <button
          onClick={onExploreMore}
          className="flex-1 py-3 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          Explore More Quizzes
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
