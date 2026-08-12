import { ThemeConfig, ThemePresetId } from '../types';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  primaryHex: string;
  accentHex: string;
  bgDark: string;
  bgLight: string;
  previewGradient: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'high-density',
    name: 'High Density Pro',
    primaryHex: '#6366f1', // indigo-500
    accentHex: '#f97316', // orange-500
    bgDark: '#020617', // slate-950
    bgLight: '#f8fafc',
    previewGradient: 'from-indigo-600 to-orange-500',
  },
  {
    id: 'violet',
    name: 'Violet Glow',
    primaryHex: '#8b5cf6', // violet-500
    accentHex: '#ec4899', // pink-500
    bgDark: '#0f0c1b',
    bgLight: '#f8f7ff',
    previewGradient: 'from-purple-600 to-pink-500',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primaryHex: '#06b6d4', // cyan-500
    accentHex: '#f43f5e', // rose-500
    bgDark: '#080e1a',
    bgLight: '#f0fdfa',
    previewGradient: 'from-cyan-500 to-rose-500',
  },
  {
    id: 'sunset',
    name: 'Sunset Ember',
    primaryHex: '#f97316', // orange-500
    accentHex: '#eab308', // yellow-500
    bgDark: '#1a0d0a',
    bgLight: '#fffbeb',
    previewGradient: 'from-orange-500 to-yellow-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Aurora',
    primaryHex: '#10b981', // emerald-500
    accentHex: '#06b6d4', // cyan-500
    bgDark: '#061612',
    bgLight: '#f0fdf4',
    previewGradient: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    primaryHex: '#3b82f6', // blue-500
    accentHex: '#6366f1', // indigo-500
    bgDark: '#0b1329',
    bgLight: '#eff6ff',
    previewGradient: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'monochrome',
    name: 'Slate Minimal',
    primaryHex: '#64748b', // slate-500
    accentHex: '#38bdf8', // sky-400
    bgDark: '#0f172a',
    bgLight: '#f8fafc',
    previewGradient: 'from-slate-700 to-slate-900',
  },
];

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  presetId: 'high-density',
  primaryColor: '#6366f1',
  accentColor: '#f97316',
  bgStyle: 'gradient',
};

export function applyThemeToDocument(config: ThemeConfig) {
  const root = document.documentElement;

  // Toggle dark class
  if (config.mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set CSS Custom Variables
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-accent', config.accentColor);
}
