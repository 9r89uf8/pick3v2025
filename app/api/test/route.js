// app/api/test/route.js
import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Helper function to get A/B Distribution ---
// Assumes numbers are single digits (0-9) if called after validation.
const getABDistribution = (numbers) => {
    // This function is called by isDrawPassing. Initial validation (length, isNaN, range) happens in isDrawPassing.
    if (!Array.isArray(numbers) || numbers.length !== 3) { // Basic check
        return "INVALID_INPUT_FORMAT";
    }

    let countB = 0; // Numbers 0-4
    let countA = 0; // Numbers 5-9
    for (const num of numbers) {
        if (isNaN(num)) return "CONTAINS_NAN"; // Should be caught by isDrawPassing
        if (num >= 0 && num <= 4) countB++;
        else if (num >= 5 && num <= 9) countA++;
        else return "NUM_OUT_OF_RANGE"; // e.g. 10, -1. Should be caught by isDrawPassing
    }

    if (countB + countA !== 3) return "INVALID_COUNTS"; // If numbers were out of range and not caught

    if (countB === 3) return "BBB";
    if (countB === 2 && countA === 1) return "BBA";
    if (countB === 1 && countA === 2) return "BAA";
    if (countA === 3) return "AAA";

    return "UNKNOWN_DIST_LOGIC"; // Should ideally not be reached
};

// --- Helper function to validate draw based on all rules ---
// This function expects the 'numbers' array to be numerically sorted.
const isDrawPassing = (numbers) => {
    // Validate numbers: must be 3 numbers, each a digit from 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { passing: false, abPattern: "INVALID_NUMS", reason: "Numbers must be 3 digits (0-9)." };
    }

    // Rule 1: No repeating numbers
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
        // Get A/B pattern even for repeating numbers for display purposes
        const patternForRepeating = getABDistribution([...numbers]); // Use a copy for getABDistribution
        return { passing: false, abPattern: patternForRepeating, reason: "REPEATING_NUMBERS" };
    }

    // At this point, numbers are unique and sorted.
    const abPattern = getABDistribution(numbers);

    // Rule 2: Distribution must be 'BBA' or 'BAA'
    if (abPattern !== "BBA" && abPattern !== "BAA") {
        let reasonText = `DISTRIBUTION_NOT_TARGET (${abPattern})`;
        if (["AAA", "BBB"].includes(abPattern)) {
            reasonText = `Non-target distribution: ${abPattern}`;
        } else if (abPattern === "INVALID_INPUT_FORMAT" || abPattern === "CONTAINS_NAN" || abPattern === "NUM_OUT_OF_RANGE" || abPattern === "UNKNOWN_DIST_LOGIC") {
            reasonText = `Internal A/B calc issue: ${abPattern}`;
        }
        return { passing: false, abPattern: abPattern, reason: reasonText };
    }

    // Rule 3 & 4: Difference checks for BBA or BAA
    // 'numbers' array is assumed to be numerically sorted here.
    // The difference checks are applied to these numerically sorted numbers.
    if (abPattern === "BBA") {
        // Difference between the second and first number must be 2 or less
        if (Math.abs(numbers[1] - numbers[0]) <= 2) {
            return { passing: true, abPattern: "BBA", reason: "PASS" };
        } else {
            return { passing: false, abPattern: "BBA", reason: "BBA_SPREAD_FAIL" };
        }
    }

    if (abPattern === "BAA") {
        // Difference between the third and second number must be 2 or less
        if (Math.abs(numbers[2] - numbers[1]) <= 2) {
            return { passing: true, abPattern: "BAA", reason: "PASS" };
        } else {
            return { passing: false, abPattern: "BAA", reason: "BAA_SPREAD_FAIL" };
        }
    }

    // Fallback, should not be reached if logic is correct
    return { passing: false, abPattern: (abPattern || "UNKNOWN"), reason: "UNHANDLED_VALIDATION_PATH" };
};

/**
 * API Route to fetch draws from Firestore.
 * It counts unique number draws, their A/B distributions,
 * calculates the percentage of total processed draws for each unique distribution,
 * counts specific differences for BBA and BAA distributions,
 * counts draws with differences of 2 or less for BBA and BAA,
 * and now includes fireball analysis similar to create/route.js.
 */
export async function GET() {
    try {
        // Initialize Firestore admin instance
        const firestore = adminDb.firestore();

        // Reference to the 'draws' collection, ordered by 'index' descending
        const drawsCollection = firestore
            .collection("draws")
            // .where('year', '==', '2025') // Example filter, uncomment and modify as needed
            // .where("drawMonth", "==", 'Mar') // Example filter, uncomment and modify as needed
            .orderBy('index', 'desc'); // Fetches draws, newest first based on index

        // Get the snapshot of the draws collection
        const snapshot = await drawsCollection.get();
        const draws = []; // Array to hold valid draw data

        // Iterate over each document in the snapshot
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            // --- Data Validation ---
            // Ensure all required number fields are present and are numbers
            if (typeof drawData.sortedFirstNumber === 'number' &&
                typeof drawData.sortedSecondNumber === 'number' &&
                typeof drawData.sortedThirdNumber === 'number') {
                draws.push({
                    id: doc.id,
                    ...drawData
                });
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing or invalid number fields.`);
            }
        });

        // --- Analysis ---
        let uniqueNumberDrawsCount = 0;

        let countBBB = 0;
        let countBBA = 0;
        let countBAA = 0;
        let countAAA = 0;

        // Initialize objects to store counts of differences for BBA and BAA distributions
        const bbaDifferenceCounts = {}; // Stores { difference: count } for BBA
        const baaDifferenceCounts = {}; // Stores { difference: count } for BAA

        // Initialize counters for differences of 2 or less
        let bbaDifferenceTwoOrLessCount = 0;
        let baaDifferenceTwoOrLessCount = 0;

        // Initialize counts for passing the new rules
        let totalPassedNewRules = 0;
        let totalFireballPassedNewRules = 0;

        // New detailed fireball tracking
        let totalFireballSubstitutionsPassed = 0; // Total substitutions that passed across all draws
        let totalFireballSubstitutionsChecked = 0; // Total substitutions checked across all draws
        let drawsWithAtLeastOneFireballPass = 0; // Draws that had at least one passing substitution
        let fireballBBACount = 0; // Count of fireball substitutions that resulted in BBA
        let fireballBAACount = 0; // Count of fireball substitutions that resulted in BAA
        let drawsWithFireball = 0; // Count of draws that have a valid fireball number

        // Loop through all fetched and validated draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let nums = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            // Check if all three numbers in the draw are unique
            const uniqueNums = new Set(nums);
            if (uniqueNums.size === nums.length) {
                uniqueNumberDrawsCount++; // Increment count of draws with unique numbers

                let countA_inDraw = 0; // Count of 'A' numbers (num > 4) in the current draw
                let countB_inDraw = 0; // Count of 'B' numbers (num <= 4) in the current draw

                // Determine A/B category for each number in the draw
                for (const num of nums) {
                    if (num <= 4) { // 'B' numbers are 0, 1, 2, 3, 4
                        countB_inDraw++;
                    } else { // 'A' numbers are 5, 6, 7, 8, 9
                        countA_inDraw++;
                    }
                }

                // Categorize the draw based on A/B counts and calculate differences
                if (countB_inDraw === 3) { // BBB distribution (e.g., 1,2,3)
                    countBBB++;
                } else if (countB_inDraw === 2 && countA_inDraw === 1) { // BBA distribution (e.g., 1,2,5)
                    countBBA++;
                    // sortedFirstNum and sortedSecondNum are 'B', sortedThirdNum is 'A'
                    // Calculate difference between the two 'B' numbers (sortedSecondNumber - sortedFirstNumber)
                    const difference = draw.sortedSecondNumber - draw.sortedFirstNumber;
                    bbaDifferenceCounts[difference] = (bbaDifferenceCounts[difference] || 0) + 1;
                    // Check if the difference is 2 or less
                    if (difference <= 2) {
                        bbaDifferenceTwoOrLessCount++;
                    }
                } else if (countB_inDraw === 1 && countA_inDraw === 2) { // BAA distribution (e.g., 1,5,6)
                    countBAA++;
                    // sortedFirstNum is 'B', sortedSecondNum and sortedThirdNum are 'A'
                    // Calculate difference between the two 'A' numbers (sortedThirdNumber - sortedSecondNumber)
                    const difference = draw.sortedThirdNumber - draw.sortedSecondNumber;
                    baaDifferenceCounts[difference] = (baaDifferenceCounts[difference] || 0) + 1;
                    // Check if the difference is 2 or less
                    if (difference <= 2) {
                        baaDifferenceTwoOrLessCount++;
                    }
                } else if (countA_inDraw === 3) { // AAA distribution (e.g., 5,6,7)
                    countAAA++;
                }
            }

            // ---------- NEW CODE: Validate draws using the new rules ----------
            const mainDrawNumbers = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            // Validate main draw numbers against new rules
            const mainDrawOutcome = isDrawPassing(mainDrawNumbers);
            if (mainDrawOutcome.passing) {
                totalPassedNewRules++;
            }

            // Fireball validation with detailed tracking
            let isValidFireballNewRules = false;
            let fireballPassCount = 0; // Track how many substitutions pass for this draw
            let fireballPassDetails = []; // Track details of each passing substitution
            const fb = Number(draw.fireball);

            if (!isNaN(fb) && fb >= 0 && fb <= 9) {
                drawsWithFireball++;

                const substitutions = [
                    [fb, draw.sortedSecondNumber, draw.sortedThirdNumber],
                    [draw.sortedFirstNumber, fb, draw.sortedThirdNumber],
                    [draw.sortedFirstNumber, draw.sortedSecondNumber, fb]
                ];

                for (let j = 0; j < substitutions.length; j++) {
                    const tempSub = [...substitutions[j]];
                    tempSub.sort((a, b) => a - b);

                    totalFireballSubstitutionsChecked++;

                    const fireballSubOutcome = isDrawPassing(tempSub);
                    if (fireballSubOutcome.passing) {
                        isValidFireballNewRules = true; // At least one substitution passed
                        fireballPassCount++; // Increment the count
                        totalFireballSubstitutionsPassed++;

                        // Store details about this passing substitution
                        fireballPassDetails.push({
                            substitution: substitutions[j],
                            sorted: tempSub,
                            abPattern: fireballSubOutcome.abPattern,
                            reason: fireballSubOutcome.reason
                        });

                        // Track BBA and BAA patterns in fireball passes
                        if (fireballSubOutcome.abPattern === "BBA") {
                            fireballBBACount++;
                        } else if (fireballSubOutcome.abPattern === "BAA") {
                            fireballBAACount++;
                        }
                    }
                }
            }

            if (isValidFireballNewRules) {
                totalFireballPassedNewRules++;
                drawsWithAtLeastOneFireballPass++;
            }
        } // End of loop through draws

        // --- Percentage Calculation ---
        // Denominator for percentages is the total number of draws that were processed (had valid fields)
        const denominatorForPercentage = draws.length;
        let percentageBBB = 0;
        let percentageBBA = 0;
        let percentageBAA = 0;
        let percentageAAA = 0;
        let percentagePassedNewRules = 0;
        let percentageFireballPassedNewRules = 0;

        if (denominatorForPercentage > 0) {
            percentageBBB = (countBBB / denominatorForPercentage) * 100;
            percentageBBA = (countBBA / denominatorForPercentage) * 100;
            percentageBAA = (countBAA / denominatorForPercentage) * 100;
            percentageAAA = (countAAA / denominatorForPercentage) * 100;
            percentagePassedNewRules = (totalPassedNewRules / denominatorForPercentage) * 100;
            percentageFireballPassedNewRules = (totalFireballPassedNewRules / denominatorForPercentage) * 100;
        }

        // --- Result Preparation ---
        const result = {
            totalDrawsFetched: snapshot.size,
            validDrawsProcessed: denominatorForPercentage,
            uniqueNumberDraws: uniqueNumberDrawsCount,
            distributionCountsForUniqueDraws: {
                BBB: countBBB,
                BBA: countBBA,
                BAA: countBAA,
                AAA: countAAA,
            },
            bbaDifferences: bbaDifferenceCounts,
            baaDifferences: baaDifferenceCounts,
            // Add the new counts for differences of 2 or less
            bbaDifferenceTwoOrLessCount,
            bbaDifferenceTwoOrLessPercentage: (bbaDifferenceTwoOrLessCount / denominatorForPercentage) * 100,
            baaDifferenceTwoOrLessCount,
            baaDifferenceTwoOrLessPercentage: (baaDifferenceTwoOrLessCount / denominatorForPercentage) * 100,
            distributionPercentagesOfTotalProcessed: { // Percentages based on total valid draws processed
                BBB: percentageBBB,
                BBA: percentageBBA,
                BAA: percentageBAA,
                AAA: percentageAAA,
            },
            // NEW SECTION: Add the new rule validation results
            newRulesValidation: {
                totalPassedNewRules,
                percentagePassedNewRules,
                totalFireballPassedNewRules,
                percentageFireballPassedNewRules,
            },
            // NEW SECTION: Add detailed fireball statistics
            fireballStats: {
                drawsWithFireball,
                drawsWithAtLeastOneFireballPass,
                totalFireballSubstitutionsPassed,
                totalFireballSubstitutionsChecked,
                fireballBBACount,
                fireballBAACount,
                averageFireballPassesPerDraw: drawsWithFireball > 0 ?
                    totalFireballSubstitutionsPassed / drawsWithFireball : 0,
                fireballSubstitutionPassRate: totalFireballSubstitutionsChecked > 0 ?
                    (totalFireballSubstitutionsPassed / totalFireballSubstitutionsChecked) * 100 : 0,
                percentageOfDrawsWithFireballPass: denominatorForPercentage > 0 ?
                    (drawsWithAtLeastOneFireballPass / denominatorForPercentage) * 100 : 0
            }
        };
        console.log("Analysis Result:", JSON.stringify(result, null, 2)); // For server-side logging if needed

        // --- Response ---
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0', // Disable caching for dynamic data
            },
        });
    } catch (error) {
        console.error("Error in API route:", error);
        return new Response(JSON.stringify({ error: "An internal server error occurred", details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}