import {adminDb} from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getMonths = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    let twoMonthsAgoIndex;
    let previousMonthIndex;

    if (currentMonthIndex === 0) {
        twoMonthsAgoIndex = 10;
        previousMonthIndex = 11;
    } else if (currentMonthIndex === 1) {
        twoMonthsAgoIndex = 11;
        previousMonthIndex = 0;
    } else {
        twoMonthsAgoIndex = currentMonthIndex - 2;
        previousMonthIndex = currentMonthIndex - 1;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [monthNames[previousMonthIndex], monthNames[currentMonthIndex], monthNames[twoMonthsAgoIndex]];
};

function determinePattern(numbers) {
    // Create a copy of the numbers
    let originalNumbers = [...numbers];

    // Sort numbers to find lowest, middle, highest
    let sortedNumbers = [...numbers].sort((a, b) => a - b);

    // Map each original number to its position (L, M, H)
    let positions = originalNumbers.map(num => {
        if (num === sortedNumbers[0]) return 'L';
        if (num === sortedNumbers[1]) return 'M';
        if (num === sortedNumbers[2]) return 'H';
        return '';
    });

    // Join to create pattern string
    return positions.join('');
}

function isValidDraw(draw) {
    let nums = [
        draw.originalFirstNumber,
        draw.originalSecondNumber,
        draw.originalThirdNumber
    ];

    // Check for duplicate numbers
    const uniqueNums = new Set(nums);
    if (uniqueNums.size !== nums.length) {
        return { isValid: false, pattern: null };
    }

    // Determine the pattern based on the order of lowest, middle, highest
    const pattern = determinePattern(nums);

    // Check if the pattern is one of the six valid distributions
    const validPatterns = ['LMH', 'LHM', 'MLH', 'MHL', 'HLM', 'HML'];
    const isValid = validPatterns.includes(pattern);

    return { isValid, pattern: isValid ? pattern : null };
}

function isValidWithFireball(draw) {
    // Get original numbers
    const originalNumbers = [
        draw.originalFirstNumber,
        draw.originalSecondNumber,
        draw.originalThirdNumber
    ];

    // Get fireball number
    const fireballNumber = draw.fireball;

    // Try replacing each position with the fireball number
    for (let i = 0; i < 3; i++) {
        // Create a new array with the fireball substitution
        let modifiedNumbers = [...originalNumbers];
        modifiedNumbers[i] = fireballNumber;

        // Check for duplicates
        const uniqueNums = new Set(modifiedNumbers);
        if (uniqueNums.size !== modifiedNumbers.length) {
            continue; // Skip if there are duplicates
        }

        // Check if this combination has a valid pattern
        const pattern = determinePattern(modifiedNumbers);
        const validPatterns = ['LMH', 'LHM', 'MLH', 'MHL', 'HLM', 'HML'];

        if (validPatterns.includes(pattern)) {
            return {
                isValid: true,
                pattern,
                replacedPosition: i,
                modifiedNumbers
            };
        }
    }

    return {
        isValid: false,
        pattern: null,
        replacedPosition: null,
        modifiedNumbers: null
    };
}

export async function GET() {
    try {
        const [prevMonth, currentMonth] = getMonths();
        const drawsCollectionRef = adminDb.firestore().collection('draws')
            .where('drawMonth', '==', currentMonth)
            .where('year', '==', '2025')
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

        let totalCorrectPredictions = 0;
        let totalValidWithFireball = 0;
        let totalDraws = draws.length;
        let distributions = {
            LMH: 0,
            LHM: 0,
            MLH: 0,
            MHL: 0,
            HLM: 0,
            HML: 0
        };
        let fireballDistributions = {
            LMH: 0,
            LHM: 0,
            MLH: 0,
            MHL: 0,
            HLM: 0,
            HML: 0
        };

        // Update each draw document with isValid flag and pattern
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            const { isValid, pattern } = isValidDraw(draw);

            // Store fireball validation result
            let fireballResult = { isValid: false, pattern: null, replacedPosition: null, modifiedNumbers: null };

            if (isValid) {
                console.log(draw.originalDraw);
                totalCorrectPredictions++;
                distributions[pattern]++;
            } else {
                // Only check with fireball if the original draw isn't valid
                fireballResult = isValidWithFireball(draw);

                if (fireballResult.isValid) {
                    totalValidWithFireball++;
                    fireballDistributions[fireballResult.pattern]++;
                }
            }

            // Update the draw document
            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, {
                isValid,
                pattern: isValid ? pattern : null,
                isValidWithFireball: fireballResult.isValid,
                fireballPattern: fireballResult.pattern,
                fireballReplacedPosition: fireballResult.replacedPosition,
                fireballModifiedNumbers: fireballResult.modifiedNumbers
            });
        }

        // Create or update stats document
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentMonth);
        batch.set(statsRef, {
            month: currentMonth,
            totalDraws,
            totalPassed: totalCorrectPredictions,
            totalPassedWithFireball: totalValidWithFireball,
            totalPassedCombined: totalCorrectPredictions + totalValidWithFireball,
            percentageOriginal: (totalCorrectPredictions / totalDraws) * 100,
            percentageWithFireball: (totalValidWithFireball / totalDraws) * 100,
            percentageCombined: ((totalCorrectPredictions + totalValidWithFireball) / totalDraws) * 100,
            distributions,
            fireballDistributions,
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Commit all updates
        await batch.commit();

        // Read back the stats
        const statsCollection = adminDb.firestore().collection('drawStats');

        // 1. Current month
        const currentDoc = await statsCollection.doc(currentMonth).get();
        let currentData = null;
        if (currentDoc.exists) {
            currentData = currentDoc.data();
        }

        // 2. Previous month
        const prevDoc = await statsCollection.doc(prevMonth).get();
        let prevData = null;
        if (prevDoc.exists) {
            prevData = prevDoc.data();
        }

        // Build final response
        const responsePayload = {
            currentMonth: currentData
                ? {
                    month: currentData.month,
                    totalDraws: currentData.totalDraws,
                    totalPassed: currentData.totalPassed,
                    totalPassedWithFireball: currentData.totalPassedWithFireball,
                    totalPassedCombined: currentData.totalPassedCombined,
                    percentageOriginal: currentData.percentageOriginal,
                    percentageWithFireball: currentData.percentageWithFireball,
                    percentageCombined: currentData.percentageCombined,
                    distributions: currentData.distributions,
                    fireballDistributions: currentData.fireballDistributions,
                }
                : null,
            previousMonth: prevData
                ? {
                    month: prevData.month,
                    totalDraws: prevData.totalDraws,
                    totalPassed: prevData.totalPassed,
                    totalPassedWithFireball: prevData.totalPassedWithFireball,
                    totalPassedCombined: prevData.totalPassedCombined,
                    percentageOriginal: prevData.percentageOriginal,
                    percentageWithFireball: prevData.percentageWithFireball,
                    percentageCombined: prevData.percentageCombined,
                    distributions: prevData.distributions,
                    fireballDistributions: prevData.fireballDistributions,
                }
                : null,
        };

        console.log(responsePayload);
        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.log(error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}