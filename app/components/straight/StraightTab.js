import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  Paper,
  Container,
  Stack,
  Collapse,
  Button,
  Fade,
  Chip,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayIcon,
  MenuBook as RulesIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useStore } from '@/app/store/store';
import { setStraightDisplayInfo } from "@/app/services/displayService";
import { checkStraightDraws, playStraight } from "@/app/services/playService";

import StraightPlayInfo from './StraightPlayInfo';
import StraightDrawsList from './StraightDrawsList';
import StatsDisplay from '../shared/StatsDisplay';
import ActionPanel from '../shared/ActionPanel';

const StraightTab = () => {
  const posts = useStore((state) => state.posts);
  const display = useStore((state) => state.display);
  const straightTestResults = useStore((state) => state.straightTestResults);
  const checkLoading = useStore((state) => state.checkLoading);
  const clearHistory = useStore((state) => state.clearHistory);
  const numbers = useStore((state) => state.numbers); // Generated numbers from store
  const clearNumbers = useStore((state) => state.clearNumbers); // Clear numbers function
  
  // State for collapsible sections
  const [showRules, setShowRules] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

  const handlePlayClick = async () => {
    try {
      await playStraight();
    } catch (error) {
      alert("There was an issue generating STRAIGHT numbers. Please try again.");
    }
  };

  const handleCheckClick = async () => {
    try {
      await checkStraightDraws();
      // Results now display directly in ActionPanel - no need to scroll
    } catch (error) {
      alert("There was an issue analyzing the draws. Please try again.");
    }
  };

  const handleClearClick = () => {
    clearHistory();
    clearNumbers(); // Also clear generated numbers
  };

  const handleGenerateNewNumbers = async () => {
    try {
      await playStraight();
    } catch (error) {
      alert("There was an issue generating new STRAIGHT numbers. Please try again.");
    }
  };

  const hasResults = straightTestResults || display.totalDraws;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Quick Start Section */}
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            p: 4,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #9c27b0, #ffc300)',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <LightbulbIcon sx={{ fontSize: 32, color: '#ffc300' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                STRAIGHT Game Quick Start
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                In STRAIGHT play, order matters - numbers must match the exact draw sequence
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Chip 
                  label="What is STRAIGHT?" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(156, 39, 176, 0.2)', 
                    color: '#ba68c8',
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Order is critical! If you pick 1-4-8, it only wins if the draw is exactly 1-4-8.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Chip 
                  label="6 Valid Patterns" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 195, 0, 0.2)', 
                    color: '#ffc300',
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  BBA, BAB, ABB, BAA, ABA, AAB patterns with position-based difference rules.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Chip 
                  label="Higher Coverage" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                    color: '#4caf50',
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  210 valid combinations (29.2% coverage) across all 6 patterns for better odds.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

      {/* Action Panel */}
      <ActionPanel
        gameType="STRAIGHT"
        onPlay={handlePlayClick}
        onCheck={handleCheckClick}
        onClear={handleClearClick}
        checkLoading={checkLoading}
        hasResults={hasResults}
        playDescription="Generate 6 optimized STRAIGHT draws covering all valid patterns (BBA, BAB, ABB, BAA, ABA, AAB)"
        checkDescription="Test STRAIGHT rules against historical draws to validate position-based pattern effectiveness"
        generatedNumbers={numbers && numbers.length > 0 ? numbers : null}
        onGenerateNew={handleGenerateNewNumbers}
        analysisResults={straightTestResults}
      />

      {/* Collapsible Rules Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          mt: 3,
          overflow: 'hidden',
        }}
      >
        <Button
          fullWidth
          onClick={() => setShowRules(!showRules)}
          endIcon={
            <ExpandMoreIcon 
              sx={{ 
                transform: showRules ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }} 
            />
          }
          sx={{
            justifyContent: 'space-between',
            p: 3,
            color: 'white',
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <RulesIcon sx={{ color: '#ffc300' }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" component="span">
                Detailed STRAIGHT Rules & Patterns
              </Typography>
              <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {showRules ? 'Click to hide' : 'Click to view all 6 patterns and position-based rules'}
              </Typography>
            </Box>
          </Stack>
        </Button>

        <Collapse in={showRules}>
          <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <StraightPlayInfo />
          </Box>
        </Collapse>
      </Paper>

      {/* Statistics Display */}
      {display && (
        <Box sx={{ mt: 4 }}>
          <StatsDisplay display={display} getter={setStraightDisplayInfo} />
        </Box>
      )}

      {/* Historical Draws */}
      {posts.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            p: 3,
            mt: 4,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
            Historical Draw Data (Original Sequence)
          </Typography>
          <List>
            <StraightDrawsList draws={posts} />
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default StraightTab;