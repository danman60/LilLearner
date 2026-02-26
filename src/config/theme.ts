export const colors = {
  craftRed: '#E85D5D',
  craftYellow: '#F2C94C',
  craftBlue: '#5B9BD5',
  craftGreen: '#6BBF6B',
  craftPurple: '#9B72CF',
  craftOrange: '#F2994A',
  linedPaper: '#FFF8F0',
  pencilGray: '#4A4A4A',
  eraserPink: '#FFB5B5',
  notebookBlue: '#C5D9F0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const fonts = {
  display: 'Gaegu_400Regular',
  displayBold: 'Gaegu_700Bold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  accent: 'FredokaOne_400Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
