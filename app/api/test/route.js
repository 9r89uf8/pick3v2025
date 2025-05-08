import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route to fetch draws from Firestore.
 * It counts unique number draws, their A/B distributions,
 * calculates the percentage of total processed draws for each unique distribution,
 * counts specific differences for BBA and BAA distributions,
 * and counts draws with differences of 2 or less for BBA and BAA.
 */
export async function GET() {
    try {
        // Initialize Firestore admin instance
        const firestore = adminDb.firestore();

        // Reference to the 'draws' collection, ordered by 'index' descending
        const drawsCollection = firestore
            .collection("draws")
            // .where('year', '==', '2025') // Example filter, uncomment and modify as needed
            // .where("drawMonth", "==", 'Mar') // Example filter, uncomment and modify as needed
            .orderBy('index', 'desc'); // Fetches draws, newest first based on index

        // Get the snapshot of the draws collection
        const snapshot = await drawsCollection.get();
        const draws = []; // Array to hold valid draw data

        // Iterate over each document in the snapshot
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            // --- Data Validation ---
            // Ensure all required number fields are present and are numbers
            if (typeof drawData.sortedFirstNumber === 'number' &&
                typeof drawData.sortedSecondNumber === 'number' &&
                typeof drawData.sortedThirdNumber === 'number') {
                draws.push(drawData);
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing or invalid number fields.`);
            }
        });

        // --- Analysis ---
        let uniqueNumberDrawsCount = 0;

        let countBBB = 0;
        let countBBA = 0;
        let countBAA = 0;
        let countAAA = 0;

        // Initialize objects to store counts of differences for BBA and BAA distributions
        const bbaDifferenceCounts = {}; // Stores { difference: count } for BBA
        const baaDifferenceCounts = {}; // Stores { difference: count } for BAA

        // Initialize counters for differences of 2 or less
        let bbaDifferenceTwoOrLessCount = 0;
        let baaDifferenceTwoOrLessCount = 0;

        // Loop through all fetched and validated draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let nums = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            // Check if all three numbers in the draw are unique
            const uniqueNums = new Set(nums);
            if (uniqueNums.size === nums.length) {
                uniqueNumberDrawsCount++; // Increment count of draws with unique numbers

                let countA_inDraw = 0; // Count of 'A' numbers (num > 4) in the current draw
                let countB_inDraw = 0; // Count of 'B' numbers (num <= 4) in the current draw

                // Determine A/B category for each number in the draw
                for (const num of nums) {
                    if (num <= 4) { // 'B' numbers are 1, 2, 3, 4
                        countB_inDraw++;
                    } else { // 'A' numbers are 5, 6, 7, 8
                        countA_inDraw++;
                    }
                }

                // Categorize the draw based on A/B counts and calculate differences
                if (countB_inDraw === 3) { // BBB distribution (e.g., 1,2,3)
                    countBBB++;
                } else if (countB_inDraw === 2 && countA_inDraw === 1) { // BBA distribution (e.g., 1,2,5)
                    countBBA++;
                    // sortedFirstNum and sortedSecondNum are 'B', sortedThirdNum is 'A'
                    // Calculate difference between the two 'B' numbers (sortedSecondNumber - sortedFirstNumber)
                    const difference = draw.sortedSecondNumber - draw.sortedFirstNumber;
                    bbaDifferenceCounts[difference] = (bbaDifferenceCounts[difference] || 0) + 1;
                    // Check if the difference is 2 or less
                    if (difference <= 2) {
                        bbaDifferenceTwoOrLessCount++;
                    }
                } else if (countB_inDraw === 1 && countA_inDraw === 2) { // BAA distribution (e.g., 1,5,6)
                    countBAA++;
                    // sortedFirstNum is 'B', sortedSecondNum and sortedThirdNum are 'A'
                    // Calculate difference between the two 'A' numbers (sortedThirdNumber - sortedSecondNumber)
                    const difference = draw.sortedThirdNumber - draw.sortedSecondNumber;
                    baaDifferenceCounts[difference] = (baaDifferenceCounts[difference] || 0) + 1;
                    // Check if the difference is 2 or less
                    if (difference <= 2) {
                        baaDifferenceTwoOrLessCount++;
                    }
                } else if (countA_inDraw === 3) { // AAA distribution (e.g., 5,6,7)
                    countAAA++;
                }
            }
        } // End of loop through draws

        // --- Percentage Calculation ---
        // Denominator for percentages is the total number of draws that were processed (had valid fields)
        const denominatorForPercentage = draws.length;
        let percentageBBB = 0;
        let percentageBBA = 0;
        let percentageBAA = 0;
        let percentageAAA = 0;

        if (denominatorForPercentage > 0) {
            percentageBBB = (countBBB / denominatorForPercentage) * 100;
            percentageBBA = (countBBA / denominatorForPercentage) * 100;
            percentageBAA = (countBAA / denominatorForPercentage) * 100;
            percentageAAA = (countAAA / denominatorForPercentage) * 100;
        }

        // --- Result Preparation ---
        const result = {
            totalDrawsFetched: snapshot.size,
            validDrawsProcessed: denominatorForPercentage,
            uniqueNumberDraws: uniqueNumberDrawsCount,
            distributionCountsForUniqueDraws: {
                BBB: countBBB,
                BBA: countBBA,
                BAA: countBAA,
                AAA: countAAA,
            },
            bbaDifferences: bbaDifferenceCounts,
            baaDifferences: baaDifferenceCounts,
            // Add the new counts for differences of 2 or less
            bbaDifferenceTwoOrLessCount: `${bbaDifferenceTwoOrLessCount}----${(bbaDifferenceTwoOrLessCount / denominatorForPercentage) * 100}`,
            baaDifferenceTwoOrLessCount: `${baaDifferenceTwoOrLessCount}----${(baaDifferenceTwoOrLessCount / denominatorForPercentage) * 100}`,
            distributionPercentagesOfTotalProcessed: { // Percentages based on total valid draws processed
                BBB: percentageBBB, // e.g., (countBBB / validDrawsProcessed) * 100
                BBA: percentageBBA,
                BAA: percentageBAA,
                AAA: percentageAAA,
            }
        };
        console.log("Analysis Result:", JSON.stringify(result, null, 2)); // For server-side logging if needed

        // --- Response ---
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0', // Disable caching for dynamic data
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

