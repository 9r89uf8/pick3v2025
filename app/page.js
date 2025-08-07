'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import AppTheme from '@/app/styles/AppTheme';
import PairAnalysis from '@/app/components/pair-analysis/PairAnalysis';
import DrawsList from '@/app/components/shared/DrawsList';
import CombinationBuilder from '@/app/components/combinations/CombinationBuilder';
import { fetchPosts } from '@/app/services/postService';
import { useStore } from '@/app/store/store';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { posts } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDraws = async () => {
      setLoading(true);
      try {
        await fetchPosts();
      } catch (error) {
        console.error('Error loading draws:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDraws();
  }, []);

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
          <Box sx={{ mb: { xs: 3, md: 6 } }}>
            <CombinationBuilder />
          </Box>

          <Box sx={{ mb: { xs: 3, md: 6 } }}>
            <Paper 
              elevation={2}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 195, 0, 0.2)',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  className="gradient-text"
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    textAlign: 'center',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                  }}
                >
                  Recent Draws
                </Typography>
                <DrawsList draws={posts} loading={loading} />
              </Box>
            </Paper>
          </Box>
          
          <PairAnalysis />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;