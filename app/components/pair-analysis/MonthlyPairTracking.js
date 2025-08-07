'use client';
import React from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Stack,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    CalendarMonth as CalendarMonthIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

const MonthlyPairTracking = ({
    selectedMonth,
    selectedYear,
    monthlyData,
    loadingMonthly,
    monthlyExpandedPairs,
    onMonthChange,
    onYearChange,
    onRefresh,
    onToggleExpand
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = ["2025", "2024", "2023"];

    return (
        <Paper sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: { xs: 2, md: 3 }, 
            background: 'rgba(255, 195, 0, 0.03)', 
            border: '1px solid rgba(255, 195, 0, 0.2)' 
        }}>
            <Stack 
                direction={isMobile ? "column" : "row"} 
                alignItems={isMobile ? "flex-start" : "center"} 
                justifyContent={isMobile ? "flex-start" : "space-between"} 
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    sx={{ 
                        color: '#FFC300', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                >
                    <TimelineIcon fontSize={isMobile ? "small" : "medium"} /> 
                    Monthly Pair Tracking
                </Typography>
                <Stack 
                    direction={isSmallMobile ? "column" : "row"} 
                    spacing={1}
                    sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                    <FormControl size="small" sx={{ minWidth: { xs: 'auto', sm: 120 }, flex: isSmallMobile ? 1 : 'none' }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={selectedMonth}
                            onChange={onMonthChange}
                            label="Month"
                        >
                            {months.map(month => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: 'auto', sm: 100 }, flex: isSmallMobile ? 1 : 'none' }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={onYearChange}
                            label="Year"
                        >
                            {years.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={loadingMonthly ? <CircularProgress size={20} /> : !isSmallMobile && <CalendarMonthIcon />}
                        onClick={onRefresh}
                        disabled={loadingMonthly}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isSmallMobile}
                        sx={{ 
                            borderColor: '#FFC300',
                            color: '#FFC300',
                            minWidth: isSmallMobile ? 'auto' : '100px',
                            '&:hover': {
                                borderColor: '#FFD700',
                                background: 'rgba(255, 195, 0, 0.1)'
                            }
                        }}
                    >
                        {isSmallMobile ? "🔄 Refresh" : "Refresh"}
                    </Button>
                </Stack>
            </Stack>

            {/* Monthly Summary Cards */}
            {monthlyData && (
                <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={6} md={3}>
                            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Total Draws in {selectedMonth}
                                    </Typography>
                                    <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: '#FFC300' }}>
                                        {monthlyData.totalDraws}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Total Pair Occurrences
                                    </Typography>
                                    <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: '#2196F3' }}>
                                        {monthlyData.summary.totalPairOccurrences}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Coverage
                                    </Typography>
                                    <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: '#4CAF50' }}>
                                        {monthlyData.summary.coveragePercentage}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={3}>
                            <Card sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        Most Active Pair
                                    </Typography>
                                    <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: '#FF9800' }}>
                                        {monthlyData.summary.mostActivePair?.pair || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                                        {monthlyData.summary.mostActivePair?.count || 0} times
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tracked Pairs Display */}
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        sx={{ 
                            mb: 2, 
                            color: '#FFC300',
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                            textAlign: isMobile ? 'center' : 'left'
                        }}
                    >
                        Tracked Pairs: (0,1) • (1,2) • (2,3) • (0,2) • (1,3)
                    </Typography>
                    <Grid container spacing={2}>
                        {monthlyData.pairs.map((pair) => {
                            const isExpanded = monthlyExpandedPairs.has(pair.pair);
                            return (
                                <Grid item xs={12} key={pair.pair}>
                                    <Card sx={{ 
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: pair.count > 0 ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                            <Stack 
                                                direction={isMobile ? "column" : "row"} 
                                                alignItems={isMobile ? "stretch" : "center"} 
                                                justifyContent="space-between"
                                                spacing={isMobile ? 1 : 0}
                                            >
                                                <Stack 
                                                    direction={isSmallMobile ? "column" : "row"} 
                                                    alignItems={isSmallMobile ? "stretch" : "center"} 
                                                    spacing={isSmallMobile ? 1 : 2}
                                                    sx={{ width: isMobile ? '100%' : 'auto' }}
                                                >
                                                    <Chip 
                                                        label={pair.pair}
                                                        color={pair.count > 0 ? 'success' : 'default'}
                                                        size={isMobile ? "small" : "medium"}
                                                        sx={{ 
                                                            fontWeight: 'bold', 
                                                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                                            alignSelf: isSmallMobile ? 'center' : 'flex-start'
                                                        }}
                                                    />
                                                    <Typography 
                                                        variant={isMobile ? "body1" : "h6"}
                                                        sx={{ textAlign: isSmallMobile ? 'center' : 'left' }}
                                                    >
                                                        {pair.count} occurrences
                                                    </Typography>
                                                    <Chip 
                                                        label={`${pair.percentage}%`}
                                                        size="small"
                                                        color={parseFloat(pair.percentage) > 5 ? 'success' : 'default'}
                                                        sx={{ alignSelf: isSmallMobile ? 'center' : 'flex-start' }}
                                                    />
                                                    <Typography 
                                                        variant="body2" 
                                                        color="textSecondary"
                                                        sx={{ 
                                                            textAlign: isSmallMobile ? 'center' : 'left',
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        {pair.totalUniqueCombinations} unique combinations
                                                    </Typography>
                                                </Stack>
                                                <IconButton 
                                                    onClick={() => onToggleExpand(pair.pair)}
                                                    sx={{ alignSelf: isMobile ? 'center' : 'flex-start' }}
                                                >
                                                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                </IconButton>
                                            </Stack>

                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <Box sx={{ mt: 2 }}>
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#FFC300' }}>
                                                        Combinations with {pair.pair}:
                                                    </Typography>
                                                    {pair.combinations.length > 0 ? (
                                                        <TableContainer>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Combination</TableCell>
                                                                        <TableCell align="center">Count</TableCell>
                                                                        <TableCell>Dates</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {pair.combinations.map((combo) => (
                                                                        <TableRow key={combo.combo}>
                                                                            <TableCell>
                                                                                <Chip 
                                                                                    label={combo.combo}
                                                                                    color="primary"
                                                                                    size="small"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell align="center">
                                                                                <Typography fontWeight="bold">
                                                                                    {combo.count}
                                                                                </Typography>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Typography variant="caption" sx={{ 
                                                                                    display: 'block',
                                                                                    maxHeight: '60px',
                                                                                    overflow: 'auto'
                                                                                }}>
                                                                                    {combo.dates.join(', ')}
                                                                                </Typography>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            No occurrences in {selectedMonth} {selectedYear}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Top Combinations Summary */}
                    {monthlyData.summary.topCombinations && monthlyData.summary.topCombinations.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#FFC300' }}>
                                Top Combinations Across All Tracked Pairs
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                {monthlyData.summary.topCombinations.map((combo, idx) => (
                                    <Chip
                                        key={idx}
                                        label={`${combo.combo} (${combo.totalCount}x)`}
                                        color={idx === 0 ? 'success' : 'default'}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </>
            )}

            {loadingMonthly && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </Box>
            )}
        </Paper>
    );
};

export default MonthlyPairTracking;