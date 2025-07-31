// app/api/test/straight/route.js - STRAIGHT draw testing and analysis
import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants for clearer code
const CATEGORY_B_MAX = 4; // Numbers 0-4 are category 'B'
const MAX_ALLOWED_DIFF = 2; // Maximum allowed difference for passing draws

/**
 * Categorizes a number as 'A' or 'B'
 * B: 0-4, A: 5-9
 */
const getCategory = (num) => num <= CATEGORY_B_MAX ? 'B' : 'A';

/**
 * Gets the A/B pattern for ordered numbers (e.g., "BBA", "BAB", etc.)
 * For STRAIGHT bets, order matters!
 */
const getOrderedPattern = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return "INVALID_INPUT";
    }

    return numbers.map(getCategory).join('');
};

/**
 * Finds positions of matching categories for difference checking
 * Returns array of position pairs that have the same category
 */
const getMatchingCategoryPositions = (pattern) => {
    const positions = [];

    // Find all pairs of positions with the same category
    for (let i = 0; i < pattern.length; i++) {
        for (let j = i + 1; j < pattern.length; j++) {
            if (pattern[i] === pattern[j]) {
                positions.push([i, j]);
            }
        }
    }

    return positions;
};

/**
 * Validates if a STRAIGHT draw passes all rules
 * Numbers are in original order (not sorted)
 */
const validateStraightDraw = (numbers) => {
    // Rule 1: Must be 3 numbers, each 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return { valid: false, pattern: "INVALID", reason: "Must have exactly 3 numbers" };
    }

    if (numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { valid: false, pattern: "INVALID", reason: "Numbers must be 0-9" };
    }

    // Rule 2: No repeating numbers
    if (new Set(numbers).size !== 3) {
        const pattern = getOrderedPattern(numbers);
        return { valid: false, pattern, reason: "No repeating numbers allowed" };
    }

    // Get pattern
    const pattern = getOrderedPattern(numbers);

    // Rule 3: Check which patterns we consider valid
    // For now, let's consider patterns with 2:1 ratio (similar to COMBO)
    const validPatterns = ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'];
    if (!validPatterns.includes(pattern)) {
        return { valid: false, pattern, reason: `Pattern ${pattern} not in valid set` };
    }

    // Rule 4: Check difference between matching category positions
    const matchingPositions = getMatchingCategoryPositions(pattern);

    // For patterns with 2 of the same category, check their difference
    if (matchingPositions.length === 1) {
        const [pos1, pos2] = matchingPositions[0];
        const diff = Math.abs(numbers[pos1] - numbers[pos2]);

        if (diff > MAX_ALLOWED_DIFF) {
            return {
                valid: false,
                pattern,
                reason: `Difference between matching ${pattern[pos1]} numbers (${numbers[pos1]}, ${numbers[pos2]}) is ${diff} > ${MAX_ALLOWED_DIFF}`
            };
        }
    }

    return { valid: true, pattern, reason: "PASS" };
};

/**
 * Analyzes fireball substitutions for STRAIGHT bets
 */
const analyzeStraightFireball = (draw, fireball) => {
    if (isNaN(fireball) || fireball < 0 || fireball > 9) {
        return { hasValidFireball: false, substitutionsPassed: 0, details: [] };
    }

    const originalNumbers = [
        draw.originalFirstNumber,
        draw.originalSecondNumber,
        draw.originalThirdNumber
    ];

    // Try substituting fireball in each position (order matters!)
    const substitutions = [
        [fireball, originalNumbers[1], originalNumbers[2]],
        [originalNumbers[0], fireball, originalNumbers[2]],
        [originalNumbers[0], originalNumbers[1], fireball]
    ];

    let passCount = 0;
    const passDetails = [];

    for (let i = 0; i < substitutions.length; i++) {
        const result = validateStraightDraw(substitutions[i]);

        if (result.valid) {
            passCount++;
            passDetails.push({
                position: i + 1,
                substitution: substitutions[i],
                pattern: result.pattern
            });
        }
    }

    return {
        hasValidFireball: passCount > 0,
        substitutionsPassed: passCount,
        details: passDetails
    };
};

/**
 * Main API handler for STRAIGHT bet analysis
 */
export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Fetch draws ordered by index (newest first)
        const snapshot = await firestore
            .collection("draws")
            .orderBy('index', 'desc')
            .get();

        // Process draws for STRAIGHT analysis
        const stats = {
            totalFetched: snapshot.size,
            validDraws: 0,
            uniqueNumberDraws: 0,
            patterns: {
                // All 8 possible patterns
                BBB: 0, BBA: 0, BAB: 0, ABB: 0,
                BAA: 0, ABA: 0, AAB: 0, AAA: 0
            },
            patternDifferences: {
                // Track differences for each 2:1 pattern
                BBA: {}, BAB: {}, ABB: {},
                BAA: {}, ABA: {}, AAB: {}
            },
            patternPassCounts: {
                BBA: 0, BAB: 0, ABB: 0,
                BAA: 0, ABA: 0, AAB: 0
            },
            passedMainDraw: 0,
            passedWithFireball: 0,
            fireballStats: {
                drawsWithFireball: 0,
                totalSubstitutionsPassed: 0,
                patternBreakdown: {}
            }
        };

        // Initialize fireball pattern breakdown
        ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'].forEach(pattern => {
            stats.fireballStats.patternBreakdown[pattern] = 0;
        });

        snapshot.forEach((doc) => {
            const draw = doc.data();

            // Validate required fields - using ORIGINAL order
            if (typeof draw.originalFirstNumber !== 'number' ||
                typeof draw.originalSecondNumber !== 'number' ||
                typeof draw.originalThirdNumber !== 'number') {
                console.warn(`Skipping draw ${doc.id}: invalid number fields`);
                return;
            }

            stats.validDraws++;

            const numbers = [
                draw.originalFirstNumber,
                draw.originalSecondNumber,
                draw.originalThirdNumber
            ];

            // Check uniqueness
            if (new Set(numbers).size === 3) {
                stats.uniqueNumberDraws++;

                // Get pattern and update counts
                const pattern = getOrderedPattern(numbers);
                if (stats.patterns[pattern] !== undefined) {
                    stats.patterns[pattern]++;
                }

                // Track differences for 2:1 patterns
                if (stats.patternDifferences[pattern]) {
                    const matchingPositions = getMatchingCategoryPositions(pattern);
                    if (matchingPositions.length === 1) {
                        const [pos1, pos2] = matchingPositions[0];
                        const diff = Math.abs(numbers[pos1] - numbers[pos2]);

                        stats.patternDifferences[pattern][diff] =
                            (stats.patternDifferences[pattern][diff] || 0) + 1;

                        if (diff <= MAX_ALLOWED_DIFF) {
                            stats.patternPassCounts[pattern]++;
                        }
                    }
                }
            }

            // Validate main draw
            const mainResult = validateStraightDraw(numbers);
            if (mainResult.valid) {
                stats.passedMainDraw++;
            }

            // Analyze fireball if present
            if (typeof draw.fireball === 'number') {
                const fireballAnalysis = analyzeStraightFireball(draw, draw.fireball);

                if (fireballAnalysis.hasValidFireball) {
                    stats.passedWithFireball++;
                    stats.fireballStats.drawsWithFireball++;
                    stats.fireballStats.totalSubstitutionsPassed += fireballAnalysis.substitutionsPassed;

                    // Count patterns from fireball passes
                    fireballAnalysis.details.forEach(detail => {
                        if (stats.fireballStats.patternBreakdown[detail.pattern] !== undefined) {
                            stats.fireballStats.patternBreakdown[detail.pattern]++;
                        }
                    });
                }
            }
        });

        // Calculate percentages
        const calculatePercentage = (count, total) =>
            total > 0 ? (count / total) * 100 : 0;

        // Build pattern percentages
        const patternPercentages = {};
        Object.keys(stats.patterns).forEach(pattern => {
            patternPercentages[pattern] = calculatePercentage(stats.patterns[pattern], stats.uniqueNumberDraws);
        });

        // Build pattern pass percentages
        const patternPassPercentages = {};
        Object.keys(stats.patternPassCounts).forEach(pattern => {
            patternPassPercentages[pattern] = calculatePercentage(
                stats.patternPassCounts[pattern],
                stats.patterns[pattern] || 1
            );
        });

        const result = {
            summary: {
                totalDrawsFetched: stats.totalFetched,
                validDrawsProcessed: stats.validDraws,
                uniqueNumberDraws: stats.uniqueNumberDraws
            },
            patterns: {
                counts: stats.patterns,
                percentages: patternPercentages,
                // Group by pattern type for analysis
                byRatio: {
                    'all_same': {
                        BBB: stats.patterns.BBB,
                        AAA: stats.patterns.AAA
                    },
                    'two_one_mix': {
                        BBA: stats.patterns.BBA,
                        BAB: stats.patterns.BAB,
                        ABB: stats.patterns.ABB,
                        BAA: stats.patterns.BAA,
                        ABA: stats.patterns.ABA,
                        AAB: stats.patterns.AAB
                    }
                }
            },
            differences: stats.patternDifferences,
            patternPassAnalysis: {
                counts: stats.patternPassCounts,
                percentages: patternPassPercentages
            },
            validation: {
                mainDrawPasses: stats.passedMainDraw,
                mainDrawPassPercentage: calculatePercentage(stats.passedMainDraw, stats.validDraws),
                fireballPasses: stats.passedWithFireball,
                fireballPassPercentage: calculatePercentage(stats.passedWithFireball, stats.validDraws)
            },
            fireballAnalysis: {
                drawsWithValidFireball: stats.fireballStats.drawsWithFireball,
                totalSubstitutionsPassed: stats.fireballStats.totalSubstitutionsPassed,
                patternBreakdown: stats.fireballStats.patternBreakdown
            }
        };

        console.log("Straight Bet Analysis Result:", JSON.stringify(result, null, 2));

        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (error) {
        console.error("Error in STRAIGHT analysis route:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}