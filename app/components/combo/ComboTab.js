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
    Whatshot
} from '@mui/icons-material';
import { useStore } from '@/app/store/store';
import { setComboDisplayInfo } from "@/app/services/displayService";
import { checkComboDraws, playCombo } from "@/app/services/playService";

import ComboPlayInfo from './ComboPlayInfo';
import ComboDrawsList from './ComboDrawsList';
import Analysis from '../shared/Analysis';
import FireballAnalysis from '../shared/FireballAnalysis';
import StatsDisplay from '../shared/StatsDisplay';
import ActionPanel from '../shared/ActionPanel';

const ComboTab = () => {
  const posts = useStore((state) => state.posts);
  const display = useStore((state) => state.display);
  const testResults = useStore((state) => state.testResults);
  const checkLoading = useStore((state) => state.checkLoading);
  const clearHistory = useStore((state) => state.clearHistory);
  const numbers = useStore((state) => state.numbers); // Generated numbers from store
  const clearNumbers = useStore((state) => state.clearNumbers); // Clear numbers function
  
  // State for collapsible sections
  const [showRules, setShowRules] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

  const handlePlayClick = async () => {
    try {
      await playCombo();
    } catch (error) {
      alert("There was an issue generating COMBO numbers. Please try again.");
    }
  };

  const handleCheckClick = async () => {
    try {
      await checkComboDraws();
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
      await playCombo();
    } catch (error) {
      alert("There was an issue generating new COMBO numbers. Please try again.");
    }
  };

  const hasResults = testResults || display.totalDraws;

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
                    background: 'linear-gradient(90deg, #0088cc, #ffc300)',
                },
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <LightbulbIcon sx={{ fontSize: 32, color: '#ffc300' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                        COMBO Game Quick Start
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Play all possible orders of your numbers with one ticket - our system filters 220 combos down to the best 70
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="What is COMBO?"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(0, 136, 204, 0.2)',
                                color: '#339bd6',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            Win in Any Order!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Pick 1-4-8 and win if drawn as 8-1-4, 4-8-1, etc. Costs $3 for 6-way combo (all different digits).
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Our System"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 195, 0, 0.2)',
                                color: '#ffc300',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            Smart Filtering
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Uses BBA/BAA patterns with spread ≤2 rule. Keeps only 70 of 220 combos that capture 41.2% of wins.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Success Rate"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                color: '#4caf50',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            29.5% Better Odds
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Win every ~85 draws vs ~110 with random selection. Lose $183/month vs $224 regular.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Loss Reduction"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                color: '#ba68c8',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            $1.47 per $3 bet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Regular combo returns $1.14. Filtered system loses 51% vs 62% with random picks.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>

        {/* Fireball Section */}
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
                    background: 'linear-gradient(90deg, #ff6b6b, #ff9f40)',
                },
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Whatshot sx={{ fontSize: 32, color: '#ff6b6b' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                        Fireball Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Double your cost for 1.7x better odds - increases losses but wins come more frequently
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="How Fireball Works"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                                color: '#ff6b6b',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            Extra Winning Chances
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Replaces any drawn digit with Fireball number. Costs extra $3 (total $6 per combo).
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Success Boost"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                color: '#ff9f40',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            70% Pass Rate
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Fireball combos pass filter 70% of time vs 41.2% without. Win every ~50 draws.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Cost Analysis"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                color: '#ffc107',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            2x Cost, 1.7x Odds
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Monthly: -$420 with Fireball vs -$183 without. Higher loss despite more wins.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                        <Chip
                            label="Recommendation"
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                color: '#2196f3',
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, mb: 1 }}>
                            Minimize Losses
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            All strategies lose money. Filtered without Fireball loses least at -$183/month.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>

            {/* Performance Comparison */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ff9f40', mb: 1, fontWeight: 600 }}>
                    Playing 2 Combos Monthly (60 draws):
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Regular Combo
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                            -$224/month
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Regular + Fireball
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                            -$488/month
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Filtered System
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                            -$183/month ✓
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Filtered + Fireball
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                            -$420/month
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>

      {/* Action Panel */}
      <ActionPanel
        gameType="COMBO"
        onPlay={handlePlayClick}
        onCheck={handleCheckClick}
        onClear={handleClearClick}
        checkLoading={checkLoading}
        hasResults={hasResults}
        playDescription="Generate 2 optimized COMBO draws using BBA and BAA patterns with difference rules"
        checkDescription="Analyze how well COMBO rules perform against historical Illinois lottery draws"
        generatedNumbers={numbers && numbers.length > 0 ? numbers : null}
        onGenerateNew={handleGenerateNewNumbers}
        analysisResults={testResults}
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
                Detailed COMBO Rules & Combinations
              </Typography>
              <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {showRules ? 'Click to hide' : 'Click to view complete rules and valid combinations'}
              </Typography>
            </Box>
          </Stack>
        </Button>

        <Collapse in={showRules}>
          <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <ComboPlayInfo />
          </Box>
        </Collapse>
      </Paper>

      {/* Statistics Display */}
      {display && (
        <Box sx={{ mt: 4 }}>
          <StatsDisplay display={display} getter={setComboDisplayInfo} />
        </Box>
      )}

      {/* Advanced Analysis Section */}
      {hasResults && (
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
            onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
            endIcon={
              <ExpandMoreIcon 
                sx={{ 
                  transform: showAdvancedAnalysis ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }} 
              />
            }
            sx={{
              justifyContent: 'space-between',
              p: 3,
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <AnalyticsIcon sx={{ color: '#4caf50' }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" component="span">
                  Advanced Statistical Analysis
                </Typography>
                <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {showAdvancedAnalysis ? 'Click to hide' : 'Detailed pattern analysis and insights'}
                </Typography>
              </Box>
            </Stack>
          </Button>

          <Collapse in={showAdvancedAnalysis}>
            <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Analysis />
              <FireballAnalysis />
            </Box>
          </Collapse>
        </Paper>
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
            Historical Draw Data
          </Typography>
          <List>
            <ComboDrawsList draws={posts} />
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default ComboTab;