// app/services/combinationsService.js - Service layer for combinations API

/**
 * Generate all 220 combinations with analysis
 */
export const generateCombinations = async () => {
    try {
        const response = await fetch('/api/combinations/generate', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating combinations:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate combinations'
        };
    }
};

/**
 * Save combinations to Firebase
 */
export const saveCombinationsToFirebase = async (combinations) => {
    try {
        const response = await fetch('/api/combinations/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ combinations })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving combinations to Firebase:', error);
        return {
            success: false,
            error: error.message || 'Failed to save combinations'
        };
    }
};

/**
 * Fetch saved combinations from Firebase with optional filters
 */
export const fetchCombinationsFromFirebase = async (options = {}) => {
    try {
        const params = new URLSearchParams();
        
        // Add query parameters if provided
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.order) params.append('order', options.order);
        if (options.pattern) params.append('pattern', options.pattern);
        if (options.category) params.append('category', options.category);
        if (options.limit) params.append('limit', options.limit);
        
        const queryString = params.toString();
        const url = `/api/combinations/fetch${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching combinations from Firebase:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch combinations'
        };
    }
};

/**
 * Analyze combination frequencies in historical draws
 */
export const analyzeCombinationFrequencies = async () => {
    try {
        const response = await fetch('/api/combinations/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error analyzing combination frequencies:', error);
        return {
            success: false,
            error: error.message || 'Failed to analyze frequencies'
        };
    }
};