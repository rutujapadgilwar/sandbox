import React from 'react';
import { Container, Typography, Box, useTheme } from '@mui/material';
import { ConfirmProvider } from 'material-ui-confirm';
import Questions from './components/Questions';
import { AuthProvider } from './context/AuthContext';
import { ColorModeProvider } from './context/ColorModeContext';
import { CssBaseline } from '@mui/material';
import './App.css';

const Header: React.FC = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a237e 0%, #000051 100%)'
          : 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        py: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: '0px', sm: '8px', md: '12px' },
        mx: { xs: -1, sm: 0 },
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.5)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 50%)'
            : 'radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%)',
          animation: 'shine 8s linear infinite',
        },
        '@keyframes shine': {
          '0%': {
            transform: 'translateX(-100%) translateY(100%)',
          },
          '100%': {
            transform: 'translateX(100%) translateY(-100%)',
          },
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1, sm: 1.5, md: 2 }
            }}
          >
            <Typography 
              variant="h2" 
              component="span"
              sx={{ 
                fontWeight: 800,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 100%)'
                  : 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: theme.palette.mode === 'dark'
                  ? '2px 2px 4px rgba(0,0,0,0.3)'
                  : '2px 2px 4px rgba(0,0,0,0.1)',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              Poll
            </Typography>
            <Typography 
              variant="h2" 
              component="span"
              sx={{ 
                fontWeight: 800,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 100%)'
                  : 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: theme.palette.mode === 'dark'
                  ? '2px 2px 4px rgba(0,0,0,0.3)'
                  : '2px 2px 4px rgba(0,0,0,0.1)',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              Management System
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              mt: { xs: 1, sm: 2 },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 2
            }}
          >
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ColorModeProvider>
      <CssBaseline />
      <AuthProvider>
        <ConfirmProvider>
          <Box sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary',
            transition: 'background-color 0.3s, color 0.3s'
          }}>
            <Header />
            <Container maxWidth="lg">
              <Questions />
            </Container>
          </Box>
        </ConfirmProvider>
      </AuthProvider>
    </ColorModeProvider>
  );
};

export default App;
