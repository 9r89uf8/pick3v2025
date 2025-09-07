'use client';
import React from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Stack,
    Chip
} from '@mui/material';

const PairInsights = ({ data }) => {
    if (!data) return null;
    
    const getPossibilityLabel = () => {
        switch(data.pairType) {
            case 'first-third':
                return 'possible middles';
            case 'second-third':
                return 'possible firsts';
            default:
                return 'possible thirds';
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.02)' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#FFC300' }}>
                Key Pattern Discovery
            </Typography>
            <Typography variant="body1" paragraph>
                {data.insights.correlationNote}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Most Frequent Pairs</Typography>
                    <Box sx={{ pl: 2 }}>
                        {data.insights.mostFrequent.slice(0, 5).map((pair, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip label={pair.pair} color="success" />
                                    <Typography variant="body2">
                                        {pair.frequency} times ({pair.percentage}%) - {pair.possibleThirds} {getPossibilityLabel()}
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Least Frequent Pairs</Typography>
                    <Box sx={{ pl: 2 }}>
                        {data.insights.leastFrequent.slice(0, 5).map((pair, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip label={pair.pair} color="error" />
                                    <Typography variant="body2">
                                        {pair.frequency} times ({pair.percentage}%) - {pair.possibleThirds} {getPossibilityLabel()}
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PairInsights;