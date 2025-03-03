import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';

type ColorModeContextType = {
  toggleColorMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
});

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
};

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            primary: {
              main: '#90caf9',
              light: '#e3f2fd',
              dark: '#42a5f5',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#ce93d8',
              light: '#f3e5f5',
              dark: '#ab47bc',
              contrastText: '#ffffff',
            },
            error: {
              main: '#f44336',
              light: '#e57373',
              dark: '#d32f2f',
            },
            warning: {
              main: '#ffa726',
              light: '#ffb74d',
              dark: '#f57c00',
            },
            success: {
              main: '#66bb6a',
              light: '#81c784',
              dark: '#388e3c',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.85)',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
          } : {
            primary: {
              main: '#1976d2',
              light: '#42a5f5',
              dark: '#1565c0',
            },
            secondary: {
              main: '#9c27b0',
              light: '#ba68c8',
              dark: '#7b1fa2',
            },
            error: {
              main: '#d32f2f',
              light: '#ef5350',
              dark: '#c62828',
            },
            warning: {
              main: '#ed6c02',
              light: '#ff9800',
              dark: '#e65100',
            },
            success: {
              main: '#2e7d32',
              light: '#4caf50',
              dark: '#1b5e20',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
          }),
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                ...(mode === 'dark' && {
                  backgroundImage: 'none',
                  backgroundColor: '#1e1e1e',
                }),
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                ...(mode === 'dark' && {
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#1e1e1e',
                }),
              },
              head: {
                ...(mode === 'dark' && {
                  backgroundColor: '#121212',
                  color: '#ffffff',
                }),
              },
              body: {
                ...(mode === 'dark' && {
                  backgroundColor: '#1e1e1e',
                  color: '#ffffff',
                }),
              },
            },
          },
          MuiCollapse: {
            styleOverrides: {
              root: {
                ...(mode === 'dark' && {
                  backgroundColor: '#1e1e1e',
                }),
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                ...(mode === 'dark' && {
                  color: '#ffffff',
                }),
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s, color 0.3s',
                ...(mode === 'dark' && {
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }),
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s, color 0.3s',
                ...(mode === 'dark' && {
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }),
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                ...(mode === 'dark' && {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                }),
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                ...(mode === 'dark' && {
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#1a1a1a',
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: '#1e1e1e',
                  },
                  '&:hover': {
                    backgroundColor: '#2a2a2a !important',
                  },
                }),
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}; 