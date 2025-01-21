// app/api/posts/route.js
import {adminDb} from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Query the latest draw in the current month, ordered by index descending
        const drawsCollection = firestore
            .collection("draws")
            .where('drawMonth', '==', 'Jan')
            .orderBy('index', 'desc');

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
                draw.sortedFirstNumber <= 2 &&
                draw.sortedSecondNumber >= 3 && draw.sortedSecondNumber <= 6 &&
                draw.sortedThirdNumber >= 7 && draw.sortedFirstNumber!==draw.sortedSecondNumber && draw.sortedThirdNumber!==draw.sortedSecondNumber

            ) {
                totalCorrectPredictions++;
            }

            // Keep individual counts for analysis
            if(draw.sortedFirstNumber <= 2) {
                totalFirst++;
            }
            if(draw.sortedSecondNumber >= 3 && draw.sortedSecondNumber <= 6) {
                totalSecond++;
            }
            if(draw.sortedThirdNumber >= 7) {
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