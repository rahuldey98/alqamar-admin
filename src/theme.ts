import { createTheme } from '@mui/material/styles'

const tokens = {
  bg: '#0a0e1a',
  border: '#232b44',
  divider: '#1c2440',

  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textDisabled: '#64748b',

  indigo: '#6366f1',
  indigoLight: '#818cf8',
  indigoDark: '#4f46e5',

  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#a855f7',
} as const

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: tokens.bg
    },
    primary: {
      main: tokens.indigo,
      light: tokens.indigoLight,
      dark: tokens.indigoDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: tokens.violet,
      contrastText: '#ffffff',
    },
    success: {
      main: tokens.green,
      contrastText: '#ffffff',
    },
    error: {
      main: tokens.red,
      contrastText: '#ffffff',
    },
    warning: {
      main: tokens.amber,
      contrastText: '#ffffff',
    },
    info: {
      main: tokens.cyan,
      contrastText: '#ffffff',
    },
    text: {
      primary: tokens.text,
      secondary: tokens.textSecondary,
      disabled: tokens.textDisabled,
    },
    divider: tokens.divider,
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600
  }
})

export { tokens }
