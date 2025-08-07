// app/api/pair-analysis/route.js - Analyze first-two number pair frequencies
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants for categorization
const CATEGORY_B_MAX = 4; // Numbers 0-4 are category 'B'
const MAX_ALLOWED_DIFF = 2; // Maximum allowed difference for passing draws

/**
 * Categorizes a number as 'A' or 'B'
 * B: 0-4, A: 5-9
 */
const getCategory = (num) => num <= CATEGORY_B_MAX ? 'B' : 'A';

/**
 * Gets the A/B pattern for a set of three numbers
 */
const getABPattern = (numbers) => {
    const categories = numbers.map(getCategory);
    const bCount = categories.filter(cat => cat === 'B').length;
    const aCount = categories.filter(cat => cat === 'A').length;
    
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
    // Must be 3 unique numbers
    if (new Set(numbers).size !== 3) return false;
    
    // Sort for analysis
    const sorted = [...numbers].sort((a, b) => a - b);
    const pattern = getABPattern(sorted);
    
    // Only BBA and BAA patterns are valid for COMBO
    if (pattern === 'BBA') {
        // For BBA: difference between 2nd and 1st B number must be ≤ 2
        const bNumbers = sorted.filter(n => n <= CATEGORY_B_MAX);
        if (bNumbers.length >= 2) {
            const diff = bNumbers[1] - bNumbers[0];
            return diff <= MAX_ALLOWED_DIFF;
        }
    } else if (pattern === 'BAA') {
        // For BAA: difference between 2nd and 1st A number must be ≤ 2
        const aNumbers = sorted.filter(n => n > CATEGORY_B_MAX);
        if (aNumbers.length >= 2) {
            const diff = aNumbers[1] - aNumbers[0];
            return diff <= MAX_ALLOWED_DIFF;
        }
    }
    
    return false;
};

/**
 * Calculate how many valid third numbers can complete a pair
 * Since draws are sorted, third number must be >= second number
 * Including repeat numbers
 */
const calculatePossibleThirds = (first, second) => {
    let possibleCount = 0;
    
    // Third number must be >= second number (sorted constraint)
    // Including repeats
    for (let i = second; i <= 9; i++) {
        possibleCount++;
    }
    
    return possibleCount;
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
const analyzePreviousPatterns = (draws) => {
    const transitionMatrix = new Map(); // tracks pair -> next pair transitions
    const numberActivity = new Map(); // tracks how often each number appears in recent history
    const numberRecentDraws = new Map(); // tracks recent draws per number
    
    // Initialize tracking for each number
    for (let i = 0; i <= 9; i++) {
        numberActivity.set(i, {
            firstPositionCount: 0,
            secondPositionCount: 0,
            totalCount: 0
        });
        numberRecentDraws.set(i, new Set()); // Use Set to track unique draws
    }
    
    // Process each draw with its previous data
    draws.forEach((draw, drawIndex) => {
        if (draw.sortedFirstNumber === undefined || draw.sortedSecondNumber === undefined) return;
        
        const currentPair = `${Math.min(draw.sortedFirstNumber, draw.sortedSecondNumber)}-${Math.max(draw.sortedFirstNumber, draw.sortedSecondNumber)}`;
        
        // Analyze previous draws (stored in the draw object)
        const previousPairs = [];
        for (let i = 1; i <= 8; i++) {
            const prevFirst = draw[`sortedPreviousFirst${i}`];
            const prevSecond = draw[`sortedPreviousSecond${i}`];
            
            if (prevFirst !== undefined && prevSecond !== undefined && 
                prevFirst >= 0 && prevFirst <= 9 && 
                prevSecond >= 0 && prevSecond <= 9) {
                // Track number activity
                const firstActivity = numberActivity.get(prevFirst);
                if (firstActivity) {
                    firstActivity.firstPositionCount++;
                    firstActivity.totalCount++;
                }
                
                const secondActivity = numberActivity.get(prevSecond);
                if (secondActivity) {
                    secondActivity.secondPositionCount++;
                    secondActivity.totalCount++;
                }
                
                // Track recent draws (only last 4 draws)
                if (i <= 4) {
                    const firstRecentSet = numberRecentDraws.get(prevFirst);
                    const secondRecentSet = numberRecentDraws.get(prevSecond);
                    if (firstRecentSet) firstRecentSet.add(drawIndex);
                    if (secondRecentSet) secondRecentSet.add(drawIndex);
                }
                
                // Create pair for transition tracking
                const prevPair = `${Math.min(prevFirst, prevSecond)}-${Math.max(prevFirst, prevSecond)}`;
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
        numberActivity,
        numberRecentDraws
    };
};

export async function GET() {
    try {
        const firestore = adminDb.firestore();
        
        // Fetch all draws
        console.log('Fetching all draws for pair analysis...');
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
            
            // Only process draws with valid sorted numbers
            if (typeof draw.sortedFirstNumber === 'number' &&
                typeof draw.sortedSecondNumber === 'number' &&
                typeof draw.sortedThirdNumber === 'number' &&
                draw.sortedFirstNumber >= 0 && draw.sortedFirstNumber <= 9 &&
                draw.sortedSecondNumber >= 0 && draw.sortedSecondNumber <= 9 &&
                draw.sortedThirdNumber >= 0 && draw.sortedThirdNumber <= 9) {
                
                // Store valid draw for pattern analysis
                validDraws.push(draw);
                
                // Create pair key (always in ascending order for consistency)
                const first = Math.min(draw.sortedFirstNumber, draw.sortedSecondNumber);
                const second = Math.max(draw.sortedFirstNumber, draw.sortedSecondNumber);
                const pairKey = `${first}-${second}`;
                
                // Increment pair frequency
                const currentCount = pairFrequencies.get(pairKey) || 0;
                pairFrequencies.set(pairKey, currentCount + 1);
                
                // Track full combination frequency
                const comboKey = `${draw.sortedFirstNumber}-${draw.sortedSecondNumber}-${draw.sortedThirdNumber}`;
                const currentComboCount = combinationFrequencies.get(comboKey) || 0;
                combinationFrequencies.set(comboKey, currentComboCount + 1);
                
                totalValidDraws++;
            }
        });
        
        // Analyze previous patterns
        const patternAnalysis = analyzePreviousPatterns(validDraws);
        
        console.log(`Found ${pairFrequencies.size} unique pairs in ${totalValidDraws} valid draws`);
        
        // Build result array with all 45 possible pairs
        const pairs = [];
        
        // Generate all possible pairs (0-0 through 8-9)
        for (let i = 0; i <= 9; i++) {
            for (let j = i; j <= 9; j++) {
                const pairKey = `${i}-${j}`;
                const frequency = pairFrequencies.get(pairKey) || 0;
                const percentage = totalValidDraws > 0 ? (frequency / totalValidDraws) * 100 : 0;
                const possibleThirds = calculatePossibleThirds(i, j);
                const category = categorizePair(frequency, totalValidDraws);
                
                // Get all combinations for this pair
                const combinations = [];
                for (let third = j; third <= 9; third++) {
                    const comboKey = `${i}-${j}-${third}`;
                    const comboFreq = combinationFrequencies.get(comboKey) || 0;
                    const comboPercentage = totalValidDraws > 0 ? (comboFreq / totalValidDraws) * 100 : 0;
                    
                    combinations.push({
                        combo: comboKey,
                        numbers: [i, j, third],
                        frequency: comboFreq,
                        percentage: comboPercentage
                    });
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
        
        // Calculate correlation insights
        const correlationData = pairs.map(p => ({
            possibleThirds: p.possibleThirds,
            frequency: p.frequency
        }));
        
        // Group by possible thirds to show pattern
        const patternByThirds = {};
        for (let i = 1; i <= 9; i++) {
            const pairsWithThisCount = pairs.filter(p => p.possibleThirds === i);
            if (pairsWithThisCount.length > 0) {
                patternByThirds[i] = {
                    avgFrequency: pairsWithThisCount.reduce((sum, p) => sum + p.frequency, 0) / pairsWithThisCount.length,
                    pairs: pairsWithThisCount.map(p => p.pair)
                };
            }
        }
        
        // Calculate hot/cold numbers based on recent activity
        const hotColdAnalysis = [];
        const totalDrawsAnalyzed = validDraws.length;
        
        for (let i = 0; i <= 9; i++) {
            const activity = patternAnalysis.numberActivity.get(i);
            const recentDrawsSet = patternAnalysis.numberRecentDraws.get(i);
            const recentCount = recentDrawsSet ? recentDrawsSet.size : 0;
            
            // Calculate percentage of recent draws containing this number
            const recentPercentage = totalDrawsAnalyzed > 0 ? (recentCount / totalDrawsAnalyzed) * 100 : 0;
            
            // Determine temperature based on percentage of recent draws
            let temperature;
            if (recentPercentage >= 50) temperature = 'hot';      // Appears in 50%+ of recent draws
            else if (recentPercentage >= 25) temperature = 'warm'; // Appears in 25-49% of recent draws
            else if (recentPercentage >= 10) temperature = 'cool'; // Appears in 10-24% of recent draws
            else temperature = 'cold';                              // Appears in <10% of recent draws
            
            hotColdAnalysis.push({
                number: i,
                totalAppearances: activity.totalCount,
                recentAppearances: recentCount,
                recentPercentage: recentPercentage.toFixed(1),
                firstPositionCount: activity.firstPositionCount,
                secondPositionCount: activity.secondPositionCount,
                temperature: temperature
            });
        }
        hotColdAnalysis.sort((a, b) => b.recentAppearances - a.recentAppearances);
        
        const result = {
            success: true,
            summary: {
                totalDrawsAnalyzed: totalValidDraws,
                totalUniquePairs: 45,
                pairsFound: pairFrequencies.size,
                analysisDate: new Date().toISOString()
            },
            pairs: pairs,
            insights: {
                mostFrequent: mostFrequent,
                leastFrequent: leastFrequent,
                categoryStats: categoryStats,
                patternByThirds: patternByThirds,
                correlationNote: "Higher frequency pairs tend to have more possible third numbers (7-9 options), while lower frequency pairs have fewer options (1-3).",
                hotColdNumbers: {
                    hot: hotColdAnalysis.filter(n => n.temperature === 'hot'),
                    warm: hotColdAnalysis.filter(n => n.temperature === 'warm'),
                    cool: hotColdAnalysis.filter(n => n.temperature === 'cool'),
                    cold: hotColdAnalysis.filter(n => n.temperature === 'cold')
                },
                transitionInsights: {
                    totalTransitions: patternAnalysis.transitionMatrix.size,
                    mostCommonTransitions: Array.from(patternAnalysis.transitionMatrix.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([transition, count]) => ({
                            from: transition.split('→')[0],
                            to: transition.split('→')[1],
                            count: count
                        }))
                }
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