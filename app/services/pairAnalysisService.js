// app/services/pairAnalysisService.js - Service layer for pair analysis functionality

/**
 * Fetch pair analysis data from API
 * @param {string} month - Month to analyze (e.g., 'Sep', 'Aug')
 * @param {string} year - Year to analyze (e.g., '2025')
 * @returns {Promise<Object>} Analysis results
 */
export const fetchPairAnalysis = async (month = null, year = null) => {
    try {
        let url = '/api/pairs/analyze';
        if (month && year) {
            url += `?month=${month}&year=${year}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching pair analysis:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch pair analysis'
        };
    }
};

/**
 * Format pair data for chart display - filtered for target pairs only
 * @param {Object} data - Raw pair analysis data
 * @param {Array} targetPairs - Array of target pair strings to track (not used anymore)
 * @returns {Object} Formatted chart data for target pairs
 */
export const formatPairDataForChart = (data, targetPairs = []) => {
    if (!data.success || !data.data) {
        return { chartData: [], colorMap: {} };
    }

    const { timeline, categories } = data.data;
    
    // Define target pairs by their specific positions
    const TARGET_PAIRS_BY_POSITION = {
        '1st & 2nd': ['0-1', '0-2', '1-2', '3-4', '1-4'],
        '1st & 3rd': ['1-8', '1-9', '0-9', '0-7', '0-8'],
        '2nd & 3rd': ['7-8', '8-9', '6-7', '5-7', '5-8']
    };
    
    // Flatten all target pairs for stats initialization
    const allTargetPairs = [
        ...TARGET_PAIRS_BY_POSITION['1st & 2nd'],
        ...TARGET_PAIRS_BY_POSITION['1st & 3rd'],
        ...TARGET_PAIRS_BY_POSITION['2nd & 3rd']
    ];
    
    // Create color mapping for positions
    const colorMap = {
        '1st & 2nd': '#ff4444', // Red
        '1st & 3rd': '#4444ff', // Blue
        '2nd & 3rd': '#44ff44'  // Green
    };
    
    // Create timeline data for target pairs only
    const targetPairTimeline = [];
    const targetPairStats = {};
    
    // Initialize stats for each target pair
    allTargetPairs.forEach(pair => {
        targetPairStats[pair] = {
            count: 0,
            positions: [],
            draws: []
        };
    });
    
    // Process timeline to track target pairs
    timeline.forEach((entry, index) => {
        const drawIndex = index + 1;
        const foundPairs = {};
        
        // Check each position for target pairs - ONLY track pairs in their designated positions
        Object.entries(entry.pairs).forEach(([position, pair]) => {
            if (TARGET_PAIRS_BY_POSITION[position] && TARGET_PAIRS_BY_POSITION[position].includes(pair)) {
                if (!foundPairs[pair]) {
                    foundPairs[pair] = [];
                }
                foundPairs[pair].push(position);
                
                // Update stats
                targetPairStats[pair].count++;
                targetPairStats[pair].positions.push(position);
                targetPairStats[pair].draws.push({
                    drawIndex,
                    drawDate: entry.drawDate,
                    numbers: entry.numbers,
                    position
                });
            }
        });
        
        // Add to timeline if any target pairs were found
        if (Object.keys(foundPairs).length > 0) {
            targetPairTimeline.push({
                drawIndex,
                drawDate: entry.drawDate,
                numbers: entry.numbers,
                targetPairs: foundPairs
            });
        }
    });
    
    // Create line chart data for each target pair
    const chartData = allTargetPairs.map(pair => {
        return {
            pair,
            data: targetPairStats[pair].draws.map(draw => ({
                x: draw.drawIndex,
                y: pair,
                drawDate: draw.drawDate,
                numbers: draw.numbers,
                position: draw.position
            }))
        };
    });
    
    return {
        chartData,
        targetPairStats,
        targetPairTimeline,
        colorMap,
        totalDraws: timeline.length,
        totalTargetPairHits: Object.values(targetPairStats).reduce((sum, stats) => sum + stats.count, 0)
    };
};

/**
 * Get specific pairs for highlighting
 * @param {Array} targetPairs - Array of pair strings to highlight (e.g., ['0-1', '1-8'])
 * @param {Object} categories - Categories data from analysis
 * @returns {Object} Highlighted pairs data
 */
export const getHighlightedPairs = (targetPairs, categories) => {
    const highlighted = {
        '1st & 2nd': [],
        '1st & 3rd': [],
        '2nd & 3rd': []
    };
    
    targetPairs.forEach(pairKey => {
        Object.entries(categories).forEach(([position, pairs]) => {
            const found = pairs.find(p => p.pair === pairKey);
            if (found) {
                highlighted[position].push(found);
            }
        });
    });
    
    return highlighted;
};

/**
 * Calculate pair statistics summary
 * @param {Object} monthlyPairs - Monthly pairs data
 * @returns {Object} Statistics summary
 */
export const calculatePairStats = (monthlyPairs) => {
    const stats = {
        totalUniquePairs: 0,
        dominantPositions: {
            '1st & 2nd': 0,
            '1st & 3rd': 0,
            '2nd & 3rd': 0
        },
        averageFrequency: 0,
        mostFrequent: null,
        leastFrequent: null
    };
    
    if (!monthlyPairs || Object.keys(monthlyPairs).length === 0) {
        return stats;
    }
    
    const pairs = Object.entries(monthlyPairs);
    stats.totalUniquePairs = pairs.length;
    
    // Calculate dominant positions
    pairs.forEach(([pairKey, data]) => {
        stats.dominantPositions[data.dominant]++;
    });
    
    // Calculate frequency stats
    const frequencies = pairs.map(([, data]) => data.total);
    stats.averageFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    
    // Find most and least frequent
    const maxFreq = Math.max(...frequencies);
    const minFreq = Math.min(...frequencies);
    
    stats.mostFrequent = pairs.find(([, data]) => data.total === maxFreq);
    stats.leastFrequent = pairs.find(([, data]) => data.total === minFreq);
    
    return stats;
};

/**
 * Filter pairs by minimum frequency
 * @param {Object} categories - Categories data
 * @param {number} minFrequency - Minimum frequency to include
 * @returns {Object} Filtered categories
 */
export const filterPairsByFrequency = (categories, minFrequency = 1) => {
    const filtered = {};
    
    Object.entries(categories).forEach(([position, pairs]) => {
        filtered[position] = pairs.filter(pair => pair.count >= minFrequency);
    });
    
    return filtered;
};

/**
 * Export pair data to CSV format
 * @param {Object} data - Pair analysis data
 * @returns {string} CSV content
 */
export const exportPairDataToCSV = (data) => {
    if (!data.success || !data.data) {
        return 'No data available';
    }
    
    const { monthlyPairs, summary } = data.data;
    
    let csvContent = `Pair Analysis Export - ${summary.month} ${summary.year}\n`;
    csvContent += 'Pair,1st & 2nd,1st & 3rd,2nd & 3rd,Total,Dominant Position,Dominant %\n';
    
    Object.entries(monthlyPairs).forEach(([pairKey, stats]) => {
        csvContent += `${pairKey},${stats.position_1_2},${stats.position_1_3},${stats.position_2_3},${stats.total},${stats.dominant},${stats.percentage.toFixed(1)}\n`;
    });
    
    return csvContent;
};