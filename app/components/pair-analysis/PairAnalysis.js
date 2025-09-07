'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Divider,
    CircularProgress
} from '@mui/material';
import { useStore } from '@/app/store/store';
import MonthlyPairTracking from './MonthlyPairTracking';
import ControlBar from './ControlBar';
import PairAnalysisSummary from './PairAnalysisSummary';
import PairInsights from './PairInsights';
import PairFrequencyTable from './PairFrequencyTable';

const PairAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState('frequency');
    const [order, setOrder] = useState('desc');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [addingToFavorites, setAddingToFavorites] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Pair type selection state
    const [pairType, setPairType] = useState('first-second');
    
    // Monthly tracking state
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [monthlyData, setMonthlyData] = useState(null);
    const [loadingMonthly, setLoadingMonthly] = useState(false);
    const [monthlyExpandedPairs, setMonthlyExpandedPairs] = useState(new Set());
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const analyzePairs = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/pair-analysis?pairType=${pairType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setData(result);
            } else {
                setError(result.error || 'Failed to analyze pairs');
            }
        } catch (err) {
            setError('Error analyzing pairs: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        analyzePairs();
        // Initialize with current month
        const currentDate = new Date();
        const currentMonth = months[currentDate.getMonth()];
        setSelectedMonth(currentMonth);
        // Analyze current month automatically
        analyzeMonthlyPairs(currentMonth, selectedYear);
    }, []);
    
    // Re-analyze when pair type changes
    useEffect(() => {
        if (pairType) {
            analyzePairs();
        }
    }, [pairType]);
    
    // Analyze monthly pairs for tracked pairs (0,1), (1,2), (2,3)
    const analyzeMonthlyPairs = async (month = selectedMonth, year = selectedYear) => {
        if (!month || !year) return;
        
        setLoadingMonthly(true);
        setError(null);
        
        try {
            const response = await fetch('/api/pair-analysis/monthly-tracker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ month, year })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setMonthlyData(result);
            } else {
                setError(result.error || 'Failed to analyze monthly pairs');
            }
        } catch (err) {
            setError('Error analyzing monthly pairs: ' + err.message);
        } finally {
            setLoadingMonthly(false);
        }
    };
    
    // Handle month/year change
    const handleMonthChange = (event) => {
        const newMonth = event.target.value;
        setSelectedMonth(newMonth);
        analyzeMonthlyPairs(newMonth, selectedYear);
    };
    
    const handleYearChange = (event) => {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        analyzeMonthlyPairs(selectedMonth, newYear);
    };
    
    // Toggle expand for monthly pair details
    const handleToggleMonthlyExpand = (pairKey) => {
        const newExpanded = new Set(monthlyExpandedPairs);
        if (newExpanded.has(pairKey)) {
            newExpanded.delete(pairKey);
        } else {
            newExpanded.add(pairKey);
        }
        setMonthlyExpandedPairs(newExpanded);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedPairs = React.useMemo(() => {
        if (!data?.pairs) return [];
        
        return [...data.pairs].sort((a, b) => {
            let aValue, bValue;
            
            switch (orderBy) {
                case 'pair':
                    aValue = a.first * 10 + a.second;
                    bValue = b.first * 10 + b.second;
                    break;
                case 'frequency':
                    aValue = a.frequency;
                    bValue = b.frequency;
                    break;
                case 'percentage':
                    aValue = a.percentage;
                    bValue = b.percentage;
                    break;
                case 'possibleThirds':
                    aValue = a.possibleThirds;
                    bValue = b.possibleThirds;
                    break;
                default:
                    return 0;
            }
            
            if (order === 'desc') {
                return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
            } else {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            }
        });
    }, [data, order, orderBy]);

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

    const handleToggleExpand = (pairKey) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(pairKey)) {
            newExpanded.delete(pairKey);
        } else {
            newExpanded.add(pairKey);
        }
        setExpandedRows(newExpanded);
    };

    // Helper function to determine pattern
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
        const numbers = combo.numbers;
        
        // Check if already favorite
        if (isFavorite(numbers)) {
            // Find and remove the favorite
            const favToRemove = favorites.find(fav => fav.combination.join('-') === numbers.join('-'));
            if (favToRemove) {
                removeFavorite(favToRemove.id);
                setSuccessMessage(`Removed ${numbers.join('-')} from favorites`);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
            return;
        }
        
        // Add to favorites
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
        setSuccessMessage(`Added ${numbers.join('-')} to favorites`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <Box sx={{ py: { xs: 1, md: 3 } }}>
            <MonthlyPairTracking
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                monthlyData={monthlyData}
                loadingMonthly={loadingMonthly}
                monthlyExpandedPairs={monthlyExpandedPairs}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                onRefresh={() => analyzeMonthlyPairs()}
                onToggleExpand={handleToggleMonthlyExpand}
            />

            <Divider sx={{ my: 4 }} />

            <ControlBar
                loading={loading}
                data={data}
                error={error}
                successMessage={successMessage}
                pairType={pairType}
                onPairTypeChange={setPairType}
                onAnalyzePairs={analyzePairs}
                onClearSuccessMessage={() => setSuccessMessage('')}
            />

            <PairAnalysisSummary data={data} />

            <PairInsights data={data} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : data ? (
                <PairFrequencyTable
                    sortedPairs={sortedPairs}
                    orderBy={orderBy}
                    order={order}
                    expandedRows={expandedRows}
                    onRequestSort={handleRequestSort}
                    onToggleExpand={handleToggleExpand}
                    addingToFavorites={addingToFavorites}
                />
            ) : null}
        </Box>
    );
};

export default PairAnalysis;