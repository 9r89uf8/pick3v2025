// app/api/display/straight/create/route.js - STRAIGHT stats creation
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Helper function to get A/B Distribution ---
const getABDistribution = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length !== 3) {
        return "INVALID_INPUT_FORMAT";
    }

    let countB = 0; // Numbers 0-4
    let countA = 0; // Numbers 5-9
    for (const num of numbers) {
        if (isNaN(num)) return "CONTAINS_NAN";
        if (num >= 0 && num <= 4) countB++;
        else if (num >= 5 && num <= 9) countA++;
        else return "NUM_OUT_OF_RANGE";
    }

    if (countB + countA !== 3) return "INVALID_COUNTS";

    if (countB === 3) return "BBB";
    if (countB === 2 && countA === 1) return "BBA";
    if (countB === 1 && countA === 2) return "BAA";
    if (countA === 3) return "AAA";

    return "UNKNOWN_DIST_LOGIC";
};

// --- STRAIGHT validation - position-sensitive ---
const isStraightDrawPassing = (numbers) => {
    // Validate numbers: must be 3 numbers, each a digit from 0-9
    if (!Array.isArray(numbers) || numbers.length !== 3 || numbers.some(n => isNaN(n) || n < 0 || n > 9)) {
        return { passing: false, abPattern: "INVALID_NUMS", reason: "Numbers must be 3 digits (0-9)." };
    }

    // Rule 1: No repeating numbers
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
        const patternForRepeating = getABDistribution([...numbers]);
        return { passing: false, abPattern: patternForRepeating, reason: "REPEATING_NUMBERS" };
    }

    // Get ordered pattern (position matters for STRAIGHT)
    const abPattern = getABDistribution(numbers);

    // Rule 2: Distribution must be valid STRAIGHT patterns (2:1 ratio)
    const validPatterns = ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'];
    if (!validPatterns.includes(abPattern)) {
        let reasonText = `DISTRIBUTION_NOT_TARGET (${abPattern})`;
        if (["AAA", "BBB"].includes(abPattern)) {
            reasonText = `Non-target distribution: ${abPattern}`;
        }
        return { passing: false, abPattern: abPattern, reason: reasonText };
    }

    // Rule 3: Difference checks based on pattern (position-sensitive)
    const matchingPositions = [];
    for (let i = 0; i < abPattern.length; i++) {
        for (let j = i + 1; j < abPattern.length; j++) {
            if (abPattern[i] === abPattern[j]) {
                matchingPositions.push([i, j]);
            }
        }
    }

    // For patterns with 2 of the same category, check their difference
    if (matchingPositions.length === 1) {
        const [pos1, pos2] = matchingPositions[0];
        const diff = Math.abs(numbers[pos1] - numbers[pos2]);
        
        if (diff > 2) {
            return {
                passing: false,
                abPattern,
                reason: `Difference between matching ${abPattern[pos1]} numbers (${numbers[pos1]}, ${numbers[pos2]}) is ${diff} > 2`
            };
        }
    }

    return { passing: true, abPattern, reason: "PASS" };
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

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
        current: { month: monthNames[currentMonthIndex], year: currentYear.toString() },
        previous: { month: monthNames[previousMonthIndex], year: previousMonthYear.toString() }
    };
};

export async function GET() {
    try {
        const months = getMonths();
        const currentMonthName = months.current.month;
        const currentYearStr = months.current.year;
        const prevMonthName = months.previous.month;
        const prevMonthYearStr = months.previous.year;

        console.log(`Processing STRAIGHT stats for: ${currentMonthName} ${currentYearStr}`);

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

        let totalPassedStraight = 0;
        let totalFireballPassedStraight = 0;
        let totalDraws = draws.length;

        // Pattern counters for STRAIGHT
        let patternCounts = {
            BBA: 0, BAB: 0, ABB: 0,
            BAA: 0, ABA: 0, AAB: 0
        };

        // Detailed fireball tracking
        let totalFireballSubstitutionsPassed = 0;
        let totalFireballSubstitutionsChecked = 0;
        let drawsWithAtLeastOneFireballPass = 0;
        let fireballPatternCounts = {
            BBA: 0, BAB: 0, ABB: 0,
            BAA: 0, ABA: 0, AAB: 0
        };

        console.log(`Found ${totalDraws} draws for STRAIGHT analysis`);

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];

            // Use ORIGINAL numbers for STRAIGHT (position matters)
            const ofn = Number(draw.originalFirstNumber);
            const osn = Number(draw.originalSecondNumber);
            const otn = Number(draw.originalThirdNumber);
            const fb = Number(draw.fireball);

            if (isNaN(ofn) || isNaN(osn) || isNaN(otn)) {
                console.warn(`Skipping draw ID ${draw.id} due to invalid original numbers.`);
                const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
                batch.update(drawRef, {
                    isValidStraightRules: false,
                    isValidFireballStraightRules: false,
                    validationErrorStraight: "Invalid original draw numbers"
                });
                continue;
            }

            const mainDrawNumbers = [ofn, osn, otn];

            const mainDrawOutcome = isStraightDrawPassing(mainDrawNumbers);
            const isValidStraightRules = mainDrawOutcome.passing;

            if (isValidStraightRules) {
                totalPassedStraight++;
                // Increment pattern counts
                if (patternCounts[mainDrawOutcome.abPattern] !== undefined) {
                    patternCounts[mainDrawOutcome.abPattern]++;
                }
                console.log(`Draw ID ${draw.id} PASSED STRAIGHT rules. Pattern: ${mainDrawOutcome.abPattern}`);
            } else {
                console.log(`Draw ID ${draw.id} FAILED STRAIGHT rules. Reason: ${mainDrawOutcome.reason}`);
            }

            // Fireball validation for STRAIGHT
            let isValidFireballStraightRules = false;
            let fireballPassCount = 0;

            if (!isNaN(fb) && fb >= 0 && fb <= 9) {
                const substitutions = [
                    [fb, osn, otn],    // Replace first position
                    [ofn, fb, otn],    // Replace second position
                    [ofn, osn, fb]     // Replace third position
                ];

                for (let j = 0; j < substitutions.length; j++) {
                    const fireballSubOutcome = isStraightDrawPassing(substitutions[j]);
                    if (fireballSubOutcome.passing) {
                        isValidFireballStraightRules = true;
                        fireballPassCount++;

                        // Count fireball patterns
                        if (fireballPatternCounts[fireballSubOutcome.abPattern] !== undefined) {
                            fireballPatternCounts[fireballSubOutcome.abPattern]++;
                        }

                        console.log(`Draw ID ${draw.id} - Fireball STRAIGHT substitution [${substitutions[j].join(',')}] PASSED. Pattern: ${fireballSubOutcome.abPattern}`);
                    }
                }
            }

            if (isValidFireballStraightRules) {
                totalFireballPassedStraight++;
                drawsWithAtLeastOneFireballPass++;
            }

            totalFireballSubstitutionsPassed += fireballPassCount;
            totalFireballSubstitutionsChecked += 3;

            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, {
                isValidStraightRules: isValidStraightRules,
                isValidFireballStraightRules: isValidFireballStraightRules,
                fireballStraightPassCount: fireballPassCount,
                straightABPattern: mainDrawOutcome.abPattern,
                straightReason: mainDrawOutcome.reason,
                validationErrorStraight: null
            });
        }

        // Store with --unordered suffix to match existing pattern
        const currentStatsDocId = `${currentMonthName}-${currentYearStr}--unordered`;
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentStatsDocId);

        const percentageStraight = totalDraws > 0 ? (totalPassedStraight / totalDraws) * 100 : 0;
        const fireballPercentageStraight = totalDraws > 0 ? (totalFireballPassedStraight / totalDraws) * 100 : 0;

        batch.set(statsRef, {
            monthYear: currentStatsDocId,
            month: currentMonthName,
            year: currentYearStr,
            totalDraws,
            totalPassedConditions: totalPassedStraight,
            totalFireballPassed: totalFireballPassedStraight,
            percentageConditions: percentageStraight,
            fireballPercentage: fireballPercentageStraight,
            patternCounts: patternCounts,
            fireballPatternCounts: fireballPatternCounts,
            totalFireballSubstitutionsPassed: totalFireballSubstitutionsPassed,
            totalFireballSubstitutionsChecked: totalFireballSubstitutionsChecked,
            drawsWithAtLeastOneFireballPass: drawsWithAtLeastOneFireballPass,
            averageFireballPassesPerDraw: totalDraws > 0 ? totalFireballSubstitutionsPassed / totalDraws : 0,
            fireballSubstitutionPassRate: totalFireballSubstitutionsChecked > 0 ?
                (totalFireballSubstitutionsPassed / totalFireballSubstitutionsChecked) * 100 : 0,
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();
        console.log(`STRAIGHT stats batch commit successful for ${currentMonthName} ${currentYearStr}`);

        const statsCollection = adminDb.firestore().collection('drawStats');

        const currentDoc = await statsCollection.doc(currentStatsDocId).get();
        let currentData = currentDoc.exists ? currentDoc.data() : null;

        const previousStatsDocId = `${prevMonthName}-${prevMonthYearStr}--unordered`;
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
                patternCounts: currentData.patternCounts || {},
                fireballPatternCounts: currentData.fireballPatternCounts || {},
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
                patternCounts: prevData.patternCounts || {},
                fireballPatternCounts: prevData.fireballPatternCounts || {},
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
        console.error("Error in STRAIGHT stats creation:", error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}