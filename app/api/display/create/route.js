// app/api/posts/route.js
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



export async function GET() {
    try {
        const [prevMonth, currentMonth] = getMonths();
        const drawsCollectionRef = adminDb.firestore().collection('draws')
            .where('drawMonth', '==', currentMonth)
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
        let totalDraws = draws.length;

        // Update each draw document with isValid flag
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            console.log(`\nValidating draw: ${draw.sortedFirstNumber},${draw.sortedSecondNumber},${draw.sortedThirdNumber}`);

            // Check each condition separately and log failures
            const firstNumberValid = draw.sortedFirstNumber <= 2;
            if (!firstNumberValid) {
                console.log(`Failed: First number ${draw.sortedFirstNumber} is greater than 3`);
            }

            const secondNumberValid = draw.sortedSecondNumber >= 3 && draw.sortedSecondNumber <= 6;
            if (!secondNumberValid) {
                console.log(`Failed: Second number ${draw.sortedSecondNumber} is not between 2 and 7`);
            }

            const thirdNumberValid = draw.sortedThirdNumber >= 7;
            if (!thirdNumberValid) {
                console.log(`Failed: Third number ${draw.sortedThirdNumber} is less than 6`);
            }


            const isValid = firstNumberValid && secondNumberValid && thirdNumberValid && draw.sortedFirstNumber!==draw.sortedSecondNumber && draw.sortedThirdNumber!==draw.sortedSecondNumber

            if (isValid) {
                totalCorrectPredictions++;
                console.log('Draw passed all validations');
            }

            // Update the draw document
            const drawRef = adminDb.firestore().collection('draws').doc(draw.id);
            batch.update(drawRef, { isValid });
        }

        // Create or update stats document
        const statsRef = adminDb.firestore().collection('drawStats').doc(currentMonth);
        batch.set(statsRef, {
            month: currentMonth,
            totalDraws,
            totalPassed: totalCorrectPredictions,
            percentage: (totalCorrectPredictions / totalDraws) * 100,
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Commit all updates
        await batch.commit();

// =============================================
        // Now read back the CURRENT and PREVIOUS month stats from drawStats.
        // =============================================
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

        // Build final response in desired shape
        const responsePayload = {
            currentMonth: currentData
                ? {
                    month: currentData.month,
                    totalDraws: currentData.totalDraws,
                    totalPassed: currentData.totalPassed,
                    percentage: currentData.percentage,
                }
                : null,
            previousMonth: prevData
                ? {
                    month: prevData.month,
                    totalDraws: prevData.totalDraws,
                    totalPassed: prevData.totalPassed,
                    percentage: prevData.percentage,
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