'use client';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Casino as CasinoIcon, Star as StarIcon } from '@mui/icons-material';
import AppTheme from '@/app/styles/AppTheme';
import PairAnalysis from '@/app/components/pair-analysis/PairAnalysis';

const PairAnalysisPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={AppTheme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh',
        background: AppTheme.palette.background.default,
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 195, 0, 0.2)',
            mb: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ py: { xs: 2, md: 4 } }}>
              <Stack 
                direction={isMobile ? "column" : "row"} 
                alignItems={isMobile ? "stretch" : "center"} 
                justifyContent={isMobile ? "center" : "space-between"} 
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Button
                  variant="outlined"
                  startIcon={!isSmallMobile && <ArrowBackIcon />}
                  href="/combinations"
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                  sx={{ 
                    borderColor: 'rgba(255, 195, 0, 0.5)',
                    color: AppTheme.palette.secondary.main,
                    minWidth: isMobile ? 'auto' : '200px',
                    '&:hover': {
                      borderColor: AppTheme.palette.secondary.main,
                      background: 'rgba(255, 195, 0, 0.1)'
                    }
                  }}
                >
                  {isSmallMobile ? "← Combinations" : "Back to Combinations"}
                </Button>
                
                <Stack 
                  direction={isSmallMobile ? "column" : "row"} 
                  spacing={1}
                  sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                  <Button
                    variant="outlined"
                    startIcon={!isSmallMobile && <StarIcon />}
                    href="/favorites"
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                    sx={{ 
                      borderColor: 'rgba(255, 195, 0, 0.5)',
                      color: AppTheme.palette.secondary.main,
                      '&:hover': {
                        borderColor: AppTheme.palette.secondary.main,
                        background: 'rgba(255, 195, 0, 0.1)'
                      }
                    }}
                  >
                    {isSmallMobile ? "★ Favorites" : "Favorites"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={!isSmallMobile && <CasinoIcon />}
                    href="/"
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                    sx={{ 
                      borderColor: 'rgba(255, 195, 0, 0.5)',
                      color: AppTheme.palette.secondary.main,
                      '&:hover': {
                        borderColor: AppTheme.palette.secondary.main,
                        background: 'rgba(255, 195, 0, 0.1)'
                      }
                    }}
                  >
                    {isSmallMobile ? "🏠 Home" : "Home"}
                  </Button>
                </Stack>
              </Stack>
              
              <Typography 
                variant={isMobile ? "h4" : "h2"} 
                className="gradient-text"
                sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  textAlign: 'center',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                }}
              >
                Pair Analysis
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  color: AppTheme.palette.text.secondary,
                  maxWidth: 800,
                  mx: 'auto',
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                Analyze first-two number pair frequencies and their correlation with possible third number combinations
              </Typography>
            </Box>
          </Container>
        </Paper>

        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            pb: { xs: 2, md: 4 }
          }}
        >
          <PairAnalysis />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PairAnalysisPage;