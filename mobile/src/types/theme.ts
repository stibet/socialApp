export const Colors = {
  primary: '#FF3366',
  primaryDark: '#CC1144',
  primaryLight: '#FF6699',
  secondary: '#1A1A2E',
  accent: '#FFD700',

  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  border: '#2A2A45',

  text: '#FFFFFF',
  textSecondary: '#AAAACC',
  textMuted: '#666688',

  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
};

export const Fonts = {
  sizes: {
    xs: 10, sm: 12, md: 14, base: 16,
    lg: 18, xl: 22, xxl: 28, xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16,
  lg: 20, xl: 24, xxl: 32, xxxl: 48,
};

export const Radius = {
  sm: 6, md: 12, lg: 16, xl: 24, full: 999,
};
