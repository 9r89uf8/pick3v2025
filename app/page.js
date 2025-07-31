'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { fetchPosts } from './services/postService';
import { getComboDisplayInfo, getStraightDisplayInfo } from "@/app/services/displayService";
import { useStore } from '@/app/store/store';
import {
  Container,
  Box,
  AppBar,
  Tabs,
  Tab,
  Collapse,
  Typography,
  Paper,
  Stack,
  Fade,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';

// Import theme and components
import AppTheme from '@/app/styles/AppTheme';
import TabPanel from "@/app/components/ui/TabPanel";
import { Item, ExpandButton } from "@/app/components/ui/StyledComponents";
import ComboTab from "@/app/components/combo/ComboTab";
import StraightTab from "@/app/components/straight/StraightTab";
import PostCreationButtons from "@/app/components/shared/PostCreationButtons";

const HomePage = () => {
  const [expandSection, setExpandSection] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for active tab
  const clearNumbers = useStore((state) => state.clearNumbers);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const getPosts = async () => {
      // Clear any persisted numbers on page load for better UX
      clearNumbers();
      
      await fetchPosts();
      await getComboDisplayInfo();
      await getStraightDisplayInfo();
    };
    getPosts();
  }, [clearNumbers]);

  return (
    <ThemeProvider theme={AppTheme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh',
        background: AppTheme.palette.background.default,
      }}>
        {/* Header Section */}
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(255, 195, 0, 0.2)',
              mb: 4,
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <CasinoIcon sx={{ fontSize: 48, color: AppTheme.palette.secondary.main }} />
                  <Typography 
                    variant="h1" 
                    className="gradient-text"
                    sx={{ fontWeight: 800 }}
                  >
                    Pick3 V2025
                  </Typography>
                </Stack>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: AppTheme.palette.text.secondary,
                    maxWidth: 600,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  Advanced Lottery Analysis & Prediction System
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: AppTheme.palette.text.tertiary,
                    maxWidth: 500,
                    mx: 'auto',
                  }}
                >
                  Analyze historical draws, generate strategic combinations, and maximize your winning potential
                </Typography>
              </Box>
            </Container>
          </Paper>
        </Fade>

        <Container maxWidth="lg">
          {/* Game Type Selector */}
          <Paper 
            elevation={0}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <AppBar position="static" elevation={0}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="game type selection"
                sx={{ 
                  '& .MuiTab-root': {
                    py: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }
                }}
              >
                <Tab 
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AnalyticsIcon />
                      <Box>
                        <Typography variant="h6" component="span">COMBO</Typography>
                        <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Order doesn't matter
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
                <Tab 
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CasinoIcon />
                      <Box>
                        <Typography variant="h6" component="span">STRAIGHT</Typography>
                        <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Exact order required
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Tabs>
            </AppBar>
          </Paper>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <ComboTab />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <StraightTab />
          </TabPanel>

          {/* Admin Section (Collapsible) */}
          <Box sx={{ textAlign: 'center', mt: 6, mb: 2 }}>
            <ExpandButton
              onClick={() => setExpandSection(!expandSection)}
              aria-label="expand admin section"
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 1,
                '&:hover': {
                  background: 'rgba(255, 195, 0, 0.1)',
                  borderColor: 'rgba(255, 195, 0, 0.3)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <SettingsIcon />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Admin Controls
                </Typography>
                {expandSection ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </Stack>
            </ExpandButton>
          </Box>

          <Collapse in={expandSection}>
            <Paper 
              elevation={0}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                mb: 4,
              }}
            >
              <PostCreationButtons />
            </Paper>
          </Collapse>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;