// app/api/test/combo/route.js - COMBO draw testing and analysis with cascade subtraction
import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants for clearer code
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
 * Validates if a draw passes all rules
 * Expects numbers to be sorted numerically
 */
const validateDraw = (numbers) => {
    // Rule 1: Must be 3 numbers, each 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return { valid: false, pattern: "INVALID", reason: "Must have exactly 3 numbers" };
    }

    if (numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { valid: false, pattern: "INVALID", reason: "Numbers must be 0-9" };
    }

    // Rule 2: No repeating numbers
    if (new Set(numbers).size !== 3) {
        const pattern = getABPattern(numbers);
        return { valid: false, pattern, reason: "No repeating numbers allowed" };
    }

    // Rule 3: Must be BBA or BAA pattern
    const pattern = getABPattern(numbers);
    if (pattern !== 'BBA' && pattern !== 'BAA') {
        return { valid: false, pattern, reason: `Invalid pattern: ${pattern}` };
    }

    // Rule 4: Check difference based on pattern
    if (pattern === 'BBA') {
        // For BBA: difference between 2nd and 1st number must be ≤ 2
        const diff = numbers[1] - numbers[0];
        if (diff > MAX_ALLOWED_DIFF) {
            return { valid: false, pattern, reason: `BBA difference ${diff} > ${MAX_ALLOWED_DIFF}` };
        }
    } else { // pattern === 'BAA'
        // For BAA: difference between 3rd and 2nd number must be ≤ 2
        const diff = numbers[2] - numbers[1];
        if (diff > MAX_ALLOWED_DIFF) {
            return { valid: false, pattern, reason: `BAA difference ${diff} > ${MAX_ALLOWED_DIFF}` };
        }
    }

    return { valid: true, pattern, reason: "PASS" };
};

/**
 * Analyzes fireball substitutions for a draw
 */
const analyzeFireball = (draw, fireball) => {
    if (isNaN(fireball) || fireball < 0 || fireball > 9) {
        return { hasValidFireball: false, substitutionsPassed: 0, details: [] };
    }

    const mainNumbers = [
        draw.sortedFirstNumber,
        draw.sortedSecondNumber,
        draw.sortedThirdNumber
    ];

    // Try substituting fireball in each position
    const substitutions = [
        [fireball, mainNumbers[1], mainNumbers[2]],
        [mainNumbers[0], fireball, mainNumbers[2]],
        [mainNumbers[0], mainNumbers[1], fireball]
    ];

    let passCount = 0;
    const passDetails = [];

    for (let i = 0; i < substitutions.length; i++) {
        const sorted = [...substitutions[i]].sort((a, b) => a - b);
        const result = validateDraw(sorted);

        if (result.valid) {
            passCount++;
            passDetails.push({
                position: i + 1,
                substitution: substitutions[i],
                sorted,
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
 * Main API handler
 */
export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Fetch draws ordered by index (newest first)
        const snapshot = await firestore
            .collection("draws")
            .orderBy('index', 'desc')
            .get();

        // Process draws
        const stats = {
            totalFetched: snapshot.size,
            validDraws: 0,
            uniqueNumberDraws: 0,
            patterns: { BBB: 0, BBA: 0, BAA: 0, AAA: 0 },
            passedMainDraw: 0,
            passedWithFireball: 0,
            bbaDifferences: {},
            baaDifferences: {},
            bbaPassCount: 0,
            baaPassCount: 0,
            fireballStats: {
                drawsWithFireball: 0,
                totalSubstitutionsPassed: 0,
                bbaFromFireball: 0,
                baaFromFireball: 0
            },
            // New cascade analysis
            cascadeAnalysis: {
                finalNumbers: {
                    0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
                    5: 0, 6: 0, 7: 0, 8: 0, 9: 0
                },
                byPattern: {
                    BBB: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                    BBA: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                    BAA: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
                    AAA: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
                },
                passingDrawsOnly: {
                    0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
                    5: 0, 6: 0, 7: 0, 8: 0, 9: 0
                },
                examples: [] // Store some examples for verification
            }
        };

        snapshot.forEach((doc) => {
            const draw = doc.data();

            // Validate required fields
            if (typeof draw.sortedFirstNumber !== 'number' ||
                typeof draw.sortedSecondNumber !== 'number' ||
                typeof draw.sortedThirdNumber !== 'number') {
                console.warn(`Skipping draw ${doc.id}: invalid number fields`);
                return;
            }

            stats.validDraws++;

            const numbers = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            // Calculate cascade number for this draw
            const cascadeNumber = calculateCascadeNumber(numbers);
            if (cascadeNumber !== null) {
                stats.cascadeAnalysis.finalNumbers[cascadeNumber]++;

                // Store first 10 examples for verification
                if (stats.cascadeAnalysis.examples.length < 10) {
                    const diff1 = Math.abs(numbers[0] - numbers[1]);
                    const diff2 = Math.abs(numbers[1] - numbers[2]);
                    stats.cascadeAnalysis.examples.push({
                        numbers: numbers.join('-'),
                        calculation: `|${numbers[0]}-${numbers[1]}|=${diff1}, |${numbers[1]}-${numbers[2]}|=${diff2}, |${diff1}-${diff2}|=${cascadeNumber}`,
                        finalNumber: cascadeNumber
                    });
                }
            }

            // Check uniqueness
            if (new Set(numbers).size === 3) {
                stats.uniqueNumberDraws++;

                // Get pattern and update counts
                const pattern = getABPattern(numbers);
                if (stats.patterns[pattern] !== undefined) {
                    stats.patterns[pattern]++;
                }

                // Track cascade by pattern
                if (cascadeNumber !== null && stats.cascadeAnalysis.byPattern[pattern]) {
                    stats.cascadeAnalysis.byPattern[pattern][cascadeNumber]++;
                }

                // Track differences for BBA and BAA
                if (pattern === 'BBA') {
                    const diff = numbers[1] - numbers[0];
                    stats.bbaDifferences[diff] = (stats.bbaDifferences[diff] || 0) + 1;
                    if (diff <= MAX_ALLOWED_DIFF) {
                        stats.bbaPassCount++;
                    }
                } else if (pattern === 'BAA') {
                    const diff = numbers[2] - numbers[1];
                    stats.baaDifferences[diff] = (stats.baaDifferences[diff] || 0) + 1;
                    if (diff <= MAX_ALLOWED_DIFF) {
                        stats.baaPassCount++;
                    }
                }
            }

            // Validate main draw
            const mainResult = validateDraw(numbers);
            if (mainResult.valid) {
                stats.passedMainDraw++;
                // Track cascade for passing draws only
                if (cascadeNumber !== null) {
                    stats.cascadeAnalysis.passingDrawsOnly[cascadeNumber]++;
                }
            }

            // Analyze fireball if present
            if (typeof draw.fireball === 'number') {
                const fireballAnalysis = analyzeFireball(draw, draw.fireball);

                if (fireballAnalysis.hasValidFireball) {
                    stats.passedWithFireball++;
                    stats.fireballStats.drawsWithFireball++;
                    stats.fireballStats.totalSubstitutionsPassed += fireballAnalysis.substitutionsPassed;

                    // Count patterns from fireball passes
                    fireballAnalysis.details.forEach(detail => {
                        if (detail.pattern === 'BBA') {
                            stats.fireballStats.bbaFromFireball++;
                        } else if (detail.pattern === 'BAA') {
                            stats.fireballStats.baaFromFireball++;
                        }
                    });
                }
            }
        });

        // Calculate percentages
        const calculatePercentage = (count, total) =>
            total > 0 ? (count / total) * 100 : 0;

        // Calculate cascade percentages
        const cascadePercentages = {};
        const cascadeByPatternPercentages = {};
        const cascadePassingOnlyPercentages = {};

        for (let i = 0; i <= 9; i++) {
            cascadePercentages[i] = calculatePercentage(
                stats.cascadeAnalysis.finalNumbers[i],
                stats.validDraws
            );
            cascadePassingOnlyPercentages[i] = calculatePercentage(
                stats.cascadeAnalysis.passingDrawsOnly[i],
                stats.passedMainDraw
            );
        }

        // Calculate pattern-specific cascade percentages
        for (const pattern of ['BBB', 'BBA', 'BAA', 'AAA']) {
            cascadeByPatternPercentages[pattern] = {};
            const patternTotal = Object.values(stats.cascadeAnalysis.byPattern[pattern]).reduce((a, b) => a + b, 0);
            for (let i = 0; i <= 9; i++) {
                cascadeByPatternPercentages[pattern][i] = calculatePercentage(
                    stats.cascadeAnalysis.byPattern[pattern][i],
                    patternTotal
                );
            }
        }

        const result = {
            summary: {
                totalDrawsFetched: stats.totalFetched,
                validDrawsProcessed: stats.validDraws,
                uniqueNumberDraws: stats.uniqueNumberDraws
            },
            patterns: {
                counts: stats.patterns,
                percentages: {
                    BBB: calculatePercentage(stats.patterns.BBB, stats.validDraws),
                    BBA: calculatePercentage(stats.patterns.BBA, stats.validDraws),
                    BAA: calculatePercentage(stats.patterns.BAA, stats.validDraws),
                    AAA: calculatePercentage(stats.patterns.AAA, stats.validDraws)
                }
            },
            differences: {
                bba: {
                    distribution: stats.bbaDifferences,
                    passCount: stats.bbaPassCount,
                    passPercentage: calculatePercentage(stats.bbaPassCount, stats.validDraws)
                },
                baa: {
                    distribution: stats.baaDifferences,
                    passCount: stats.baaPassCount,
                    passPercentage: calculatePercentage(stats.baaPassCount, stats.validDraws)
                }
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
                patternBreakdown: {
                    BBA: stats.fireballStats.bbaFromFireball,
                    BAA: stats.fireballStats.baaFromFireball
                }
            },
            // New cascade analysis results
            cascadeAnalysis: {
                finalNumberDistribution: {
                    counts: stats.cascadeAnalysis.finalNumbers,
                    percentages: cascadePercentages
                },
                byPattern: {
                    counts: stats.cascadeAnalysis.byPattern,
                    percentages: cascadeByPatternPercentages
                },
                passingDrawsOnly: {
                    counts: stats.cascadeAnalysis.passingDrawsOnly,
                    percentages: cascadePassingOnlyPercentages
                },
                examples: stats.cascadeAnalysis.examples
            }
        };

        console.log("Analysis Result:", JSON.stringify(result, null, 2)); // For server-side logging if needed
        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (error) {
        console.error("Error in API route:", error);
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