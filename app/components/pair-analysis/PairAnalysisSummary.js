'use client';
import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography
} from '@mui/material';

const PairAnalysisSummary = ({ data }) => {
    if (!data) return null;

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Total Draws Analyzed
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#FFC300' }}>
                            {data.summary.totalDrawsAnalyzed.toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Unique Pairs Found
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#2196F3' }}>
                            {data.summary.pairsFound} / 45
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            High Frequency Pairs
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#4CAF50' }}>
                            {data.insights.categoryStats.high}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Low Frequency Pairs
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#f44336' }}>
                            {data.insights.categoryStats.low}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default PairAnalysisSummary;