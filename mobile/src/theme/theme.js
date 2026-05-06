import { MD3LightTheme } from 'react-native-paper';

// ─── Colour Palette ──────────────────────────────────────────────────────────
export const COLORS = {
  primary: '#4F46E5', // Indigo-600
  primaryDark: '#3730A3', // Indigo-800
  primaryLight: '#EEF2FF', // Indigo-50
  secondary: '#6366F1', // Indigo-500
  background: '#F8FAFC', // Slate-50
  surface: '#FFFFFF',
  border: '#E2E8F0', // Slate-200
  textPrimary: '#1E293B', // Slate-900
  textSecondary: '#64748B', // Slate-500
  textMuted: '#94A3B8', // Slate-400
  pending: '#F59E0B', // Amber-500
  pendingBg: '#FFFBEB', // Amber-50
  completed: '#10B981', // Emerald-500
  completedBg: '#ECFDF5', // Emerald-50
  danger: '#EF4444', // Red-500
  dangerLight: '#FEF2F2', // Red-50
  headerBg: '#4F46E5',
  headerText: '#FFFFFF',
  cardShadow: '#1E293B',
};

// ─── React Native Paper Theme Override ───────────────────────────────────────
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: COLORS.primaryLight,
    background: COLORS.background,
    surface: COLORS.surface,
    onSurface: COLORS.textPrimary,
    outline: COLORS.border,
  },
};

// ─── Shared Style Tokens ──────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FONT = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};
