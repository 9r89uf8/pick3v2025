'use client';
import React, { useState } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button,
    Paper,
    Grid
} from '@mui/material';
import { Today as TodayIcon } from '@mui/icons-material';
import PairTrackingGraph from '@/app/components/analysis/PairTrackingGraph';

export default function PairTracking() {
    // Get current month and year
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = String(now.getFullYear());
    
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    
    const availableYears = ['2024', '2025']; // Add more years as needed
    
    const handleCurrentMonth = () => {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
    };
    
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" className="gradient-text" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Pair Tracking Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Analyze pair frequencies and positions from selected month's draws
                </Typography>
            </Box>
            
            {/* Month/Year Selector */}
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 195, 0, 0.2)'
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                label="Month"
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {monthNames.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={selectedYear}
                                label="Year"
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            variant="outlined"
                            startIcon={<TodayIcon />}
                            onClick={handleCurrentMonth}
                            fullWidth
                            disabled={selectedMonth === currentMonth && selectedYear === currentYear}
                        >
                            Current Month
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Viewing: <strong>{selectedMonth} {selectedYear}</strong>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            
            <PairTrackingGraph selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </Container>
    );
}