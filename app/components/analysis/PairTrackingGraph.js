import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Download as DownloadIcon
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import {
    fetchPairAnalysis,
    formatPairDataForChart,
    getHighlightedPairs,
    calculatePairStats,
    exportPairDataToCSV
} from '@/app/services/pairAnalysisService';

const PairTrackingGraph = ({ selectedMonth = null, selectedYear = null }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [targetPairStats, setTargetPairStats] = useState({});
    const [targetPairTimeline, setTargetPairTimeline] = useState([]);
    const [colorMap, setColorMap] = useState({});
    const [error, setError] = useState(null);
    const [totalHits, setTotalHits] = useState(0);
    
    // Target pairs to track exclusively
    const TARGET_PAIRS = {
        '1st & 2nd': ['0-1', '0-2', '1-2', '3-4', '1-4'],
        '1st & 3rd': ['1-8', '1-9', '0-9', '0-7', '0-8'],
        '2nd & 3rd': ['7-8', '8-9', '6-7', '5-7', '5-8']
    };
    
    // Flatten all target pairs for easy checking
    const ALL_TARGET_PAIRS = [
        ...TARGET_PAIRS['1st & 2nd'],
        ...TARGET_PAIRS['1st & 3rd'],
        ...TARGET_PAIRS['2nd & 3rd']
    ];

    useEffect(() => {
        loadPairAnalysis();
    }, [selectedMonth, selectedYear]);

    const loadPairAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchPairAnalysis(selectedMonth, selectedYear);
            
            if (result.success) {
                setData(result.data);
                
                const formatted = formatPairDataForChart(result, ALL_TARGET_PAIRS);
                setChartData(formatted.chartData);
                setTargetPairStats(formatted.targetPairStats);
                setTargetPairTimeline(formatted.targetPairTimeline);
                setColorMap(formatted.colorMap);
                setTotalHits(formatted.totalTargetPairHits);
            } else {
                setError(result.error || 'Failed to load pair analysis');
            }
        } catch (err) {
            setError('Error loading pair analysis');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!targetPairStats) return;
        
        let csvContent = `Target Pair Analysis - ${data?.summary.month} ${data?.summary.year}\n`;
        csvContent += 'Pair,Position,Count,Draws\n';
        
        Object.entries(targetPairStats).forEach(([pair, stats]) => {
            const position = TARGET_PAIRS['1st & 2nd'].includes(pair) ? '1st & 2nd' :
                            TARGET_PAIRS['1st & 3rd'].includes(pair) ? '1st & 3rd' : '2nd & 3rd';
            const drawNumbers = stats.draws.map(d => d.drawIndex).join(';');
            csvContent += `${pair},${position},${stats.count},"${drawNumbers}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `target-pairs-${data?.summary.month}-${data?.summary.year}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Calculate distribution data for charts
    const getDistributionData = () => {
        if (!targetPairStats) return { pieData: [], barData: [] };
        
        const sectionTotals = {
            '1st & 2nd': 0,
            '1st & 3rd': 0,
            '2nd & 3rd': 0
        };
        
        // Calculate totals for each section
        Object.entries(TARGET_PAIRS).forEach(([position, pairs]) => {
            pairs.forEach(pair => {
                const stats = targetPairStats[pair];
                if (stats) {
                    sectionTotals[position] += stats.count;
                }
            });
        });
        
        const grandTotal = Object.values(sectionTotals).reduce((sum, count) => sum + count, 0);
        
        // Pie chart data
        const pieData = Object.entries(sectionTotals).map(([position, count]) => ({
            name: position,
            value: count,
            percentage: grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(1) : 0,
            color: colorMap[position]
        })).filter(item => item.value > 0); // Only show sections with data
        
        // Bar chart data - individual pairs
        const barData = [];
        Object.entries(TARGET_PAIRS).forEach(([position, pairs]) => {
            pairs.forEach(pair => {
                const stats = targetPairStats[pair];
                barData.push({
                    pair,
                    count: stats?.count || 0,
                    position,
                    color: colorMap[position]
                });
            });
        });
        
        return { pieData, barData, sectionTotals, grandTotal };
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const point = payload[0].payload;
            if (!point) return null;
            
            return (
                <Paper sx={{ p: 2, border: '1px solid rgba(255, 195, 0, 0.3)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Draw {point.drawIndex} - {point.drawDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Numbers: {point.numbers.join('-')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Pair: {point.pair}
                    </Typography>
                </Paper>
            );
        }
        return null;
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!data) {
        return (
            <Alert severity="info">
                No pair analysis data available
            </Alert>
        );
    }

    return (
        <Paper 
            elevation={3}
            sx={{ 
                p: { xs: 2, md: 3 },
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 195, 0, 0.2)',
                borderRadius: 2
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" className="gradient-text" sx={{ fontWeight: 'bold' }}>
                    Pair Tracking - {data.summary.month} {data.summary.year}
                </Typography>
                <Button
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                    variant="outlined"
                    size="small"
                >
                    Export CSV
                </Button>
            </Box>

            {/* Summary Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">{data.summary.totalDraws}</Typography>
                            <Typography variant="caption">Total Draws</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">{ALL_TARGET_PAIRS.length}</Typography>
                            <Typography variant="caption">Target Pairs</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">{totalHits}</Typography>
                            <Typography variant="caption">Total Hits</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">{targetPairTimeline.length}</Typography>
                            <Typography variant="caption">Draws with Hits</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Distribution Charts */}
            {totalHits > 0 && (() => {
                const { pieData, barData, sectionTotals, grandTotal } = getDistributionData();
                
                return (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Pie Chart - Section Distribution */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Section Distribution
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    dataKey="value"
                                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                    labelLine={false}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value, name) => [`${value} hits (${pieData.find(p => p.name === name)?.percentage}%)`, name]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                    
                                    {/* Legend */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                        {Object.entries(sectionTotals).map(([position, count]) => (
                                            <Box key={position} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box 
                                                    sx={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        backgroundColor: colorMap[position], 
                                                        mr: 1,
                                                        borderRadius: 1
                                                    }} 
                                                />
                                                <Typography variant="caption">
                                                    {position}: {count}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        {/* Bar Chart - Individual Pairs */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Individual Pair Distribution
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                                <XAxis 
                                                    dataKey="pair" 
                                                    tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                                                <Tooltip 
                                                    formatter={(value, name, props) => [
                                                        `${value} hits`, 
                                                        `${props.payload.pair} (${props.payload.position})`
                                                    ]}
                                                />
                                                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                                    {barData.map((entry, index) => (
                                                        <Cell key={`bar-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                );
            })()}

            {/* Target Pairs Timeline */}
            {targetPairTimeline.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Target Pairs Timeline - {totalHits} Total Hits
                        </Typography>
                        
                        {/* Simple timeline display */}
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {[...targetPairTimeline].reverse().map((draw, index) => (
                                <Card key={index} sx={{ mb: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                    <CardContent sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">
                                                <strong>Draw {draw.drawIndex}</strong> ({draw.drawDate}) - Numbers: {draw.numbers.join('-')}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {Object.entries(draw.targetPairs).map(([pair, positions]) => {
                                                    const color = positions.includes('1st & 2nd') ? colorMap['1st & 2nd'] :
                                                                 positions.includes('1st & 3rd') ? colorMap['1st & 3rd'] : 
                                                                 colorMap['2nd & 3rd'];
                                                    return (
                                                        <Chip
                                                            key={pair}
                                                            label={`${pair} (${positions.join(', ')})`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: color,
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Target Pairs Statistics */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Target Pairs Statistics
            </Typography>
            
            {Object.entries(TARGET_PAIRS).map(([position, pairs]) => (
                <Card key={position} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box 
                                sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    backgroundColor: colorMap[position], 
                                    mr: 2, 
                                    borderRadius: 1 
                                }} 
                            />
                            <Typography variant="h6">{position} Position Pairs</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {pairs.map((pair) => {
                                const stats = targetPairStats[pair];
                                const count = stats?.count || 0;
                                return (
                                    <Chip
                                        key={pair}
                                        label={`${pair} (${count}x)`}
                                        size="small"
                                        variant="filled"
                                        sx={{
                                            backgroundColor: count > 0 ? colorMap[position] : 'rgba(128, 128, 128, 0.3)',
                                            color: 'white',
                                            fontWeight: count > 0 ? 'bold' : 'normal'
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Paper>
    );
};

export default PairTrackingGraph;