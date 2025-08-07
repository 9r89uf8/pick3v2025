'use client';
import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    Typography,
    Chip,
    Stack,
    IconButton,
    Collapse,
    Box,
    Grid,
    Tooltip
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Numbers as NumbersIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useStore } from '@/app/store/store';

const PairFrequencyTable = ({
    sortedPairs,
    orderBy,
    order,
    expandedRows,
    onRequestSort,
    onToggleExpand,
    addingToFavorites
}) => {
    const { isFavorite } = useStore();

    const getCategoryColor = (category) => {
        switch (category) {
            case 'high': return 'success';
            case 'medium': return 'warning';
            case 'low': return 'error';
            default: return 'default';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'high': return <TrendingUpIcon fontSize="small" />;
            case 'medium': return <NumbersIcon fontSize="small" />;
            case 'low': return <TrendingDownIcon fontSize="small" />;
            default: return null;
        }
    };

    const getPattern = (numbers) => {
        const bCount = numbers.filter(n => n <= 4).length;
        const aCount = numbers.filter(n => n > 4).length;
        
        if (bCount === 3) return 'BBB';
        if (bCount === 2) return 'BBA';
        if (bCount === 1) return 'BAA';
        if (bCount === 0) return 'AAA';
        return 'UNKNOWN';
    };

    const handleToggleFavorite = async (combo, pairData) => {
        const { addFavorite, removeFavorite, favorites } = useStore.getState();
        const numbers = combo.numbers;
        
        if (isFavorite(numbers)) {
            const favToRemove = favorites.find(fav => fav.combination.join('-') === numbers.join('-'));
            if (favToRemove) {
                removeFavorite(favToRemove.id);
            }
            return;
        }
        
        const pattern = getPattern(numbers);
        
        const favorite = {
            combination: numbers,
            combinationCount: combo.frequency,
            combinationPercentage: combo.percentage,
            pair: pairData.pair,
            pairCount: pairData.frequency,
            pairPercentage: pairData.percentage,
            pattern: pattern
        };
        
        addFavorite(favorite);
    };

    return (
        <TableContainer component={Paper} sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'pair'}
                                direction={orderBy === 'pair' ? order : 'asc'}
                                onClick={() => onRequestSort('pair')}
                            >
                                Pair
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">
                            <TableSortLabel
                                active={orderBy === 'frequency'}
                                direction={orderBy === 'frequency' ? order : 'asc'}
                                onClick={() => onRequestSort('frequency')}
                            >
                                Frequency
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">
                            <TableSortLabel
                                active={orderBy === 'percentage'}
                                direction={orderBy === 'percentage' ? order : 'asc'}
                                onClick={() => onRequestSort('percentage')}
                            >
                                Percentage
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">
                            <TableSortLabel
                                active={orderBy === 'possibleThirds'}
                                direction={orderBy === 'possibleThirds' ? order : 'asc'}
                                onClick={() => onRequestSort('possibleThirds')}
                            >
                                Possible 3rd Numbers
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Notes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedPairs.map((pair) => {
                        const isExpanded = expandedRows.has(pair.pair);
                        return (
                            <React.Fragment key={pair.pair}>
                                <TableRow 
                                    hover
                                    sx={{
                                        backgroundColor: pair.category === 'high' ? 'rgba(76, 175, 80, 0.05)' :
                                                       pair.category === 'low' ? 'rgba(244, 67, 54, 0.05)' : 'transparent'
                                    }}
                                >
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => onToggleExpand(pair.pair)}
                                        >
                                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                                            {pair.pair}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight="medium">
                                            {pair.frequency}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {pair.percentage.toFixed(2)}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={pair.possibleThirds} 
                                            size="small"
                                            color={pair.possibleThirds >= 7 ? 'success' : 
                                                   pair.possibleThirds >= 4 ? 'warning' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            {getCategoryIcon(pair.category)}
                                            <Chip 
                                                label={pair.category} 
                                                size="small" 
                                                color={getCategoryColor(pair.category)}
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        {pair.isRepeat && (
                                            <Typography variant="caption" color="textSecondary">
                                                Repeat pair
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                                
                                {/* Expandable row for combinations */}
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 2 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Combinations for {pair.pair}
                                                </Typography>
                                                
                                                {/* Previous Pattern Insights */}
                                                {pair.previousPatterns && (
                                                    <Box sx={{ mb: 3, p: 2, background: 'rgba(255, 195, 0, 0.05)', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#FFC300' }}>
                                                            Pattern Insights
                                                        </Typography>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    Activity Score: {pair.previousPatterns.activityScore.toFixed(1)}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    First number activity: {pair.previousPatterns.firstNumberActivity} | Second number activity: {pair.previousPatterns.secondNumberActivity}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                {pair.previousPatterns.topPredecessors.length > 0 && (
                                                                    <>
                                                                        <Typography variant="body2" color="textSecondary">
                                                                            Common predecessors:
                                                                        </Typography>
                                                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                                            {pair.previousPatterns.topPredecessors.map((pred, idx) => (
                                                                                <Chip
                                                                                    key={idx}
                                                                                    label={`${pred.pair} (${pred.count}x)`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                            ))}
                                                                        </Stack>
                                                                    </>
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                )}
                                                
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Combination</TableCell>
                                                            <TableCell align="center">Frequency</TableCell>
                                                            <TableCell align="center">Percentage</TableCell>
                                                            <TableCell align="center">Favorite</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {pair.combinations && pair.combinations.map((combo) => (
                                                            <TableRow key={combo.combo}>
                                                                <TableCell>
                                                                    <Chip 
                                                                        label={combo.combo} 
                                                                        size="small" 
                                                                        variant={combo.frequency > 0 ? "filled" : "outlined"}
                                                                        color={combo.frequency > 0 ? "primary" : "default"}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography 
                                                                        variant="body2" 
                                                                        fontWeight={combo.frequency > 0 ? "medium" : "normal"}
                                                                        color={combo.frequency > 0 ? "textPrimary" : "textSecondary"}
                                                                    >
                                                                        {combo.frequency}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography variant="body2" color={combo.frequency > 0 ? "textPrimary" : "textSecondary"}>
                                                                        {combo.percentage.toFixed(2)}%
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title={isFavorite(combo.numbers) ? "Remove from favorites" : "Add to favorites"}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleToggleFavorite(combo, pair)}
                                                                            disabled={addingToFavorites}
                                                                            sx={{ 
                                                                                color: isFavorite(combo.numbers) ? '#FFC300' : 'inherit',
                                                                                '&:hover': {
                                                                                    color: '#FFC300'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {isFavorite(combo.numbers) ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PairFrequencyTable;