import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Divider,
  Tooltip,
  Card,
  CardContent,
  IconButton,
  alpha,
  Collapse,
  Fade,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Casino as CasinoIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as ArrowUpIcon,
  Casino as DiceIcon,
} from '@mui/icons-material';

const ActionPanel = ({
  gameType = 'COMBO',
  onPlay,
  onCheck,
  onClear,
  checkLoading = false,
  hasResults = false,
  playDescription,
  checkDescription,
  generatedNumbers = null, // Array of generated number combinations
  onGenerateNew, // Function to generate new numbers
  analysisResults = null, // Analysis results to display
}) => {
  
  const gameColors = {
    COMBO: {
      primary: '#0088cc',
      primaryGradient: 'linear-gradient(45deg, #0088cc 30%, #339bd6 90%)',
      accent: '#ffc300',
    },
    STRAIGHT: {
      primary: '#9c27b0',
      primaryGradient: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
      accent: '#ffc300',
    },
  };

  const colors = gameColors[gameType];

  // Helper function to get pattern for a combination
  const getPattern = (combination) => {
    if (!combination) return '';
    // For COMBO, sort the numbers; for STRAIGHT, keep original order
    const numbersToCheck = gameType === 'COMBO' 
      ? [...combination].sort((a, b) => a - b)
      : combination;
    const pattern = numbersToCheck.map(num => num <= 4 ? 'B' : 'A').join('');
    return pattern;
  };

  // Helper function to get pattern color
  const getPatternColor = (pattern) => {
    const patternColors = {
      'BBA': '#4caf50',
      'BAA': '#2196f3', 
      'BAB': '#ff9800',
      'ABB': '#9c27b0',
      'ABA': '#f44336',
      'AAB': '#00bcd4',
    };
    return patternColors[pattern] || '#ffc300';
  };

  // Number display component
  const NumberDisplay = ({ number, size = 40 }) => {
    const isB = number <= 4;
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: isB ? colors.primary : colors.accent,
          color: isB ? 'white' : 'black',
          fontSize: size * 0.45,
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {number}
      </Avatar>
    );
  };

  // Analysis results display component
  const AnalysisResultsDisplay = () => {
    // Extract detailed data from analysis results
    const validation = analysisResults?.validation || {};
    const patterns = analysisResults?.patterns || {};
    const differences = analysisResults?.differences || {};
    const fireballAnalysis = analysisResults?.fireballAnalysis || {};
    const summary = analysisResults?.summary || {};

    return (
      <Fade in={true} timeout={600}>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
            📊 Analysis Results
          </Typography>
          
          {/* Main Validation Results */}
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Grid container spacing={3}>
              {/* Main Pass Rate */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                    {validation.mainDrawPassPercentage?.toFixed(1) || '0.0'}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Main Pass Rate
                  </Typography>
                </Box>
              </Grid>
              
              {/* Total Draws */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#2196f3', fontWeight: 'bold', mb: 1 }}>
                    {summary.validDrawsProcessed || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Draws
                  </Typography>
                </Box>
              </Grid>
              
              {/* Passed Draws */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#ffc300', fontWeight: 'bold', mb: 1 }}>
                    {validation.mainDrawPasses || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Passed
                  </Typography>
                </Box>
              </Grid>
              
              {/* Fireball Pass Rate */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                    {validation.fireballPassPercentage?.toFixed(1) || '0.0'}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Fireball Pass
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Pattern Distribution */}
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 195, 0, 0.1)',
              border: '1px solid rgba(255, 195, 0, 0.3)',
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Pattern Distribution
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(patterns.counts || {}).map(([pattern, count]) => (
                <Grid item xs={6} sm={3} key={pattern}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label={pattern}
                      sx={{
                        backgroundColor: alpha(getPatternColor(pattern), 0.2),
                        color: getPatternColor(pattern),
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    />
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {patterns.percentages?.[pattern]?.toFixed(1) || '0.0'}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Difference Analysis for COMBO */}
          {gameType === 'COMBO' && (
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                Difference Rules Performance
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      BBA Pattern (Difference ≤ 2)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {differences.bba?.passCount || 0} / {patterns.counts?.BBA || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {differences.bba?.passPercentage?.toFixed(1) || '0.0'}% of all draws
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      BAA Pattern (Difference ≤ 2)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                      {differences.baa?.passCount || 0} / {patterns.counts?.BAA || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {differences.baa?.passPercentage?.toFixed(1) || '0.0'}% of all draws
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Strategic Insights */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, textAlign: 'center' }}>
              💡 <strong>Analysis Complete:</strong> {
                validation.mainDrawPassPercentage > 30 
                  ? `Excellent pass rate of ${validation.mainDrawPassPercentage.toFixed(1)}%! Your ${gameType} strategy shows strong performance.`
                  : validation.mainDrawPassPercentage > 15
                    ? `Good pass rate of ${validation.mainDrawPassPercentage.toFixed(1)}% for ${gameType} analysis. Strategy shows promise.`
                    : `Pass rate of ${validation.mainDrawPassPercentage?.toFixed(1) || '0.0'}% is within expected range for ${gameType} rules.`
              }
            </Typography>
          </Box>

          {/* Action button for analysis results */}
          <Stack 
            direction="row" 
            spacing={3} 
            sx={{ 
              mt: 3, 
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="outlined"
              onClick={onClear}
              startIcon={<ClearIcon />}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                minWidth: '200px',
                py: 1.2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                  borderColor: '#d32f2f',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Clear Analysis Results
            </Button>
          </Stack>
        </Box>
      </Fade>
    );
  };

  // Generated numbers display component
  const GeneratedNumbersDisplay = () => (
    <Fade in={true} timeout={600}>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
          🎲 Your Generated Numbers
        </Typography>
        
        <Grid container spacing={2}>
          {generatedNumbers.map((combination, index) => {
            const pattern = getPattern(combination);
            const patternColor = getPatternColor(pattern);
            
            return (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 2,
                    p: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        backgroundColor: colors.accent,
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                    />
                    <Chip
                      label={pattern}
                      size="small"
                      sx={{
                        backgroundColor: alpha(patternColor, 0.2),
                        color: patternColor,
                        fontWeight: 'bold',
                        border: `1px solid ${alpha(patternColor, 0.3)}`,
                      }}
                    />
                  </Stack>
                  
                  <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={1}>
                    {combination.map((number, idx) => (
                      <NumberDisplay key={idx} number={number} />
                    ))}
                  </Stack>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      mt: 1, 
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    {gameType === 'COMBO' ? 'Order doesn\'t matter' : 'Exact order required'}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Strategic insights */}
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 195, 0, 0.1)',
            border: '1px solid rgba(255, 195, 0, 0.3)',
            borderRadius: 2,
            p: 2,
            mt: 3,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
            💡 <strong>Strategic Insight:</strong> {generatedNumbers.length === 2 
              ? 'These combinations use BBA and BAA patterns with optimal difference rules for maximum coverage.'
              : 'These combinations cover all 6 valid patterns (BBA, BAB, ABB, BAA, ABA, AAB) for comprehensive coverage.'
            }
          </Typography>
        </Paper>

        {/* Action buttons */}
        <Stack 
          direction="row" 
          spacing={3} 
          sx={{ 
            mt: 3, 
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap', 
            gap: 2 
          }}
        >
          <Button
            variant="outlined"
            onClick={onGenerateNew}
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: colors.accent,
              color: colors.accent,
              minWidth: '160px',
              py: 1.2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(colors.accent, 0.1),
                borderColor: colors.accent,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Generate New Set
          </Button>
          <Button
            variant="outlined"
            onClick={onClear}
            startIcon={<ClearIcon />}
            sx={{
              borderColor: '#f44336',
              color: '#f44336',
              minWidth: '140px',
              py: 1.2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                borderColor: '#d32f2f',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Clear Numbers
          </Button>
        </Stack>
      </Box>
    </Fade>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        p: 4,
        mt: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <CasinoIcon sx={{ fontSize: 28, color: colors.accent }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
            {gameType} Actions
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 500, mx: 'auto' }}>
          Follow the workflow below to generate numbers, analyze historical data, and view results
        </Typography>
      </Box>

      {/* Workflow Steps */}
      <Grid container spacing={3}>
        {/* Step 1: Generate Numbers */}
        <Grid item xs={12} md={4}>
          <Box>
            <Card
              elevation={0}
              sx={{
                background: generatedNumbers
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: generatedNumbers
                  ? `1px solid ${alpha(colors.accent, 0.3)}` 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: generatedNumbers
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'rgba(255, 255, 255, 0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label="1"
                    size="small"
                    sx={{
                      backgroundColor: colors.accent,
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: 28,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Generate Numbers
                  </Typography>
                  {generatedNumbers && (
                    <Chip
                      label="✓ Complete"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: '#4caf50',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Stack>
                
                <Typography 
                  variant="body2" 
                  sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, minHeight: 40 }}
                >
                  {playDescription || `Create optimized ${gameType} number combinations based on statistical analysis`}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={onPlay}
                  startIcon={<PlayIcon />}
                  sx={{
                    background: colors.primaryGradient,
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      background: colors.primaryGradient,
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  Play {gameType}
                </Button>
              </CardContent>
            </Card>
            
            {/* Generated Numbers Display directly below */}
            {generatedNumbers && (
              <Box sx={{ mt: 2 }}>
                <GeneratedNumbersDisplay />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Step 2: Analyze Historical Data */}
        <Grid item xs={12} md={4}>
          <Box>
            <Card
              elevation={0}
              sx={{
                background: analysisResults
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: analysisResults
                  ? `1px solid ${alpha(colors.accent, 0.3)}`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: analysisResults
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label="2"
                    size="small"
                    sx={{
                      backgroundColor: colors.accent,
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: 28,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Analyze History
                  </Typography>
                  {analysisResults && (
                    <Chip
                      label="✓ Complete"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: '#4caf50',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <Tooltip title="Analyzes historical lottery draws to validate your strategy" arrow>
                    <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                
                <Typography 
                  variant="body2" 
                  sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, minHeight: 40 }}
                >
                  {checkDescription || `Test ${gameType} rules against historical draws to measure strategy effectiveness`}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={onCheck}
                  disabled={checkLoading}
                  startIcon={checkLoading ? <TrendingUpIcon className="rotating-icon" /> : <AnalyticsIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #66bb6a 30%, #4caf50 90%)',
                      transform: 'scale(1.02)',
                    },
                    '&:disabled': {
                      background: 'rgba(76, 175, 80, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {checkLoading ? 'Analyzing...' : 'Check Historical Data'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Analysis Results Display directly below */}
            {analysisResults && (
              <Box sx={{ mt: 2 }}>
                <AnalysisResultsDisplay />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Workflow Explanation */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.6)', 
            display: 'block', 
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          💡 Tip: Start by generating numbers, then analyze historical data to validate your strategy effectiveness
        </Typography>
      </Box>

      {/* Rotating icon animation */}
      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-icon {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Paper>
  );
};

export default ActionPanel;