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
    label: 'Sparkle',
    icon: '🌸',
    gradient: ['#C85FD4', '#FF6B9D'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    icon: '🌊',
    gradient: ['#4FC3F7', '#0077B6'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'sunset',
    label: 'Sunset',
    icon: '🌅',
    gradient: ['#FF6B35', '#FF006E'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'mint',
    label: 'Mint',
    icon: '🌿',
    gradient: ['#06D6A0', '#118AB2'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: false,
  },
  {
    id: 'gold',
    label: 'Gold',
    icon: '⭐',
    gradient: ['#FFD166', '#FF9F1C'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.85)',
    isPro: true,
  },
  {
    id: 'grape',
    label: 'Grape',
    icon: '🍇',
    gradient: ['#7B2D8B', '#4A0E8F'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.8)',
    isPro: true,
  },
  {
    id: 'dark',
    label: 'Midnight',
    icon: '🖤',
    gradient: ['#1A1A2E', '#16213E'],
    textColor: '#ffffff',
    secondaryTextColor: 'rgba(255,255,255,0.7)',
    isPro: true,
  },
  {
    id: 'minimal',
    label: 'Cloud',
    icon: '🤍',
    gradient: ['#F8F9FA', '#E9ECEF'],
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
