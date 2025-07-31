import { createTheme } from '@mui/material/styles';

// Pick3 V2025 Material-UI Theme
// Integrates with CSS custom properties defined in globals.css

const AppTheme = createTheme({
  palette: {
    mode: 'dark',
    // Primary colors (blue tones)
    primary: {
      50: '#eff6ff',
      100: '#ccd5f4',
      200: '#99c2ea',
      300: '#66aee0',
      400: '#339bd6',
      500: '#0088cc',
      600: '#0077a0',
      700: '#005973',
      800: '#003746',
      900: '#001219',
      main: '#0088cc',
      dark: '#005973',
      light: '#339bd6',
      contrastText: '#ffffff',
    },
    // Secondary colors (gold/orange tones)
    secondary: {
      50: '#fff9e5',
      100: '#ffecb3',
      200: '#ffdc80',
      300: '#ffcd4d',
      400: '#ffbe1a',
      500: '#ffc300',
      600: '#e6b000',
      700: '#cc9d00',
      800: '#b38a00',
      900: '#997700',
      main: '#ffc300',
      dark: '#e6b000',
      light: '#ffd333',
      contrastText: '#000000',
    },
    // Error colors
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
      contrastText: '#ffffff',
    },
    // Warning colors
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
      contrastText: '#000000',
    },
    // Info colors
    info: {
      main: '#3b82f6',
      dark: '#1d4ed8',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    // Success colors
    success: {
      main: '#22c55e',
      dark: '#16a34a',
      light: '#4ade80',
      contrastText: '#ffffff',
    },
    // Background colors
    background: {
      default: '#001219',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      disabled: 'rgba(255, 255, 255, 0.35)',
    },
    // Divider color
    divider: 'rgba(255, 255, 255, 0.1)',
    // Action colors
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.35)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    // Custom colors for the app
    custom: {
      gold: '#ffc300',
      goldDark: '#e6b000',
      goldLight: '#ffd333',
      orange: '#ff8f00',
      purple: '#9c27b0',
      glass: 'rgba(255, 255, 255, 0.05)',
      glassHover: 'rgba(255, 255, 255, 0.08)',
      borderPrimary: 'rgba(255, 255, 255, 0.1)',
      borderAccent: 'rgba(255, 195, 0, 0.3)',
    },
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    // Custom typography variants
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: '#ffffff',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.25,
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.85)',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.85)',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.625,
      color: 'rgba(255, 255, 255, 0.85)',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.85)',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.65)',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'rgba(255, 255, 255, 0.65)',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none',
    },
  },
  
  spacing: 4, // Base spacing unit (4px)
  
  shape: {
    borderRadius: 12, // Default border radius
  },
  
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 0 20px rgba(255, 195, 0, 0.2)', // Glow effect
    '0 4px 20px rgba(255, 195, 0, 0.3)', // Stronger glow
    '0 8px 32px rgba(0, 0, 0, 0.2)', // Card hover
    '0 12px 40px rgba(0, 0, 0, 0.15)', // Elevated element
    '0 16px 48px rgba(0, 0, 0, 0.1)', // Modal/dialog
    '0 20px 56px rgba(0, 0, 0, 0.08)', // High elevation
    '0 24px 64px rgba(0, 0, 0, 0.06)', // Maximum elevation
    '0 28px 72px rgba(0, 0, 0, 0.04)',
    '0 32px 80px rgba(0, 0, 0, 0.02)',
    '0 36px 88px rgba(0, 0, 0, 0.01)',
    '0 40px 96px rgba(0, 0, 0, 0.005)',
    '0 44px 104px rgba(0, 0, 0, 0.003)',
    '0 48px 112px rgba(0, 0, 0, 0.002)',
    '0 52px 120px rgba(0, 0, 0, 0.001)',
    '0 56px 128px rgba(0, 0, 0, 0.0005)',
    '0 60px 136px rgba(0, 0, 0, 0.0003)',
    '0 64px 144px rgba(0, 0, 0, 0.0002)',
    '0 68px 152px rgba(0, 0, 0, 0.0001)',
    '0 72px 160px rgba(0, 0, 0, 0.00005)',
  ],
  
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  
  components: {
    // Global component overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#64748b #1e293b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#64748b',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#475569',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#475569',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#475569',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#1e293b',
          },
        },
      },
    },
    
    // Button component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.25s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #0088cc 30%, #339bd6 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #339bd6 30%, #0088cc 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ffc300 30%, #ff8f00 90%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff8f00 30%, #ffc300 90%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    
    // Card component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 195, 0, 0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    
    // Paper component overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    
    // AppBar component overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 195, 0, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    
    // Tab component overrides
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#ffc300',
            fontWeight: 700,
          },
          '&:hover': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
    },
    
    // Tabs indicator
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#ffc300',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    
    // Chip component overrides
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            backgroundColor: 'rgba(255, 195, 0, 0.2)',
            borderColor: 'rgba(255, 195, 0, 0.4)',
          },
        },
      },
    },
    
    // Typography component overrides
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: '0.75em',
        },
      },
    },
    
    // Container component overrides
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    
    // IconButton component overrides
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          transition: 'all 0.25s ease-in-out',
          '&:hover': {
            color: '#ffc300',
            backgroundColor: 'rgba(255, 195, 0, 0.1)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
  
  // Custom breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

export default AppTheme;