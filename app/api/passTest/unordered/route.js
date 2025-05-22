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
            // Ensure all required fields exist before pushing
            if (drawData.originalFirstNumber !== undefined &&
                drawData.originalSecondNumber !== undefined &&
                drawData.originalThirdNumber !== undefined &&
                drawData.fireball !== undefined) {
                draws.push(drawData);
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing number fields or fireball.`);
            }
        });

        // Track statistics
        let originalPassingDraws = 0;
        let totalPassingCombinations = 0;
        let drawsWithAtLeastOnePass = 0;

        // Function to check if a combination passes the criteria
        function checkCombination(combination) {
            // --- Condition 1: Check for repeating numbers ---
            const uniqueNums = new Set(combination);
            if (uniqueNums.size !== combination.length) {
                return false; // Combination fails if it has duplicates
            }

            // --- Condition 2 & 3: Check for numbers in specific ranges ---
            let hasNumberInRange0to2 = false;
            let hasNumberInRange7to9 = false;

            for (const num of combination) {
                if (num >= 0 && num <= 2) {
                    hasNumberInRange0to2 = true;
                }
                if (num >= 7 && num <= 9) {
                    hasNumberInRange7to9 = true;
                }
            }

            // Pass only if both range conditions are met
            return hasNumberInRange0to2 && hasNumberInRange7to9;
        }

        // Loop through all fetched draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let originalNums = [
                draw.originalFirstNumber,
                draw.originalSecondNumber,
                draw.originalThirdNumber
            ];
            let fireballNum = draw.fireball;

            // Check if original combination passes
            const originalPasses = checkCombination(originalNums);
            if (originalPasses) {
                originalPassingDraws++;
            }

            // Generate all combinations (original + 3 replacements with fireball)
            let allCombinations = [
                [...originalNums], // Original combination
                [fireballNum, originalNums[1], originalNums[2]], // Replace first number
                [originalNums[0], fireballNum, originalNums[2]], // Replace second number
                [originalNums[0], originalNums[1], fireballNum]  // Replace third number
            ];

            let passingCombinationsForThisDraw = 0;

            // Check each combination
            for (const combination of allCombinations) {
                if (checkCombination(combination)) {
                    passingCombinationsForThisDraw++;
                    totalPassingCombinations++;
                }
            }

            // If at least one combination passes, increment the draw counter
            if (passingCombinationsForThisDraw > 0) {
                drawsWithAtLeastOnePass++;
            }
        }

        // Prepare the final result object
        const result = {
            totalDrawsFetched: draws.length,
            originalPassingDraws: originalPassingDraws,
            totalPassingCombinations: totalPassingCombinations,
            drawsWithAtLeastOnePass: drawsWithAtLeastOnePass,
            percentageOfDrawsWithPass: ((drawsWithAtLeastOnePass / draws.length) * 100).toFixed(2) + '%'
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