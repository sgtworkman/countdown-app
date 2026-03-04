export type ColorTheme =
  | 'pink-purple'
  | 'ocean'
  | 'sunset'
  | 'mint'
  | 'gold'
  | 'grape'
  | 'dark'
  | 'minimal';

export interface ThemeConfig {
  id: ColorTheme;
  label: string;
  icon: string;
  gradient: [string, string];
  textColor: string;
  secondaryTextColor: string;
  isPro: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'pink-purple',
    label: 'Pink/Purple',
    icon: '🌸',
    gradient: ['#ec4899', '#a855f7'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    icon: '🌊',
    gradient: ['#0ea5e9', '#14b8a6'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'sunset',
    label: 'Sunset',
    icon: '🌅',
    gradient: ['#f97316', '#f472b6'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'mint',
    label: 'Mint',
    icon: '🌿',
    gradient: ['#34d399', '#06b6d4'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'gold',
    label: 'Gold',
    icon: '⭐',
    gradient: ['#f59e0b', '#eab308'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.85)',
    isPro: true,
  },
  {
    id: 'grape',
    label: 'Grape',
    icon: '🍇',
    gradient: ['#8b5cf6', '#4f46e5'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: true,
  },
  {
    id: 'dark',
    label: 'Night',
    icon: '🖤',
    gradient: ['#374151', '#111827'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.7)',
    isPro: true,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    icon: '🤍',
    gradient: ['#f9fafb', '#e5e7eb'],
    textColor: '#111827',
    secondaryTextColor: 'rgba(17,24,39,0.6)',
    isPro: true,
  },
];

export const FREE_THEMES: ColorTheme[] = ['pink-purple', 'ocean', 'sunset', 'mint'];
export const PRO_THEMES: ColorTheme[] = ['gold', 'grape', 'dark', 'minimal'];

export function getTheme(id: ColorTheme): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export const MAX_FREE_COUNTDOWNS = 3;
