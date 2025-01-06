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

function xS(combination, latestDraw) {
    let found = false;
    const current = [combination.sortedFirstNumber, combination.sortedSecondNumber, combination.sortedThirdNumber];
    const prev1 = [latestDraw.sortedPreviousFirst1, latestDraw.sortedPreviousSecond1, latestDraw.sortedPreviousThird1];
    const prev2 = [latestDraw.sortedPreviousFirst2, latestDraw.sortedPreviousSecond2, latestDraw.sortedPreviousThird2];
    const prev3 = [latestDraw.sortedPreviousFirst3, latestDraw.sortedPreviousSecond3, latestDraw.sortedPreviousThird3];
    const prev4 = [latestDraw.sortedPreviousFirst4, latestDraw.sortedPreviousSecond4, latestDraw.sortedPreviousThird4];
    const prev5 = [latestDraw.sortedPreviousFirst5, latestDraw.sortedPreviousSecond5, latestDraw.sortedPreviousThird5];
    const prev6 = [latestDraw.sortedPreviousFirst6, latestDraw.sortedPreviousSecond6, latestDraw.sortedPreviousThird6];
    const prev7 = [latestDraw.sortedPreviousFirst7, latestDraw.sortedPreviousSecond7, latestDraw.sortedPreviousThird7];
    const prev8 = [latestDraw.sortedPreviousFirst8, latestDraw.sortedPreviousSecond8, latestDraw.sortedPreviousThird8];

    const prevCombinations = [prev1, prev2, prev3, prev4, prev5, prev6, prev7, prev8];

    found = prevCombinations.some((prev, index) => {
        const matches = prev[0] === current[0] && prev[1] === current[1] && prev[2] === current[2];
        if (matches) {
            console.log(`Draw ${current.join(',')} matches previous combination #${index + 1}: ${prev.join(',')}`);
        }
        return matches;
    });

    return found;
}

function tooSimilarToPrevious(combination, latestDraw) {
    const c = [combination.sortedFirstNumber, combination.sortedSecondNumber, combination.sortedThirdNumber];

    // Check against first previous draw
    if (c[0] === latestDraw.sortedPreviousFirst1 && c[1] === latestDraw.sortedPreviousSecond1) {
        console.log(`First two numbers (${c[0]},${c[1]}) match previous draw 1`);
        return true;
    }
    if (c[0] === latestDraw.sortedPreviousFirst1 && c[2] === latestDraw.sortedPreviousThird1) {
        console.log(`First and third numbers (${c[0]},${c[2]}) match previous draw 1`);
        return true;
    }
    if (c[1] === latestDraw.sortedPreviousSecond1 && c[2] === latestDraw.sortedPreviousThird1) {
        console.log(`Second and third numbers (${c[1]},${c[2]}) match previous draw 1`);
        return true;
    }

    // Check against second previous draw
    if (c[0] === latestDraw.sortedPreviousFirst2 && c[1] === latestDraw.sortedPreviousSecond2) {
        console.log(`First two numbers (${c[0]},${c[1]}) match previous draw 2`);
        return true;
    }
    if (c[0] === latestDraw.sortedPreviousFirst2 && c[2] === latestDraw.sortedPreviousThird2) {
        console.log(`First and third numbers (${c[0]},${c[2]}) match previous draw 2`);
        return true;
    }
    if (c[1] === latestDraw.sortedPreviousSecond2 && c[2] === latestDraw.sortedPreviousThird2) {
        console.log(`Second and third numbers (${c[1]},${c[2]}) match previous draw 2`);
        return true;
    }

    return false;
}

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
        console.log(draws.length);

        // Update each draw document with isValid flag
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            console.log(`\nValidating draw: ${draw.sortedFirstNumber},${draw.sortedSecondNumber},${draw.sortedThirdNumber}`);

            // Check each condition separately and log failures
            const firstNumberValid = draw.sortedFirstNumber <= 3;
            if (!firstNumberValid) {
                console.log(`Failed: First number ${draw.sortedFirstNumber} is greater than 3`);
            }

            const secondNumberValid = draw.sortedSecondNumber >= 2 && draw.sortedSecondNumber <= 7;
            if (!secondNumberValid) {
                console.log(`Failed: Second number ${draw.sortedSecondNumber} is not between 2 and 7`);
            }

            const thirdNumberValid = draw.sortedThirdNumber >= 6;
            if (!thirdNumberValid) {
                console.log(`Failed: Third number ${draw.sortedThirdNumber} is less than 6`);
            }

            const notTooSimilar = !tooSimilarToPrevious(draw, draw);
            const notRepeated = !xS(draw, draw);

            const isValid = firstNumberValid && secondNumberValid && thirdNumberValid &&
                notTooSimilar && notRepeated;

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

        return new Response(JSON.stringify({
            month: currentMonth,
            totalDraws,
            totalPassed: totalCorrectPredictions,
            percentage: (totalCorrectPredictions / totalDraws) * 100
        }), {
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