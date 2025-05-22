// app/api/create/route.js
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Helper function to check if a combination passes the new conditions ---
const isDrawPassing = (numbers) => {
    // Validate numbers: must be 3 numbers, each a digit from 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { passing: false, reason: "INVALID_NUMBERS" };
    }

    // Rule 1: No repeating numbers
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
        return { passing: false, reason: "REPEATING_NUMBERS" };
    }

    // Rule 2: At least one number must be in range 0-2
    let hasNumberInRange0to2 = false;
    for (const num of numbers) {
        if (num >= 0 && num <= 2) {
            hasNumberInRange0to2 = true;
            break;
        }
    }

    if (!hasNumberInRange0to2) {
        return { passing: false, reason: "NO_NUMBER_IN_RANGE_0_TO_2" };
    }

    // Rule 3: At least one number must be in range 7-9
    let hasNumberInRange7to9 = false;
    for (const num of numbers) {
        if (num >= 7 && num <= 9) {
            hasNumberInRange7to9 = true;
            break;
        }
    }

    if (!hasNumberInRange7to9) {
        return { passing: false, reason: "NO_NUMBER_IN_RANGE_7_TO_9" };
    }

    // All conditions met
    return { passing: true, reason: "PASS" };
};

const getMonths = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let previousMonthIndex = currentMonthIndex - 1;
    let previousMonthYear = currentYear;
    if (previousMonthIndex < 0) {
        previousMonthIndex = 11;
        previousMonthYear = currentYear - 1;
    }

    let twoMonthsAgoIndex = currentMonthIndex - 2;
    let twoMonthsAgoYear = currentYear;
    if (twoMonthsAgoIndex < 0) {
        twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
        twoMonthsAgoYear = currentYear - 1;
        if (twoMonthsAgoIndex < 0) {
            twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
            twoMonthsAgoYear = currentYear - 2;
        }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
        current: { month: monthNames[currentMonthIndex], year: currentYear.toString() },
        previous: { month: monthNames[previousMonthIndex], year: previousMonthYear.toString() },
        twoMonthsAgo: { month: monthNames[twoMonthsAgoIndex], year: twoMonthsAgoYear.toString() }
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

        let totalPassedConditions = 0;
        let totalFireballPassed = 0;
        let totalDraws = draws.length;

        // Fireball tracking
        let totalFireballSubstitutionsPassed = 0; // Total substitutions that passed across all draws
        let totalFireballSubstitutionsChecked = 0; // Total substitutions checked across all draws
        let drawsWithAtLeastOneFireballPass = 0; // Draws that had at least one passing substitution

        console.log(`Found ${totalDraws} draws for ${currentMonthName} ${currentYearStr}.`);

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];

            // For the new conditions, we need the original numbers, not sorted
            const firstNum = Number(draw.originalFirstNumber);
            const secondNum = Number(draw.originalSecondNumber);
            const thirdNum = Number(draw.originalThirdNumber);
            const fb = Number(draw.fireball || draw.fireball);

            if (isNaN(firstNum) || isNaN(secondNum) || isNaN(thirdNum)) {
                console.warn(`Skipping draw ID ${draw.id} due to invalid main draw numbers.`);
                const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
                batch.update(drawRef, {
                    isValidConditions: false,
                    isValidFireballConditions: false,
                    validationError: "Invalid main draw numbers"
                });
                continue;
            }

            const mainDrawNumbers = [firstNum, secondNum, thirdNum];

            console.log(
                `\nValidating draw ID ${draw.id}: ${mainDrawNumbers.join(', ')} (Fireball: ${isNaN(fb) ? 'N/A' : fb})`
            );

            const mainDrawOutcome = isDrawPassing(mainDrawNumbers);
            const isValidConditions = mainDrawOutcome.passing;

            if (isValidConditions) {
                totalPassedConditions++;
                console.log(`Draw ID ${draw.id} PASSED conditions. Reason: ${mainDrawOutcome.reason}`);
            } else {
                console.log(`Draw ID ${draw.id} FAILED conditions. Reason: ${mainDrawOutcome.reason}`);
            }

            // Fireball validation with detailed tracking
            let isValidFireballConditions = false;
            let fireballPassCount = 0; // Track how many substitutions pass for this draw
            let fireballPassDetails = []; // Track details of each passing substitution

            if (!isNaN(fb) && fb >= 0 && fb <= 9) {
                const substitutions = [
                    [fb, secondNum, thirdNum],  // Replace first number with fireball
                    [firstNum, fb, thirdNum],   // Replace second number with fireball
                    [firstNum, secondNum, fb]   // Replace third number with fireball
                ];

                for (let j = 0; j < substitutions.length; j++) {
                    const fireballSubOutcome = isDrawPassing(substitutions[j]);
                    totalFireballSubstitutionsChecked++;

                    if (fireballSubOutcome.passing) {
                        isValidFireballConditions = true; // At least one substitution passed
                        fireballPassCount++; // Increment the count
                        totalFireballSubstitutionsPassed++;

                        // Store details about this passing substitution
                        fireballPassDetails.push({
                            position: j + 1,  // Position 1, 2, or 3
                            substitution: substitutions[j],
                            reason: fireballSubOutcome.reason
                        });

                        console.log(`Draw ID ${draw.id} - Fireball substitution [${substitutions[j].join(',')}] PASSED. Reason: ${fireballSubOutcome.reason}`);
                    } else {
                        console.log(`Draw ID ${draw.id} - Fireball substitution [${substitutions[j].join(',')}] FAILED. Reason: ${fireballSubOutcome.reason}`);
                    }
                }

                console.log(`Draw ID ${draw.id} - Total fireball passes: ${fireballPassCount}`);
            } else {
                console.log(`Draw ID ${draw.id} - Fireball number is invalid or missing.`);
            }

            if (isValidFireballConditions) {
                totalFireballPassed++;
                drawsWithAtLeastOneFireballPass++;
            }

            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, {
                isValidConditions: isValidConditions,
                isValidFireballConditions: isValidFireballConditions,
                fireballPassCount: fireballPassCount,
                fireballPassDetails: fireballPassDetails,
                conditionsReason: mainDrawOutcome.reason,
                validationError: null
            });
        }

        const currentStatsDocId = `${currentMonthName}-${currentYearStr}--unordered`;
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentStatsDocId);

        const percentageConditions = totalDraws > 0 ? (totalPassedConditions / totalDraws) * 100 : 0;
        const fireballPercentage = totalDraws > 0 ? (totalFireballPassed / totalDraws) * 100 : 0;

        batch.set(statsRef, {
            monthYear: currentStatsDocId,
            month: currentMonthName,
            year: currentYearStr,
            totalDraws,
            totalPassedConditions: totalPassedConditions,
            totalFireballPassed: totalFireballPassed,
            percentageConditions: percentageConditions,
            fireballPercentage: fireballPercentage,
            // Detailed fireball stats:
            totalFireballSubstitutionsPassed: totalFireballSubstitutionsPassed,
            totalFireballSubstitutionsChecked: totalFireballSubstitutionsChecked,
            drawsWithAtLeastOneFireballPass: drawsWithAtLeastOneFireballPass,
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
                totalPassed: currentData.totalPassedConditions,
                totalFireballPassed: currentData.totalFireballPassed,
                percentage: currentData.percentageConditions,
                fireballPercentage: currentData.fireballPercentage,
                // Include fireball stats:
                totalFireballSubstitutionsPassed: currentData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: currentData.totalFireballSubstitutionsChecked || 0,
                averageFireballPassesPerDraw: currentData.averageFireballPassesPerDraw || 0,
                fireballSubstitutionPassRate: currentData.fireballSubstitutionPassRate || 0
            } : null,
            previousMonthStats: prevData ? {
                monthYear: prevData.monthYear,
                totalDraws: prevData.totalDraws,
                totalPassed: prevData.totalPassedConditions,
                totalFireballPassed: prevData.totalFireballPassed,
                percentage: prevData.percentageConditions,
                fireballPercentage: prevData.fireballPercentage,
                // Include fireball stats for previous month:
                totalFireballSubstitutionsPassed: prevData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: prevData.totalFireballSubstitutionsChecked || 0,
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