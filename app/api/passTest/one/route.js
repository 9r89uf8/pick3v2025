// app/api/posts/route.js
import {adminDb} from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


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

    // Create an array of all previous combinations
    const prevCombinations = [prev1, prev2, prev3, prev4, prev5, prev6, prev7, prev8];

    // Check if current matches any previous combination
    found = prevCombinations.some(prev =>
        prev[0] === current[0] &&
        prev[1] === current[1] &&
        prev[2] === current[2]
    );

    return found;
}


function tooSimilarToPrevious(combination, latestDraw) {
    let found = false;
    const c = [combination.sortedFirstNumber, combination.sortedSecondNumber, combination.sortedThirdNumber];

    // previous1
    if (c[0] === latestDraw.sortedPreviousFirst1 && c[1] === latestDraw.sortedPreviousSecond1) found = true;
    if (c[0] === latestDraw.sortedPreviousFirst1 && c[2] === latestDraw.sortedPreviousThird1) found = true;
    if (c[1] === latestDraw.sortedPreviousSecond1 && c[2] === latestDraw.sortedPreviousThird1) found = true;

    // previous2
    if (c[0] === latestDraw.sortedPreviousFirst2 && c[1] === latestDraw.sortedPreviousSecond2) found = true;
    if (c[0] === latestDraw.sortedPreviousFirst2 && c[2] === latestDraw.sortedPreviousThird2) found = true;
    if (c[1] === latestDraw.sortedPreviousSecond2 && c[2] === latestDraw.sortedPreviousThird2) found = true;

    // previous3
    // if (c[0] === latestDraw.sortedPreviousFirst3 && c[1] === latestDraw.sortedPreviousSecond3) found = true;
    // if (c[0] === latestDraw.sortedPreviousFirst3 && c[2] === latestDraw.sortedPreviousThird3) found = true;
    // if (c[1] === latestDraw.sortedPreviousSecond3 && c[2] === latestDraw.sortedPreviousThird3) found = true;

    return found;
}
export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Query the latest draw in the current month, ordered by index descending
        const drawsCollection = firestore
            .collection("draws")

        const snapshot = await drawsCollection.get();
        const draws = [];

        // Assign an order to each month based on its position in the months array
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            draws.push(drawData);
        });

        let totalCorrectPredictions = 0
        let totalDraws = 0
        let totalFirst = 0
        let totalSecond = 0
        let totalThird = 0

        for (let i = 1; i < draws.length; i++) {
            let draw = draws[i];

            // Check if all conditions are met simultaneously
            if (
                draw.sortedFirstNumber <= 4 &&
                draw.sortedSecondNumber >= 2 && draw.sortedSecondNumber <= 7 &&
                draw.sortedThirdNumber >= 5 && draw.sortedFirstNumber!==draw.sortedSecondNumber && draw.sortedThirdNumber!==draw.sortedSecondNumber

            ) {
                totalCorrectPredictions++;
            }

            // Keep individual counts for analysis
            if(draw.sortedFirstNumber <= 4) {
                totalFirst++;
            }
            if(draw.sortedSecondNumber >= 2 && draw.sortedSecondNumber <= 7) {
                totalSecond++;
            }
            if(draw.sortedThirdNumber >= 5) {
                totalThird++;
            }
        }

        console.log('Total draws:', draws.length)
        console.log(`All conditions met:  ${totalCorrectPredictions} or ${totalCorrectPredictions/draws.length*100}`)
        console.log(`First condition met: ${totalFirst}`)
        console.log(`Second condition met: ${totalSecond}`)
        console.log(`Third condition met: ${totalThird}`)

        return new Response(JSON.stringify({
            totalDraws: draws.length,
            allConditionsMet: totalCorrectPredictions,
            firstConditionMet: totalFirst,
            secondConditionMet: totalSecond,
            thirdConditionMet: totalThird
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