import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';

const DrawsList = ({ draws, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!draws || draws.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No draws available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 195, 0, 0.2)',
        borderRadius: 2,
        maxHeight: isMobile ? 400 : 600,
        overflow: 'auto'
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                background: 'rgba(255, 195, 0, 0.1)',
                color: theme.palette.text.primary,
                fontWeight: 'bold'
              }}
            >
              Date
            </TableCell>
            <TableCell 
              sx={{ 
                background: 'rgba(255, 195, 0, 0.1)',
                color: theme.palette.text.primary,
                fontWeight: 'bold'
              }}
            >
              Sorted Numbers
            </TableCell>
            <TableCell 
              sx={{ 
                background: 'rgba(255, 195, 0, 0.1)',
                color: theme.palette.text.primary,
                fontWeight: 'bold'
              }}
            >
              Fireball
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {draws.map((draw, index) => (
            <TableRow 
              key={draw.id || index}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 195, 0, 0.05)',
                },
              }}
            >
              <TableCell sx={{ color: theme.palette.text.primary }}>
                {draw.drawDate}
              </TableCell>
              <TableCell>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {[draw.sortedFirstNumber, draw.sortedSecondNumber, draw.sortedThirdNumber]
                    .filter(num => num !== undefined)
                    .map((num, numIndex) => (
                    <Chip
                      key={numIndex}
                      label={num}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 195, 0, 0.2)',
                        color: theme.palette.text.primary,
                        fontWeight: 'bold',
                        minWidth: '32px'
                      }}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>
                {draw.fireball !== undefined ? (
                  <Chip
                    label={draw.fireball}
                    size="small"
                    sx={{
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DrawsList;