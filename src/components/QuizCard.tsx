import React from 'react';
import {
  Play,
  Clock,
  HelpCircle,
  Cpu,
  Atom,
  Landmark,
  Film,
  Globe,
  Sparkles,
  Calculator,
  BookOpen,
  Dna,
  Sprout,
  Palette,
  Music,
  Building2,
  Languages,
  FlaskConical,
  Zap,
} from 'lucide-react';
import { QuizPack } from '../types';

interface QuizCardProps {
  quizPack: QuizPack;
  onStartQuiz: (quizPack: QuizPack) => void;
  primaryColor: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quizPack, onStartQuiz, primaryColor }) => {
  const getIcon = () => {
    switch (quizPack.iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Atom':
        return <Atom className="w-5 h-5" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5" />;
      case 'Film':
        return <Film className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-indigo-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'Dna':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-green-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-cyan-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-rose-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = () => {
    switch (quizPack.difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono';
    }
  };

  return (
    <div
      className="group relative bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden"
      id={`quiz-card-${quizPack.id}`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {getIcon()}
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
              {quizPack.category}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor()}`}
          >
            {quizPack.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
          {quizPack.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2">
          {quizPack.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 pt-4 border-t border-slate-800 mb-4">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{quizPack.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>30s / Q</span>
          </div>
        </div>

        <button
          onClick={() => onStartQuiz(quizPack)}
          className="w-full py-2.5 px-4 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Start 30s Challenge
        </button>
      </div>
    </div>
  );
};
