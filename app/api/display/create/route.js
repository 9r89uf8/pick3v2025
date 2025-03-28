// app/api/posts/route.js
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getMonths = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    let twoMonthsAgoIndex;
    let previousMonthIndex;

    if (currentMonthIndex === 0) {
        twoMonthsAgoIndex = 10; // (Dec -> Oct)
        previousMonthIndex = 11; // (Dec -> Nov)
    } else if (currentMonthIndex === 1) {
        twoMonthsAgoIndex = 11; // (Jan -> Nov)
        previousMonthIndex = 0;  // (Jan -> Dec)
    } else {
        twoMonthsAgoIndex = currentMonthIndex - 2;
        previousMonthIndex = currentMonthIndex - 1;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [monthNames[previousMonthIndex], monthNames[currentMonthIndex], monthNames[twoMonthsAgoIndex]];
};

function validateThreeDigits(a, b, c) {
    const firstNumberValid = a <= 2;        // Must be <= 2
    const secondNumberValid = b >= 3 && b <= 6; // Must be between 3 and 6
    const thirdNumberValid = c >= 7;        // Must be >= 7
    const uniqueCheck = (a !== b) && (b !== c) && (a !== c);

    return (firstNumberValid && secondNumberValid && thirdNumberValid && uniqueCheck);
}

export async function GET() {
    try {
        const [prevMonth, currentMonth] = getMonths();
        // const currentMonth = 'Oct'
        // const prevMonth = 'Sep'

        const drawsCollectionRef = adminDb.firestore()
            .collection('draws')
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
        let totalFireballPredictions = 0;  // New counter for Fireball predictions
        let totalDraws = draws.length;

        // Update each draw document with isValid and isValidFireball
        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];
            console.log(
                `\nValidating draw: ${draw.sortedFirstNumber}, ${draw.sortedSecondNumber}, ${draw.sortedThirdNumber}`
            );

            const { sortedFirstNumber, sortedSecondNumber, sortedThirdNumber, fireball } = draw;

            // === Compute isValid (original 3-digit check) ===
            const isValid = validateThreeDigits(sortedFirstNumber, sortedSecondNumber, sortedThirdNumber);
            if (isValid) {
                totalCorrectPredictions++;
                console.log('Draw passed all validations');
            } else {
                console.log('Draw failed validations');
            }

            // === Compute isValidFireball (Fireball check) ===
            let isValidFireball = false;

            if (typeof fireball === 'number') {
                // For each digit replaced by Fireball, sort them, then validate
                const replacedA = [fireball, sortedSecondNumber, sortedThirdNumber].sort((x, y) => x - y);
                const replacedB = [sortedFirstNumber, fireball, sortedThirdNumber].sort((x, y) => x - y);
                const replacedC = [sortedFirstNumber, sortedSecondNumber, fireball].sort((x, y) => x - y);

                const checkA = validateThreeDigits(replacedA[0], replacedA[1], replacedA[2]);
                const checkB = validateThreeDigits(replacedB[0], replacedB[1], replacedB[2]);
                const checkC = validateThreeDigits(replacedC[0], replacedC[1], replacedC[2]);

                isValidFireball = checkA || checkB || checkC;

                if (isValidFireball) {
                    totalFireballPredictions++;
                }
            }

            // Update the draw document in Firestore
            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, {
                isValid,
                isValidFireball
            });
        }

        // Create or update stats document for the current month
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentMonth);
        batch.set(statsRef, {
            month: currentMonth,
            totalDraws,
            totalPassed: totalCorrectPredictions,
            totalFireballPassed: totalFireballPredictions,  // New stat
            percentage: (totalCorrectPredictions / totalDraws) * 100,
            fireballPercentage: (totalFireballPredictions / totalDraws) * 100,  // New percentage
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();

        // Read current & previous month stats
        const statsCollection = adminDb.firestore().collection('drawStats');

        const currentDoc = await statsCollection.doc(currentMonth).get();
        let currentData = currentDoc.exists ? currentDoc.data() : null;

        const prevDoc = await statsCollection.doc(prevMonth).get();
        let prevData = prevDoc.exists ? prevDoc.data() : null;

        const responsePayload = {
            currentMonth: currentData
                ? {
                    month: currentData.month,
                    totalDraws: currentData.totalDraws,
                    totalPassed: currentData.totalPassed,
                    totalFireballPassed: currentData.totalFireballPassed,  // Include in response
                    percentage: currentData.percentage,
                    fireballPercentage: currentData.fireballPercentage,    // Include in response
                }
                : null,
            previousMonth: prevData
                ? {
                    month: prevData.month,
                    totalDraws: prevData.totalDraws,
                    totalPassed: prevData.totalPassed,
                    totalFireballPassed: prevData.totalFireballPassed,     // Include in response
                    percentage: prevData.percentage,
                    fireballPercentage: prevData.fireballPercentage,       // Include in response
                }
                : null,
        };

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

