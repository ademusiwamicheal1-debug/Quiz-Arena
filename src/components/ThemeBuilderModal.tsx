import React from 'react';
import { X, Check, Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { ThemeConfig, ThemePresetId } from '../types';
import { THEME_PRESETS } from '../utils/theme';

interface ThemeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
}

export const ThemeBuilderModal: React.FC<ThemeBuilderModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
}) => {
  if (!isOpen) return null;

  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setTheme(prev => ({
        ...prev,
        presetId,
        primaryColor: preset.primaryHex,
        accentColor: preset.accentHex,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-slate-100"
        id="theme-builder-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Custom Theme Builder</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Personalize your Quiz Arena appearance & colors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Mode Selector */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Appearance Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme(prev => ({ ...prev, mode: 'light' }))}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border font-bold text-xs transition-colors ${
                  theme.mode === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-orange-400" />
                Light Mode
              </button>
              <button
                onClick={() => setTheme(prev => ({ ...prev, mode: 'dark' }))}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border font-bold text-xs transition-colors ${
                  theme.mode === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                Dark Mode
              </button>
            </div>
          </div>

          {/* Theme Presets */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Curated Theme Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_PRESETS.map(preset => {
                const isSelected = theme.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`relative p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                    }`}
                  >
                    <div className={`h-10 rounded bg-gradient-to-r ${preset.previewGradient} mb-2 shadow-inner flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-4 h-4 drop-shadow" />}
                    </div>
                    <span className="text-xs font-bold block truncate font-mono">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Custom Hex Color Accent
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-mono text-slate-300 block mb-1">
                  Primary Theme Color
                </span>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={e =>
                      setTheme(prev => ({ ...prev, primaryColor: e.target.value, presetId: 'high-density' }))
                    }
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono uppercase font-bold text-slate-300">
                    {theme.primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-300 block mb-1">
                  Secondary Accent
                </span>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={e =>
                      setTheme(prev => ({ ...prev, accentColor: e.target.value, presetId: 'high-density' }))
                    }
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono uppercase font-bold text-slate-300">
                    {theme.accentColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Component Preview */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 block">
              Live Interactive Preview
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                Primary Button
              </button>

              <span
                className="px-3 py-1 rounded text-xs font-mono font-bold text-white shadow-sm"
                style={{ backgroundColor: theme.accentColor }}
              >
                Accent Tag
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-bold text-xs text-white shadow-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
