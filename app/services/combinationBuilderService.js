// app/services/combinationBuilderService.js - Service layer for combination builder

/**
 * Check historical occurrences of a combination
 * @param {number[]} numbers - Array of 1-3 numbers to check
 * @returns {Promise<Object>} Analysis results
 */
export const checkCombinationHistory = async (numbers) => {
    try {
        const response = await fetch('/api/combinations/check-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numbers })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking combination history:', error);
        return {
            success: false,
            error: error.message || 'Failed to check combination history'
        };
    }
};

/**
 * Format occurrence data for display
 * @param {Object} occurrence - Occurrence data from API
 * @returns {string} Formatted string
 */
export const formatOccurrence = (occurrence) => {
    const { date, month, year, time, matchLevel } = occurrence;
    const matchType = matchLevel === 1 ? 'First' : matchLevel === 2 ? 'First Two' : 'Full';
    return `${matchType} - ${date} (${month} ${year}) ${time || ''}`;
};

/**
 * Get color based on frequency
 * @param {number} count - Occurrence count
 * @param {number} total - Total draws
 * @returns {string} Color code
 */
export const getFrequencyColor = (count, total) => {
    const percentage = (count / total) * 100;
    
    if (percentage === 0) return '#666'; // Never - Gray
    if (percentage < 1) return '#2196F3'; // Rare - Blue
    if (percentage < 3) return '#4CAF50'; // Occasional - Green
    if (percentage < 5) return '#FF9800'; // Frequent - Orange
    return '#F44336'; // Very Frequent - Red
};

/**
 * Get status badge for combination
 * @param {Object} stats - Statistics object
 * @returns {Object} Badge info
 */
export const getStatusBadge = (stats) => {
    if (!stats) return null;
    
    if (stats.isHot) {
        return { label: '🔥 HOT', color: '#F44336' };
    }
    if (stats.isCold) {
        return { label: '❄️ COLD', color: '#2196F3' };
    }
    if (stats.count === 0) {
        return { label: '✨ NEW', color: '#9C27B0' };
    }
    if (stats.count === 1) {
        return { label: '🎯 RARE', color: '#00BCD4' };
    }
    return null;
};

/**
 * Parse pattern for display
 * @param {string} pattern - Pattern string (e.g., 'BBA')
 * @returns {Object} Pattern info
 */
export const parsePattern = (pattern) => {
    const patterns = {
        'B': { label: 'Low', description: '0-4' },
        'A': { label: 'High', description: '5-9' },
        'BB': { label: 'Two Low', description: 'Two numbers 0-4' },
        'BA': { label: 'Low-High', description: 'One low, one high' },
        'AA': { label: 'Two High', description: 'Two numbers 5-9' },
        'BBB': { label: 'All Low', description: 'All numbers 0-4' },
        'BBA': { label: 'Two Low, One High', description: 'Valid COMBO pattern' },
        'BAB': { label: 'Low-High-Low', description: 'Mixed pattern' },
        'BAA': { label: 'One Low, Two High', description: 'Valid COMBO pattern' },
        'ABB': { label: 'High-Low-Low', description: 'Mixed pattern' },
        'ABA': { label: 'High-Low-High', description: 'Mixed pattern' },
        'AAB': { label: 'Two High, One Low', description: 'Mixed pattern' },
        'AAA': { label: 'All High', description: 'All numbers 5-9' }
    };
    
    return patterns[pattern] || { label: pattern, description: 'Unknown pattern' };
};

/**
 * Calculate suggestions based on current selection
 * @param {number[]} numbers - Currently selected numbers
 * @param {Object} data - Historical data
 * @returns {Object} Suggestions
 */
export const calculateSuggestions = (numbers, data) => {
    const suggestions = {
        nextNumbers: [],
        avoidNumbers: [],
        hotPairs: [],
        patterns: []
    };
    
    if (!data || !data.statistics) return suggestions;
    
    // If two numbers are selected, suggest third numbers
    if (numbers.length === 2 && data.statistics.firstTwo?.possibleThirds) {
        const thirds = data.statistics.firstTwo.possibleThirds;
        
        // Suggest top 3 most frequent thirds
        suggestions.nextNumbers = thirds.slice(0, 3).map(t => ({
            number: t.number,
            frequency: t.count,
            label: `${t.number} (${t.count} times)`
        }));
        
        // Suggest avoiding numbers that never appeared
        const appearedThirds = new Set(thirds.map(t => t.number));
        for (let i = 0; i <= 9; i++) {
            if (!appearedThirds.has(i) && !numbers.includes(i)) {
                suggestions.avoidNumbers.push(i);
            }
        }
    }
    
    // Pattern suggestions
    if (numbers.length < 3) {
        const currentPattern = getPattern(numbers);
        if (currentPattern === 'BB') {
            suggestions.patterns.push('Add a high number (5-9) for BBA pattern');
        } else if (currentPattern === 'BA' || currentPattern === 'AB') {
            suggestions.patterns.push('Add another high for BAA or low for BBA');
        } else if (currentPattern === 'AA') {
            suggestions.patterns.push('Add a low number (0-4) for AAB pattern');
        }
    }
    
    return suggestions;
};

/**
 * Validate combination for play rules
 * @param {number[]} numbers - Selected numbers
 * @returns {Object} Validation result
 */
export const validateCombination = (numbers) => {
    if (numbers.length !== 3) {
        return { valid: false, message: 'Select 3 numbers' };
    }
    
    const pattern = getPattern(numbers);
    const validComboPatterns = ['BBA', 'BAA'];
    
    if (validComboPatterns.includes(pattern)) {
        // Check difference rules
        const bNumbers = numbers.filter(n => n <= 4);
        const aNumbers = numbers.filter(n => n > 4);
        
        if (pattern === 'BBA' && bNumbers.length === 2) {
            const diff = Math.abs(bNumbers[0] - bNumbers[1]);
            if (diff > 2) {
                return { valid: false, message: 'B numbers difference must be ≤ 2' };
            }
        }
        
        if (pattern === 'BAA' && aNumbers.length === 2) {
            const diff = Math.abs(aNumbers[0] - aNumbers[1]);
            if (diff > 2) {
                return { valid: false, message: 'A numbers difference must be ≤ 2' };
            }
        }
        
        return { valid: true, message: 'Valid COMBO combination' };
    }
    
    return { valid: true, message: `Pattern ${pattern} - valid for STRAIGHT play` };
};

/**
 * Calculate pair analysis for position configurations
 * @param {number[]} numbers - Array of exactly 2 numbers
 * @returns {Object} Pair analysis results
 */
export const calculatePairAnalysis = (numbers) => {
    if (numbers.length !== 2) {
        return null;
    }

    // Sort the numbers to ensure A < B
    const [A, B] = numbers.sort((a, b) => a - b);
    
    // Calculate combinations for each position using the formulas
    const firstSecond = 9 - B; // A-B-X configuration
    const firstThird = B - A - 1; // A-X-B configuration  
    const secondThird = A; // X-A-B configuration
    
    const configurations = [
        {
            position: `1st & 2nd (${A}-${B}-x)`,
            combinations: firstSecond,
            percentage: (firstSecond / 8) * 100
        },
        {
            position: `1st & 3rd (${A}-x-${B})`,
            combinations: firstThird,
            percentage: (firstThird / 8) * 100
        },
        {
            position: `2nd & 3rd (x-${A}-${B})`,
            combinations: secondThird,
            percentage: (secondThird / 8) * 100
        }
    ];
    
    // Find dominant configuration
    const dominantConfig = configurations.reduce((max, config) => 
        config.combinations > max.combinations ? config : max
    );
    
    return {
        pair: `${A}-${B}`,
        configurations,
        dominantConfiguration: {
            position: dominantConfig.position,
            percentage: dominantConfig.percentage
        },
        totalCombinations: firstSecond + firstThird + secondThird // Should always be 8
    };
};

function getPattern(numbers) {
    if (numbers.length === 0) return '';
    return numbers.map(n => n <= 4 ? 'B' : 'A').join('');
}