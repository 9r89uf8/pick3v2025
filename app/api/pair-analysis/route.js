// app/api/pair-analysis/route.js - Analyze first-two number pair frequencies
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


/**
 * Calculate how many valid numbers can complete a pair based on pair type
 */
const calculatePossibilities = (first, second, pairType) => {
    switch (pairType) {
        case 'first-third':
            // For first-third: count numbers between first and third (inclusive)
            return second - first + 1;
        case 'second-third':
            // For second-third: count numbers from 0 to second (inclusive)
            return first + 1;
        default: // 'first-second'
            // For first-second: count numbers from second to 9
            return 10 - second;
    }
};

/**
 * Categorize pair frequency
 */
const categorizePair = (frequency, totalDraws) => {
    const percentage = (frequency / totalDraws) * 100;
    
    // Based on the user's observations:
    // High: pairs that can build more combinations (7-9 possible thirds)
    // Medium: pairs that can build half-more combinations (4-6 possible thirds)  
    // Low: pairs that can build less combinations (1-3 possible thirds)
    
    if (percentage >= 4.0) return 'high';
    if (percentage >= 2.0) return 'medium';
    return 'low';
};

/**
 * Analyze previous draw patterns to find what preceded each pair
 */
const analyzePreviousPatterns = (draws, pairType) => {
    const transitionMatrix = new Map(); // tracks pair -> next pair transitions
    const numberActivity = new Map(); // tracks how often each number appears in recent history
    
    // Initialize tracking for each number
    for (let i = 0; i <= 9; i++) {
        numberActivity.set(i, {
            firstPositionCount: 0,
            secondPositionCount: 0,
            totalCount: 0
        });
    }
    
    // Process each draw with its previous data
    draws.forEach((draw, drawIndex) => {
        const currentPairNumbers = getPairNumbers(draw, pairType);
        if (!currentPairNumbers.isValid) return;
        
        const currentPair = `${Math.min(currentPairNumbers.num1, currentPairNumbers.num2)}-${Math.max(currentPairNumbers.num1, currentPairNumbers.num2)}`;
        
        // Analyze previous draws (stored in the draw object)
        const previousPairs = [];
        for (let i = 1; i <= 8; i++) {
            // Get previous numbers based on pair type
            let prevNum1, prevNum2;
            switch (pairType) {
                case 'first-third':
                    prevNum1 = draw[`sortedPreviousFirst${i}`];
                    prevNum2 = draw[`sortedPreviousThird${i}`];
                    break;
                case 'second-third':
                    prevNum1 = draw[`sortedPreviousSecond${i}`];
                    prevNum2 = draw[`sortedPreviousThird${i}`];
                    break;
                default: // 'first-second'
                    prevNum1 = draw[`sortedPreviousFirst${i}`];
                    prevNum2 = draw[`sortedPreviousSecond${i}`];
            }
            
            if (prevNum1 !== undefined && prevNum2 !== undefined && 
                prevNum1 >= 0 && prevNum1 <= 9 && 
                prevNum2 >= 0 && prevNum2 <= 9) {
                // Track number activity
                const firstActivity = numberActivity.get(prevNum1);
                if (firstActivity) {
                    firstActivity.firstPositionCount++;
                    firstActivity.totalCount++;
                }
                
                const secondActivity = numberActivity.get(prevNum2);
                if (secondActivity) {
                    secondActivity.secondPositionCount++;
                    secondActivity.totalCount++;
                }
                
                // Create pair for transition tracking
                const prevPair = `${Math.min(prevNum1, prevNum2)}-${Math.max(prevNum1, prevNum2)}`;
                previousPairs.push({ pair: prevPair, drawsBack: i });
            }
        }
        
        // Track transitions (what pair preceded current pair)
        if (previousPairs.length > 0) {
            const immediatePrevious = previousPairs[0]; // The most recent previous pair
            if (immediatePrevious) {
                const transitionKey = `${immediatePrevious.pair}→${currentPair}`;
                const count = transitionMatrix.get(transitionKey) || 0;
                transitionMatrix.set(transitionKey, count + 1);
            }
        }
    });
    
    return {
        transitionMatrix,
        numberActivity
    };
};

/**
 * Extract the correct pair of numbers based on pair type
 */
const getPairNumbers = (draw, pairType) => {
    switch (pairType) {
        case 'first-third':
            return {
                num1: draw.sortedFirstNumber,
                num2: draw.sortedThirdNumber,
                isValid: typeof draw.sortedFirstNumber === 'number' &&
                        typeof draw.sortedThirdNumber === 'number' &&
                        draw.sortedFirstNumber >= 0 && draw.sortedFirstNumber <= 9 &&
                        draw.sortedThirdNumber >= 0 && draw.sortedThirdNumber <= 9
            };
        case 'second-third':
            return {
                num1: draw.sortedSecondNumber,
                num2: draw.sortedThirdNumber,
                isValid: typeof draw.sortedSecondNumber === 'number' &&
                        typeof draw.sortedThirdNumber === 'number' &&
                        draw.sortedSecondNumber >= 0 && draw.sortedSecondNumber <= 9 &&
                        draw.sortedThirdNumber >= 0 && draw.sortedThirdNumber <= 9
            };
        default: // 'first-second'
            return {
                num1: draw.sortedFirstNumber,
                num2: draw.sortedSecondNumber,
                isValid: typeof draw.sortedFirstNumber === 'number' &&
                        typeof draw.sortedSecondNumber === 'number' &&
                        draw.sortedFirstNumber >= 0 && draw.sortedFirstNumber <= 9 &&
                        draw.sortedSecondNumber >= 0 && draw.sortedSecondNumber <= 9
            };
    }
};

export async function GET(request) {
    try {
        // Get pair type from query parameters (default to first-second)
        const { searchParams } = new URL(request.url);
        const pairType = searchParams.get('pairType') || 'first-second';
        const firestore = adminDb.firestore();
        
        // Fetch all draws
        console.log(`Fetching all draws for ${pairType} pair analysis...`);
        const snapshot = await firestore
            .collection('draws')
            .orderBy('index', 'desc')
            .get();
        
        console.log(`Analyzing ${snapshot.size} draws...`);
        
        // Track pair frequencies and combination frequencies
        const pairFrequencies = new Map();
        const combinationFrequencies = new Map();
        const validDraws = [];
        let totalValidDraws = 0;
        
        // Process each draw
        snapshot.forEach(doc => {
            const draw = doc.data();
            
            // Get the pair numbers for the selected pair type
            const pairNumbers = getPairNumbers(draw, pairType);
            
            // Only process draws with valid numbers for the selected pair type
            if (pairNumbers.isValid) {
                // Store valid draw for pattern analysis
                validDraws.push(draw);
                
                // Create pair key (always in ascending order for consistency)
                const first = Math.min(pairNumbers.num1, pairNumbers.num2);
                const second = Math.max(pairNumbers.num1, pairNumbers.num2);
                const pairKey = `${first}-${second}`;
                
                // Increment pair frequency
                const currentCount = pairFrequencies.get(pairKey) || 0;
                pairFrequencies.set(pairKey, currentCount + 1);
                
                // Track full combination frequency (always use sorted order)
                const comboKey = `${draw.sortedFirstNumber}-${draw.sortedSecondNumber}-${draw.sortedThirdNumber}`;
                const currentComboCount = combinationFrequencies.get(comboKey) || 0;
                combinationFrequencies.set(comboKey, currentComboCount + 1);
                
                totalValidDraws++;
            }
        });
        
        // Analyze previous patterns
        const patternAnalysis = analyzePreviousPatterns(validDraws, pairType);
        
        console.log(`Found ${pairFrequencies.size} unique pairs in ${totalValidDraws} valid draws`);
        
        // Build result array with all 45 possible pairs
        const pairs = [];
        
        // Generate all possible pairs (0-0 through 8-9)
        for (let i = 0; i <= 9; i++) {
            for (let j = i; j <= 9; j++) {
                const pairKey = `${i}-${j}`;
                const frequency = pairFrequencies.get(pairKey) || 0;
                const percentage = totalValidDraws > 0 ? (frequency / totalValidDraws) * 100 : 0;
                const possibleThirds = calculatePossibilities(i, j, pairType);
                const category = categorizePair(frequency, totalValidDraws);
                
                // Get all combinations that contain this pair in the correct positions
                const combinations = [];
                
                // Check all existing combinations to see if they contain our pair
                for (const [comboKey, comboFreq] of combinationFrequencies) {
                    const parts = comboKey.split('-').map(Number);
                    let matchesPair = false;
                    
                    switch (pairType) {
                        case 'first-second':
                            // Check if first=i and second=j
                            matchesPair = (parts[0] === i && parts[1] === j);
                            break;
                        case 'first-third':
                            // Check if first=i and third=j
                            matchesPair = (parts[0] === i && parts[2] === j);
                            break;
                        case 'second-third':
                            // Check if second=i and third=j
                            matchesPair = (parts[1] === i && parts[2] === j);
                            break;
                    }
                    
                    if (matchesPair) {
                        const comboPercentage = totalValidDraws > 0 ? (comboFreq / totalValidDraws) * 100 : 0;
                        combinations.push({
                            combo: comboKey,
                            numbers: parts,
                            frequency: comboFreq,
                            percentage: comboPercentage
                        });
                    }
                }
                
                // Also add combinations with 0 frequency for completeness
                // Generate all possible combinations for this pair
                for (let k = 0; k <= 9; k++) {
                    let comboKey;
                    switch (pairType) {
                        case 'first-second':
                            if (k >= j) comboKey = `${i}-${j}-${k}`;
                            break;
                        case 'first-third':
                            if (k >= i && k <= j) comboKey = `${i}-${k}-${j}`;
                            break;
                        case 'second-third':
                            if (k <= i) comboKey = `${k}-${i}-${j}`;
                            break;
                    }
                    
                    if (comboKey && !combinations.find(c => c.combo === comboKey)) {
                        combinations.push({
                            combo: comboKey,
                            numbers: comboKey.split('-').map(Number),
                            frequency: 0,
                            percentage: 0
                        });
                    }
                }
                
                // Calculate what pairs preceded this pair
                const predecessors = [];
                for (const [transition, count] of patternAnalysis.transitionMatrix) {
                    if (transition.endsWith(`→${pairKey}`)) {
                        const prevPair = transition.split('→')[0];
                        predecessors.push({
                            pair: prevPair,
                            count: count,
                            percentage: (count / frequency) * 100
                        });
                    }
                }
                predecessors.sort((a, b) => b.count - a.count);
                
                // Get activity levels for the numbers in this pair
                const firstActivity = patternAnalysis.numberActivity.get(i) || { totalCount: 0 };
                const secondActivity = patternAnalysis.numberActivity.get(j) || { totalCount: 0 };
                
                pairs.push({
                    pair: pairKey,
                    first: i,
                    second: j,
                    frequency: frequency,
                    percentage: percentage,
                    possibleThirds: possibleThirds,
                    category: category,
                    isRepeat: i === j,
                    combinations: combinations,
                    previousPatterns: {
                        topPredecessors: predecessors.slice(0, 3),
                        firstNumberActivity: firstActivity.totalCount,
                        secondNumberActivity: secondActivity.totalCount,
                        activityScore: (firstActivity.totalCount + secondActivity.totalCount) / 2
                    }
                });
            }
        }
        
        // Sort pairs by frequency (descending)
        pairs.sort((a, b) => b.frequency - a.frequency);
        
        // Get top and bottom pairs
        const mostFrequent = pairs.slice(0, 10).map(p => ({
            pair: p.pair,
            frequency: p.frequency,
            percentage: p.percentage.toFixed(2),
            possibleThirds: p.possibleThirds
        }));
        
        const leastFrequent = pairs.slice(-10).reverse().map(p => ({
            pair: p.pair,
            frequency: p.frequency,
            percentage: p.percentage.toFixed(2),
            possibleThirds: p.possibleThirds
        }));
        
        // Calculate category summaries
        const categoryStats = {
            high: pairs.filter(p => p.category === 'high').length,
            medium: pairs.filter(p => p.category === 'medium').length,
            low: pairs.filter(p => p.category === 'low').length
        };
        
        // Generate appropriate correlation note based on pair type
        let correlationNote;
        switch (pairType) {
            case 'first-third':
                correlationNote = "In first & third position analysis, pairs that are farthest apart (like 1-8) tend to appear more frequently because they have more possible middle numbers that can fit between them.";
                break;
            case 'second-third':
                correlationNote = "In second & third position analysis, pairs with higher starting second number values tend to appear more frequently because they have more possible first numbers that can precede them.";
                break;
            default: // 'first-second'
                correlationNote = "Higher frequency pairs tend to have more possible third numbers (pair 0-1 has 9 possible third numbers), while lower frequency pairs have fewer options (pair 5-8 has 2 possible third options 5-8-8 and 5-8-9).";
        }
        
        const result = {
            success: true,
            pairType: pairType,
            summary: {
                totalDrawsAnalyzed: totalValidDraws,
                pairsFound: pairFrequencies.size
            },
            pairs: pairs,
            insights: {
                mostFrequent: mostFrequent,
                leastFrequent: leastFrequent,
                categoryStats: categoryStats,
                correlationNote: correlationNote,
            }
        };
        
        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
        
    } catch (error) {
        console.error("Error in pair analysis:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to analyze pairs",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}