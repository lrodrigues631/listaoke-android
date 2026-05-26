import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#09070F',
  backgroundSoft: '#0D0A16',
  backgroundElevated: '#130E20',

  surface: '#17111F',
  surfaceRaised: '#20162D',
  surfaceLight: '#2B1E3B',
  surfaceMuted: '#120D1B',

  border: '#4D3A63',
  borderSoft: '#30233F',
  borderStrong: '#7A4FA3',

  text: '#FFF7FF',
  textMuted: '#D8C8E3',
  textSoft: '#A991BA',
  textDisabled: '#71617D',

  primary: '#F34EF3',
  primaryPressed: '#D936E0',
  primaryMuted: '#391642',
  primarySoft: '#5B1E68',

  accent: '#B986FF',
  accentStrong: '#D9A8FF',
  accentMuted: '#261638',
  accentSoft: '#3A2352',

  success: '#7EF0C5',
  successMuted: '#123A31',

  warning: '#FFD37A',
  warningMuted: '#3B2B14',

  danger: '#FF8FA3',
  dangerStrong: '#FF5F82',
  dangerMuted: '#3A1524',
  dangerBorder: '#7E2D45',

  neonPink: '#FF57E8',
  neonLilac: '#C78BFF',
  neonViolet: '#7B4DFF',

  overlay: 'rgba(9, 7, 15, 0.76)',
  transparent: 'transparent',
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const typography = {
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  } satisfies TextStyle,
  bodyStrong: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  } satisfies TextStyle,
  buttonSmall: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  } satisfies TextStyle,
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  } satisfies TextStyle,
  titleLarge: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  } satisfies TextStyle,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  } satisfies ViewStyle,
};

export const glow = {
  primary: {
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  } satisfies ViewStyle,
  accent: {
    shadowColor: colors.neonLilac,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  } satisfies ViewStyle,
  danger: {
    shadowColor: colors.dangerStrong,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  } satisfies ViewStyle,
};

export const animation = {
  fast: 120,
  normal: 180,
  slow: 260,
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  glow,
  animation,
};
