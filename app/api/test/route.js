import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route to fetch draws from Firestore and count how many have unique numbers.
 * It fetches draws ordered by index (newest first), checks if the three
 * sorted numbers in each draw are unique, and returns the count.
 */
export async function GET() {
    try {
        // Initialize Firestore admin instance
        const firestore = adminDb.firestore();

        // Reference to the 'draws' collection, ordered by 'index' descending
        const drawsCollection = firestore
            .collection("draws")
            .orderBy('index', 'desc'); // Fetches draws, newest first based on index

        // Get the snapshot of the draws collection
        const snapshot = await drawsCollection.get();
        const draws = []; // Array to hold valid draw data

        // Iterate over each document in the snapshot
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            // --- Data Validation ---
            // Ensure the required number fields exist before adding to the array
            if (drawData.sortedFirstNumber !== undefined &&
                drawData.sortedSecondNumber !== undefined &&
                drawData.sortedThirdNumber !== undefined) {
                draws.push(drawData);
            } else {
                // Log a warning if a draw is missing required fields
                console.warn(`Skipping draw doc ID ${doc.id} due to missing number fields.`);
            }
        });

        // --- Analysis ---
        let validDrawsAnalyzed = 0; // Counter for draws with unique numbers

        // Loop through all fetched and validated draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            // Extract the numbers into an array
            let nums = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            // --- Uniqueness Check ---
            // Create a Set from the numbers array. A Set only stores unique values.
            const uniqueNums = new Set(nums);

            // If the size of the Set is equal to the length of the original array,
            // it means all numbers were unique.
            if (uniqueNums.size === nums.length) {
                // Increment the counter for valid (unique) draws
                validDrawsAnalyzed++;
            }
            // No 'continue' needed here; the loop proceeds to the next draw
        } // End of loop through draws

        // --- Result Preparation ---
        // Prepare the final result object
        const result = {
            totalDrawsFetched: snapshot.size, // Total documents fetched initially
            validDrawsProcessed: draws.length, // Draws that had the required number fields
            uniqueNumberDraws: validDrawsAnalyzed, // Draws meeting the uniqueness criteria
        };
        // Log the analysis result to the server console (pretty-printed)
        console.log("Analysis Result:", JSON.stringify(result, null, 2));

        // --- Response ---
        // Return the result as a JSON response
        return new Response(JSON.stringify(result), {
            status: 200, // HTTP status OK
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0', // Prevent caching of the response
            },
        });
    } catch (error) {
        // --- Error Handling ---
        console.error("Error in API route:", error);
        // Return a generic error response
        return new Response(JSON.stringify({ error: "An internal server error occurred", details: error.message }), {
            status: 500, // HTTP status Internal Server Error
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
