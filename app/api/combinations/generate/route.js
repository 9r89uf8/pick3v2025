// app/api/combinations/generate/route.js - Generate all 220 COMBO combinations
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants from existing combo logic
const CATEGORY_B_MAX = 4; // Numbers 0-4 are category 'B'
const MAX_ALLOWED_DIFF = 2; // Maximum allowed difference for passing draws

/**
 * Calculates the cascade subtraction final number
 * Example: [4,6,9] → |4-6|=2, |6-9|=3, |2-3|=1 → returns 1
 */
const calculateCascadeNumber = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return null;
    }

    // Calculate absolute differences
    const diff1 = Math.abs(numbers[0] - numbers[1]);
    const diff2 = Math.abs(numbers[1] - numbers[2]);
    const finalDiff = Math.abs(diff1 - diff2);

    return finalDiff;
};

/**
 * Categorizes a number as 'A' or 'B'
 * B: 0-4, A: 5-9
 */
const getCategory = (num) => num <= CATEGORY_B_MAX ? 'B' : 'A';

/**
 * Gets the A/B pattern for a set of three numbers
 * Returns pattern string (e.g., "BBA", "BAA") or error code
 */
const getABPattern = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return "INVALID_INPUT";
    }

    // Count categories
    const categories = numbers.map(getCategory);
    const bCount = categories.filter(cat => cat === 'B').length;
    const aCount = categories.filter(cat => cat === 'A').length;

    // Map counts to patterns
    const patterns = {
        '3-0': 'BBB',
        '2-1': 'BBA',
        '1-2': 'BAA',
        '0-3': 'AAA'
    };

    return patterns[`${bCount}-${aCount}`] || 'UNKNOWN';
};

/**
 * Validates if a combination passes COMBO rules
 */
const validateCombination = (numbers) => {
    // Rule 1: Must be 3 numbers
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return { valid: false, pattern: "INVALID", reason: "Must have exactly 3 numbers" };
    }

    // Rule 2: No repeating numbers (combinations with replacement allow repeats)
    // Skip this check for generating all combinations
    
    // Rule 3: Get pattern
    const pattern = getABPattern(numbers);
    
    // Rule 4: Check if it's BBA or BAA (the valid patterns)
    let isValid = false;
    let reason = "Not BBA or BAA pattern";
    
    if (pattern === 'BBA') {
        // For BBA: difference between 2nd and 1st B number must be ≤ 2
        const bNumbers = numbers.filter(n => n <= CATEGORY_B_MAX).sort((a, b) => a - b);
        if (bNumbers.length >= 2) {
            const diff = bNumbers[1] - bNumbers[0];
            if (diff <= MAX_ALLOWED_DIFF) {
                isValid = true;
                reason = "Valid BBA";
            } else {
                reason = `BBA difference ${diff} > ${MAX_ALLOWED_DIFF}`;
            }
        }
    } else if (pattern === 'BAA') {
        // For BAA: difference between 2nd and 1st A number must be ≤ 2
        const aNumbers = numbers.filter(n => n > CATEGORY_B_MAX).sort((a, b) => a - b);
        if (aNumbers.length >= 2) {
            const diff = aNumbers[1] - aNumbers[0];
            if (diff <= MAX_ALLOWED_DIFF) {
                isValid = true;
                reason = "Valid BAA";
            } else {
                reason = `BAA difference ${diff} > ${MAX_ALLOWED_DIFF}`;
            }
        }
    }
    
    return { valid: isValid, pattern, reason };
};

/**
 * Generate all combinations with replacement
 */
const generateCombinationsWithReplacement = (arr, k) => {
    const result = [];
    
    function backtrack(start, current) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            backtrack(i, current); // Allow reuse of same element
            current.pop();
        }
    }
    
    backtrack(0, []);
    return result;
};

export async function GET() {
    try {
        // Generate all 220 combinations (0-9 choose 3 with replacement)
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const allCombinations = generateCombinationsWithReplacement(digits, 3);
        
        // Process each combination
        const processedCombinations = allCombinations.map((combo, index) => {
            const pattern = getABPattern(combo);
            const cascadeNumber = calculateCascadeNumber(combo);
            const validation = validateCombination(combo);
            
            // Check for unique numbers (no repeats)
            const hasUniqueNumbers = new Set(combo).size === 3;
            
            // Additional analysis
            const sum = combo.reduce((a, b) => a + b, 0);
            const sortedCombo = [...combo].sort((a, b) => a - b);
            
            return {
                id: index + 1,
                numbers: combo,
                sortedNumbers: sortedCombo,
                pattern: pattern,
                cascadeNumber: cascadeNumber,
                isValid: validation.valid,
                validationReason: validation.reason,
                hasUniqueNumbers: hasUniqueNumbers,
                sum: sum,
                // Store cascade calculation details for transparency
                cascadeDetails: cascadeNumber !== null ? {
                    diff1: Math.abs(combo[0] - combo[1]),
                    diff2: Math.abs(combo[1] - combo[2]),
                    final: cascadeNumber,
                    calculation: `|${combo[0]}-${combo[1]}|=${Math.abs(combo[0] - combo[1])}, |${combo[1]}-${combo[2]}|=${Math.abs(combo[1] - combo[2])}, |${Math.abs(combo[0] - combo[1])}-${Math.abs(combo[1] - combo[2])}|=${cascadeNumber}`
                } : null
            };
        });
        
        // Generate statistics
        const stats = {
            totalCombinations: processedCombinations.length,
            patterns: {
                BBB: processedCombinations.filter(c => c.pattern === 'BBB').length,
                BBA: processedCombinations.filter(c => c.pattern === 'BBA').length,
                BAA: processedCombinations.filter(c => c.pattern === 'BAA').length,
                AAA: processedCombinations.filter(c => c.pattern === 'AAA').length
            },
            validCombinations: processedCombinations.filter(c => c.isValid).length,
            uniqueNumberCombinations: processedCombinations.filter(c => c.hasUniqueNumbers).length,
            cascadeDistribution: {}
        };
        
        // Calculate cascade distribution
        for (let i = 0; i <= 9; i++) {
            stats.cascadeDistribution[i] = processedCombinations.filter(c => c.cascadeNumber === i).length;
        }
        
        // Separate valid BBA and BAA combinations
        const validBBA = processedCombinations.filter(c => c.pattern === 'BBA' && c.isValid);
        const validBAA = processedCombinations.filter(c => c.pattern === 'BAA' && c.isValid);
        
        return new Response(JSON.stringify({
            success: true,
            combinations: processedCombinations,
            statistics: stats,
            validBBA: {
                count: validBBA.length,
                combinations: validBBA
            },
            validBAA: {
                count: validBAA.length,
                combinations: validBAA
            }
        }, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
        
    } catch (error) {
        console.error("Error generating combinations:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to generate combinations",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}