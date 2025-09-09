'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Chip,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Collapse,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom
} from '@mui/material';
import {
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
    Casino as CasinoIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
    checkCombinationHistory,
    getFrequencyColor,
    getStatusBadge,
    parsePattern,
    calculateSuggestions,
    validateCombination,
    calculatePairAnalysis
} from '@/app/services/combinationBuilderService';

const CombinationBuilder = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState(null);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        recent: true,
        monthly: false,
        insights: true
    });

    // Check history whenever numbers change (skip for pairs - use mathematical analysis instead)
    useEffect(() => {
        if (selectedNumbers.length > 0 && selectedNumbers.length !== 2) {
            checkHistory();
        } else {
            setHistoryData(null);
        }
    }, [selectedNumbers]);

    const checkHistory = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await checkCombinationHistory(selectedNumbers);
            
            if (result.success) {
                setHistoryData(result.data);
            } else {
                setError(result.error || 'Failed to check history');
            }
        } catch (err) {
            setError('Error checking combination history');
        } finally {
            setLoading(false);
        }
    };

    const handleNumberClick = (number) => {
        if (selectedNumbers.includes(number)) {
            // Remove number if already selected
            setSelectedNumbers(selectedNumbers.filter(n => n !== number));
        } else if (selectedNumbers.length < 3) {
            // Add number if less than 3 selected
            setSelectedNumbers([...selectedNumbers, number]);
        }
    };

    const handleClear = () => {
        setSelectedNumbers([]);
        setHistoryData(null);
        setError(null);
    };

    const handleRemoveNumber = (index) => {
        const newNumbers = [...selectedNumbers];
        newNumbers.splice(index, 1);
        setSelectedNumbers(newNumbers);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderNumberPad = () => (
        <Grid container spacing={1}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => {
                const isSelected = selectedNumbers.includes(number);
                const isB = number <= 4;
                
                return (
                    <Grid item xs={2.4} key={number}>
                        <Button
                            variant={isSelected ? "contained" : "outlined"}
                            fullWidth
                            onClick={() => handleNumberClick(number)}
                            disabled={!isSelected && selectedNumbers.length >= 3}
                            sx={{
                                height: isMobile ? 50 : 60,
                                fontSize: isMobile ? '1.2rem' : '1.5rem',
                                fontWeight: 'bold',
                                borderColor: isB ? '#2196F3' : '#FF9800',
                                color: isSelected ? 'white' : (isB ? '#2196F3' : '#FF9800'),
                                backgroundColor: isSelected ? (isB ? '#2196F3' : '#FF9800') : 'transparent',
                                '&:hover': {
                                    backgroundColor: isSelected 
                                        ? (isB ? '#1976D2' : '#F57C00')
                                        : (isB ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)')
                                }
                            }}
                        >
                            {number}
                        </Button>
                    </Grid>
                );
            })}
        </Grid>
    );

    const renderSelectedNumbers = () => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Selected Combination
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {[0, 1, 2].map(index => (
                    <Paper
                        key={index}
                        elevation={selectedNumbers[index] !== undefined ? 3 : 1}
                        sx={{
                            width: isMobile ? 60 : 80,
                            height: isMobile ? 60 : 80,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: selectedNumbers[index] !== undefined 
                                ? '2px solid' 
                                : '2px dashed',
                            borderColor: selectedNumbers[index] !== undefined
                                ? (selectedNumbers[index] <= 4 ? '#2196F3' : '#FF9800')
                                : 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: selectedNumbers[index] !== undefined
                                ? 'rgba(255, 195, 0, 0.1)'
                                : 'transparent',
                            position: 'relative'
                        }}
                    >
                        {selectedNumbers[index] !== undefined ? (
                            <>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {selectedNumbers[index]}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveNumber(index)}
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 0, 0, 0.3)'
                                        }
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </>
                        ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {index === 0 ? 'First' : index === 1 ? 'Second' : 'Third'}
                            </Typography>
                        )}
                    </Paper>
                ))}
                
                {selectedNumbers.length > 0 && (
                    <Fade in={true}>
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                            <Chip
                                label={parsePattern(historyData?.pattern || '').label}
                                color="primary"
                                size="small"
                            />
                            {validateCombination(selectedNumbers).valid && (
                                <Chip
                                    label="✓ Valid"
                                    color="success"
                                    size="small"
                                />
                            )}
                        </Box>
                    </Fade>
                )}
            </Box>
            
            {selectedNumbers.length === 3 && (
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info">
                        {validateCombination(selectedNumbers).message}
                    </Alert>
                </Box>
            )}
        </Box>
    );

    const renderFeedback = () => {
        // Show pair analysis for exactly 2 numbers
        if (selectedNumbers.length === 2) {
            const pairAnalysis = calculatePairAnalysis(selectedNumbers);
            if (!pairAnalysis) return null;
            
            return (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Pair Position Analysis
                    </Typography>
                    
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Pair {pairAnalysis.pair} - Total Combinations: {pairAnalysis.totalCombinations}
                            </Typography>
                            
                            {/* Analysis Table */}
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '2fr 1fr 1fr', 
                                gap: 2, 
                                alignItems: 'center',
                                mb: 2
                            }}>
                                {/* Headers */}
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Position
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                    Combinations
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                    Percentage
                                </Typography>
                                
                                {/* Data Rows */}
                                {pairAnalysis.configurations.map((config, index) => (
                                    <React.Fragment key={index}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {config.position}
                                        </Typography>
                                        <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {config.combinations}
                                        </Typography>
                                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                            {config.percentage.toFixed(1)}%
                                        </Typography>
                                    </React.Fragment>
                                ))}
                            </Box>
                            
                            {/* Dominant Configuration */}
                            <Divider sx={{ my: 2 }} />
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Dominant Configuration:</strong> {pairAnalysis.dominantConfiguration.position.replace(/\(.*\)/g, '').trim()} 
                                    ({pairAnalysis.dominantConfiguration.percentage.toFixed(1)}%)
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Box>
            );
        }
        
        // Original feedback for other cases (1 number or 3 numbers)
        if (!historyData) return null;
        
        const { statistics, insights, recentOccurrences, monthlyBreakdown } = historyData;
        
        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Analysis Results
                </Typography>
                
                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedNumbers.length >= 1 && statistics.firstNumber && (
                        <Grid item xs={12} md={4}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        First Number ({selectedNumbers[0]})
                                    </Typography>
                                    <Typography variant="h4" sx={{ my: 1 }}>
                                        {statistics.firstNumber.count}
                                    </Typography>
                                    <Typography variant="body2">
                                        {statistics.firstNumber.frequency}
                                    </Typography>
                                    {statistics.firstNumber.lastSeen && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Last: {statistics.firstNumber.lastSeen}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    
                    {selectedNumbers.length === 3 && statistics.fullCombination && (
                        <Grid item xs={12} md={4}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Full Combination
                                    </Typography>
                                    <Typography variant="h4" sx={{ my: 1 }}>
                                        {statistics.fullCombination.count}
                                    </Typography>
                                    <Typography variant="body2">
                                        {statistics.fullCombination.frequency}
                                    </Typography>
                                    {statistics.fullCombination.lastSeen && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Last: {statistics.fullCombination.lastSeen}
                                        </Typography>
                                    )}
                                    {getStatusBadge(statistics.fullCombination) && (
                                        <Chip
                                            label={getStatusBadge(statistics.fullCombination).label}
                                            size="small"
                                            sx={{ 
                                                mt: 1,
                                                backgroundColor: getStatusBadge(statistics.fullCombination).color,
                                                color: 'white'
                                            }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {/* Insights Section */}
                {insights && insights.length > 0 && (
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Insights</Typography>
                                <IconButton onClick={() => toggleSection('insights')}>
                                    {expandedSections.insights ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={expandedSections.insights}>
                                <List dense>
                                    {insights.map((insight, index) => (
                                        <ListItem key={index}>
                                            <ListItemText 
                                                primary={insight}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Occurrences */}
                {recentOccurrences && recentOccurrences.length > 0 && (
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Recent Occurrences</Typography>
                                <IconButton onClick={() => toggleSection('recent')}>
                                    {expandedSections.recent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={expandedSections.recent}>
                                <List dense>
                                    {recentOccurrences.slice(0, 5).map((occ, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${occ.numbers.join('-')} on ${occ.date}`}
                                                secondary={`Match Level: ${occ.matchLevel === selectedNumbers.length ? 'Full' : 'Partial'}`}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </CardContent>
                    </Card>
                )}
            </Box>
        );
    };

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" className="gradient-text" sx={{ fontWeight: 'bold' }}>
                    Build Your Combination
                </Typography>
                <Button
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                    variant="outlined"
                    size="small"
                >
                    Clear All
                </Button>
            </Box>

            {renderSelectedNumbers()}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                    Select Numbers (B: 0-4, A: 5-9)
                </Typography>
                {renderNumberPad()}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && renderFeedback()}
        </Paper>
    );
};

export default CombinationBuilder;