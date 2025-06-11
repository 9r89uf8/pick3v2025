import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const firestore = adminDb.firestore();
        const drawsCollection = firestore
            .collection("draws")
            .orderBy('index', 'desc'); // Fetches draws, newest first based on index

        const snapshot = await drawsCollection.get();
        const draws = [];
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            // Ensure only the essential number fields exist before pushing
            if (drawData.originalFirstNumber !== undefined &&
                drawData.originalSecondNumber !== undefined &&
                drawData.originalThirdNumber !== undefined) {
                draws.push(drawData);
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing number fields.`);
            }
        });

        // --- Initialize trackers ---
        let originalPassingDraws = 0;

        // Function to check if a combination passes the "Sum and Flow" criteria
        function checkCombination(combination) {
            const [n1, n2, n3] = combination;

            // --- Prerequisite: Check for repeating numbers ---
            const uniqueNums = new Set(combination);
            if (uniqueNums.size !== 3) {
                return false;
            }


            // --- Rule 2: The Sequential Flow Filter ---
            const isAscending = n1 < n2 && n2 < n3;
            const isDescending = n1 > n2 && n2 > n3;

            if (isAscending || isDescending) {
                return false;
            }

            return true;
        }


        // Loop through all fetched draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let originalNums = [
                draw.originalFirstNumber,
                draw.originalSecondNumber,
                draw.originalThirdNumber
            ];


            if (checkCombination(originalNums)) {
                originalPassingDraws++;
            }
        }

        // Prepare the final result object
        const result = {
            totalDrawsFetched: draws.length,
            strategyName: "Flow",
            originalDrawsPassingStrategy: originalPassingDraws,
            percentageOfDrawsPassing: ((originalPassingDraws / draws.length) * 100).toFixed(2) + '%',
        };

        console.log("Analysis Result:", JSON.stringify(result, null, 2)); // Pretty print log

        // Return the result as a JSON response
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0', // Prevent caching
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