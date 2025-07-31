import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50]
}));

const TestResultsDisplay = ({ testResults, loading }) => {
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Analyzing draws...</Typography>
      </Box>
    );
  }

  if (!testResults) {
    return null;
  }

  const {
    summary,
    patterns,
    differences,
    validation,
    fireballAnalysis
  } = testResults;

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : '0%';
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        COMBO Test Results
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Draws
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary.totalDrawsFetched}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzed
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Valid Draws
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary.validDrawsProcessed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.uniqueNumberDraws} unique
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Pass Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {formatPercentage(validation.mainDrawPassPercentage)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {validation.mainDrawPasses} passed
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Fireball Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'orange' }}>
                {formatPercentage(validation.fireballPassPercentage)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {validation.fireballPasses} passed
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Pattern Distribution */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Pattern Distribution
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(patterns.counts).map(([pattern, count]) => (
            <Grid item xs={6} md={3} key={pattern}>
              <StatBox>
                <Chip 
                  label={pattern} 
                  color={pattern === 'BBA' || pattern === 'BAA' ? 'success' : 'default'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" fontWeight="bold">
                  {count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPercentage(patterns.percentages[pattern])}
                </Typography>
              </StatBox>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Difference Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              BBA Pattern Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Difference between 2nd and 1st B numbers
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="primary">
                {formatPercentage(differences.bba.passPercentage)}
              </Typography>
              <Typography variant="body2">
                Pass rate ({differences.bba.passCount} of {patterns.counts.BBA})
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Difference Distribution:
            </Typography>
            {Object.entries(differences.bba.distribution).map(([diff, count]) => (
              <Box key={diff} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Diff {diff}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {count} draws
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              BAA Pattern Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Difference between 3rd and 2nd A numbers
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="primary">
                {formatPercentage(differences.baa.passPercentage)}
              </Typography>
              <Typography variant="body2">
                Pass rate ({differences.baa.passCount} of {patterns.counts.BAA})
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Difference Distribution:
            </Typography>
            {Object.entries(differences.baa.distribution).map(([diff, count]) => (
              <Box key={diff} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Diff {diff}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {count} draws
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Fireball Analysis */}
      {fireballAnalysis && fireballAnalysis.drawsWithValidFireball > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 1 }} />
            Fireball Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatBox>
                <Typography variant="subtitle2" color="text.secondary">
                  Draws with Fireball
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {fireballAnalysis.drawsWithValidFireball}
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatBox>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Substitutions Passed
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {fireballAnalysis.totalSubstitutionsPassed}
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatBox>
                <Typography variant="subtitle2" color="text.secondary">
                  Pattern Breakdown
                </Typography>
                <Typography variant="body2">
                  BBA: {fireballAnalysis.patternBreakdown.BBA}
                </Typography>
                <Typography variant="body2">
                  BAA: {fireballAnalysis.patternBreakdown.BAA}
                </Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default TestResultsDisplay;