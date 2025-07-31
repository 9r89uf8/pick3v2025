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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShowChartIcon from '@mui/icons-material/ShowChart';

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

const StraightTestResultsDisplay = ({ testResults, loading }) => {
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Analyzing straight draws...</Typography>
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
    patternPassAnalysis,
    validation,
    fireballAnalysis
  } = testResults;

  const formatPercentage = (value) => {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : '0%';
  };

  const validPatterns = ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'];

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        STRAIGHT Test Results
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
          Pattern Distribution (All Patterns)
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(patterns.counts).map(([pattern, count]) => (
            <Grid item xs={6} md={3} key={pattern}>
              <StatBox>
                <Chip 
                  label={pattern} 
                  color={validPatterns.includes(pattern) ? 'success' : 'default'}
                  variant={validPatterns.includes(pattern) ? 'filled' : 'outlined'}
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

      {/* Pattern Pass Analysis Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <ShowChartIcon sx={{ mr: 1 }} />
          Pattern Pass Analysis
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pattern</TableCell>
                <TableCell align="right">Total Count</TableCell>
                <TableCell align="right">Passed</TableCell>
                <TableCell align="right">Pass Rate</TableCell>
                <TableCell align="right">Difference ≤ 2</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validPatterns.map((pattern) => (
                <TableRow key={pattern}>
                  <TableCell>
                    <Chip label={pattern} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    {patterns.counts[pattern] || 0}
                  </TableCell>
                  <TableCell align="right">
                    {patternPassAnalysis.counts[pattern] || 0}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      fontWeight="bold" 
                      color={patternPassAnalysis.percentages[pattern] > 50 ? 'success.main' : 'text.primary'}
                    >
                      {formatPercentage(patternPassAnalysis.percentages[pattern])}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ✓
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detailed Difference Analysis */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Difference Distribution by Pattern
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(differences).map(([pattern, data]) => {
            if (!validPatterns.includes(pattern) || Object.keys(data).length === 0) return null;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={pattern}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {pattern} Pattern
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {Object.entries(data).map(([diff, count]) => (
                    <Box key={diff} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        Diff {diff}:
                      </Typography>
                      <Typography variant="body2" fontWeight={diff <= 2 ? 'bold' : 'normal'}>
                        {count} draws
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

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
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Pattern Breakdown
                </Typography>
                {Object.entries(fireballAnalysis.patternBreakdown).map(([pattern, count]) => (
                  <Typography key={pattern} variant="body2">
                    {pattern}: {count}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StraightTestResultsDisplay;