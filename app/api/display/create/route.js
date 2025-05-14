// app/api/create/route.js
import { adminDb } from '@/app/utils/firebaseAdmin';

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

// --- New helper function to validate draw based on all rules ---
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


const getMonths = () => {
    const currentDate = new Date(); // Assuming current date is May 8, 2025
    const currentMonthIndex = currentDate.getMonth(); // 4 (May)

    const currentYear = currentDate.getFullYear(); // 2025

    let previousMonthIndex = currentMonthIndex - 1; // 3 (Apr)
    let previousMonthYear = currentYear; // 2025
    if (previousMonthIndex < 0) {
        previousMonthIndex = 11;
        previousMonthYear = currentYear - 1;
    }

    let twoMonthsAgoIndex = currentMonthIndex - 2; // 2 (Mar)
    let twoMonthsAgoYear = currentYear; // 2025
    if (twoMonthsAgoIndex < 0) {
        twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
        twoMonthsAgoYear = currentYear -1;
        if (twoMonthsAgoIndex < 0) { // Should not happen with 12 + index logic here for May
            twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
            twoMonthsAgoYear = currentYear -2;
        }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
        current: { month: monthNames[currentMonthIndex], year: currentYear.toString() }, // May 2025
        previous: { month: monthNames[previousMonthIndex], year: previousMonthYear.toString() }, // Apr 2025
        twoMonthsAgo: { month: monthNames[twoMonthsAgoIndex], year: twoMonthsAgoYear.toString() } // Mar 2025
    };
};


export async function GET() {
    try {
        const months = getMonths();
        const currentMonthName = months.current.month;
        const currentYearStr = months.current.year;
        const prevMonthName = months.previous.month;
        const prevMonthYearStr = months.previous.year;

        console.log(`Processing for: ${currentMonthName} ${currentYearStr}`);
        console.log(`Previous month for stats: ${prevMonthName} ${prevMonthYearStr}`);


        const drawsCollectionRef = adminDb.firestore()
            .collection('draws')
            .where('drawMonth', '==', currentMonthName)
            .where('year', '==', currentYearStr)
            .orderBy('index', 'desc');

        const snapshot = await drawsCollectionRef.get();
        const draws = [];
        const batch = adminDb.firestore().batch();

        snapshot.forEach((doc) => {
            draws.push({
                id: doc.id,
                ...doc.data()
            });
        });

        let totalPassedNewRules = 0;
        let totalFireballPassedNewRules = 0;
        let totalDraws = draws.length;
        let countBBA = 0; // Counter for BBA in main draws
        let countBAA = 0; // Counter for BAA in main draws

        // New detailed fireball tracking
        let totalFireballSubstitutionsPassed = 0; // Total substitutions that passed across all draws
        let totalFireballSubstitutionsChecked = 0; // Total substitutions checked across all draws
        let drawsWithAtLeastOneFireballPass = 0; // Draws that had at least one passing substitution
        let fireballBBACount = 0; // Count of fireball substitutions that resulted in BBA
        let fireballBAACount = 0; // Count of fireball substitutions that resulted in BAA

        console.log(`Found ${totalDraws} draws for ${currentMonthName} ${currentYearStr}.`);

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];

            const sfn = Number(draw.sortedFirstNumber);
            const ssn = Number(draw.sortedSecondNumber);
            const stn = Number(draw.sortedThirdNumber);
            const fb = Number(draw.fireball);

            if (isNaN(sfn) || isNaN(ssn) || isNaN(stn)) {
                console.warn(`Skipping draw ID ${draw.id} due to invalid main draw numbers.`);
                const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
                batch.update(drawRef, {
                    isValidNewRules: false,
                    isValidFireballNewRules: false,
                    validationError: "Invalid main draw numbers"
                });
                continue;
            }

            const mainDrawNumbers = [sfn, ssn, stn];

            console.log(
                `\nValidating draw ID ${draw.id}: ${mainDrawNumbers.join(', ')} (Fireball: ${isNaN(fb) ? 'N/A' : fb})`
            );

            const mainDrawOutcome = isDrawPassing(mainDrawNumbers);
            const isValidNewRules = mainDrawOutcome.passing;

            if (isValidNewRules) {
                totalPassedNewRules++;
                // Increment BBA/BAA counts if the draw passed and matches the pattern
                if (mainDrawOutcome.abPattern === "BBA") {
                    countBBA++;
                } else if (mainDrawOutcome.abPattern === "BAA") {
                    countBAA++;
                }
                console.log(`Draw ID ${draw.id} PASSED new rules. Reason: ${mainDrawOutcome.reason}, A/B: ${mainDrawOutcome.abPattern}`);
            } else {
                console.log(`Draw ID ${draw.id} FAILED new rules. Reason: ${mainDrawOutcome.reason}, A/B: ${mainDrawOutcome.abPattern}`);
            }

            // Fireball validation with detailed tracking
            let isValidFireballNewRules = false;
            let fireballPassCount = 0; // Track how many substitutions pass for this draw
            let fireballPassDetails = []; // Track details of each passing substitution

            if (!isNaN(fb) && fb >= 0 && fb <= 9) {
                const substitutions = [
                    [fb, ssn, stn],
                    [sfn, fb, stn],
                    [sfn, ssn, fb]
                ];

                for (let j = 0; j < substitutions.length; j++) {
                    const tempSub = [...substitutions[j]];
                    tempSub.sort((a, b) => a - b);

                    const fireballSubOutcome = isDrawPassing(tempSub);
                    if (fireballSubOutcome.passing) {
                        isValidFireballNewRules = true; // At least one substitution passed
                        fireballPassCount++; // Increment the count

                        // Store details about this passing substitution
                        fireballPassDetails.push({
                            substitution: substitutions[j],
                            sorted: tempSub,
                            abPattern: fireballSubOutcome.abPattern,
                            reason: fireballSubOutcome.reason
                        });

                        console.log(`Draw ID ${draw.id} - Fireball substitution [${substitutions[j].join(',')}] (sorted: [${tempSub.join(',')}]) PASSED. Reason: ${fireballSubOutcome.reason}, A/B: ${fireballSubOutcome.abPattern}`);
                        // Note: No 'break' here - we continue checking all substitutions
                    } else {
                        console.log(`Draw ID ${draw.id} - Fireball substitution [${substitutions[j].join(',')}] (sorted: [${tempSub.join(',')}]) FAILED. Reason: ${fireballSubOutcome.reason}, A/B: ${fireballSubOutcome.abPattern}`);
                    }
                }

                console.log(`Draw ID ${draw.id} - Total fireball passes: ${fireballPassCount}`);
            } else {
                console.log(`Draw ID ${draw.id} - Fireball number is invalid or missing.`);
            }

            if (isValidFireballNewRules) {
                totalFireballPassedNewRules++;
                drawsWithAtLeastOneFireballPass++;
            }

            // Update detailed fireball stats
            totalFireballSubstitutionsPassed += fireballPassCount;
            totalFireballSubstitutionsChecked += 3; // Always check 3 substitutions per draw

            // Count patterns for fireball passes
            fireballPassDetails.forEach(detail => {
                if (detail.abPattern === "BBA") fireballBBACount++;
                if (detail.abPattern === "BAA") fireballBAACount++;
            });

            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, {
                isValidNewRules: isValidNewRules,
                isValidFireballNewRules: isValidFireballNewRules,
                fireballPassCount: fireballPassCount, // New field
                fireballPassDetails: fireballPassDetails, // New field with details
                newRulesABPattern: mainDrawOutcome.abPattern,
                newRulesReason: mainDrawOutcome.reason,
                validationError: null
            });
        }

        const currentStatsDocId = `${currentMonthName}-${currentYearStr}`;
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentStatsDocId);

        const percentageNewRules = totalDraws > 0 ? (totalPassedNewRules / totalDraws) * 100 : 0;
        const fireballPercentageNewRules = totalDraws > 0 ? (totalFireballPassedNewRules / totalDraws) * 100 : 0;

        batch.set(statsRef, {
            monthYear: currentStatsDocId,
            month: currentMonthName,
            year: currentYearStr,
            totalDraws,
            totalPassedNewRules: totalPassedNewRules,
            totalFireballPassedNewRules: totalFireballPassedNewRules,
            percentageNewRules: percentageNewRules,
            fireballPercentageNewRules: fireballPercentageNewRules,
            countBBA: countBBA, // Store BBA count for main draws
            countBAA: countBAA, // Store BAA count for main draws
            // New detailed fireball stats:
            totalFireballSubstitutionsPassed: totalFireballSubstitutionsPassed,
            totalFireballSubstitutionsChecked: totalFireballSubstitutionsChecked,
            drawsWithAtLeastOneFireballPass: drawsWithAtLeastOneFireballPass,
            fireballBBACount: fireballBBACount,
            fireballBAACount: fireballBAACount,
            averageFireballPassesPerDraw: totalDraws > 0 ? totalFireballSubstitutionsPassed / totalDraws : 0,
            fireballSubstitutionPassRate: totalFireballSubstitutionsChecked > 0 ?
                (totalFireballSubstitutionsPassed / totalFireballSubstitutionsChecked) * 100 : 0,
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();
        console.log(`Batch commit successful for ${currentMonthName} ${currentYearStr}.`);

        const statsCollection = adminDb.firestore().collection('drawStats');

        const currentDoc = await statsCollection.doc(currentStatsDocId).get();
        let currentData = currentDoc.exists ? currentDoc.data() : null;

        const previousStatsDocId = `${prevMonthName}-${prevMonthYearStr}`;
        const prevDoc = await statsCollection.doc(previousStatsDocId).get();
        let prevData = prevDoc.exists ? prevDoc.data() : null;

        const responsePayload = {
            currentMonthStats: currentData ? {
                monthYear: currentData.monthYear,
                totalDraws: currentData.totalDraws,
                totalPassed: currentData.totalPassedNewRules,
                totalFireballPassed: currentData.totalFireballPassedNewRules,
                percentage: currentData.percentageNewRules,
                fireballPercentage: currentData.fireballPercentageNewRules,
                countBBA: currentData.countBBA !== undefined ? currentData.countBBA : 0, // Return BBA count
                countBAA: currentData.countBAA !== undefined ? currentData.countBAA : 0, // Return BAA count
                // Include new fireball stats in response:
                totalFireballSubstitutionsPassed: currentData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: currentData.totalFireballSubstitutionsChecked || 0,
                fireballBBACount: currentData.fireballBBACount || 0,
                fireballBAACount: currentData.fireballBAACount || 0,
                averageFireballPassesPerDraw: currentData.averageFireballPassesPerDraw || 0,
                fireballSubstitutionPassRate: currentData.fireballSubstitutionPassRate || 0
            } : null,
            previousMonthStats: prevData ? {
                monthYear: prevData.monthYear,
                totalDraws: prevData.totalDraws,
                totalPassed: prevData.totalPassedNewRules,
                totalFireballPassed: prevData.totalFireballPassedNewRules,
                percentage: prevData.percentageNewRules,
                fireballPercentage: prevData.fireballPercentageNewRules,
                countBBA: prevData.countBBA !== undefined ? prevData.countBBA : 0, // Return BBA count for prev month
                countBAA: prevData.countBAA !== undefined ? prevData.countBAA : 0, // Return BAA count for prev month
                // Include new fireball stats for previous month:
                totalFireballSubstitutionsPassed: prevData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: prevData.totalFireballSubstitutionsChecked || 0,
                fireballBBACount: prevData.fireballBBACount || 0,
                fireballBAACount: prevData.fireballBAACount || 0,
                averageFireballPassesPerDraw: prevData.averageFireballPassesPerDraw || 0,
                fireballSubstitutionPassRate: prevData.fireballSubstitutionPassRate || 0
            } : null,
        };

        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error("Error in GET /api/posts:", error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

