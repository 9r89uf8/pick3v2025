import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route to fetch draws from Firestore.
 * It counts draws that pass the following criteria:
 * - No repeating numbers
 * - sortedFirstNumber is 0, 1, or 2
 * - sortedThirdNumber is 7, 8, or 9
 * - Draw is either BBA or BAA
 * - For BBA: difference between sortedSecondNumber and sortedFirstNumber is 2 or less
 * - For BAA: difference between sortedThirdNumber and sortedSecondNumber is 2 or less
 * Added fireball analysis: checks if replacing any number with the fireball passes the criteria
 */
export async function GET() {
    try {
        // Initialize Firestore admin instance
        const firestore = adminDb.firestore();

        // Reference to the 'draws' collection, ordered by 'index' descending
        const drawsCollection = firestore
            .collection("draws")
            .where('year', '==', '2025') // Example filter, uncomment and modify as needed
            .where("drawMonth", "==", 'Apr') // Example filter, uncomment and modify as needed
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
                typeof drawData.sortedThirdNumber === 'number' &&
                typeof drawData.fireball === 'number') {
                draws.push(drawData);
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing or invalid number fields.`);
            }
        });

        // --- Analysis ---
        let passCount = 0;
        let countBBA = 0;
        let countBAA = 0;

        // Fireball analysis
        let fireballPassCount = 0;
        let fireballCountBBA = 0;
        let fireballCountBAA = 0;

        // Loop through all fetched and validated draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let nums = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ];

            let fireball = draw.fireball;
            let drawPassesWithoutFireball = false;
            let drawPassesWithFireball = false;

            // --- REGULAR DRAW ANALYSIS (without fireball) ---
            // Check if all three numbers in the draw are unique
            const uniqueNums = new Set(nums);
            if (uniqueNums.size === nums.length) {
                // Check if sortedFirstNumber is 0, 1, or 2
                if (draw.sortedFirstNumber === 0 || draw.sortedFirstNumber === 1 || draw.sortedFirstNumber === 2) {
                    // Check if sortedThirdNumber is 7, 8, or 9
                    if (draw.sortedThirdNumber === 7 || draw.sortedThirdNumber === 8 || draw.sortedThirdNumber === 9) {
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

                        // Check if the draw is either BBA or BAA and apply the new criteria
                        if (countB_inDraw === 2 && countA_inDraw === 1) { // BBA
                            // New criteria: difference between sortedSecondNumber and sortedFirstNumber is 2 or less
                            if (draw.sortedSecondNumber - draw.sortedFirstNumber <= 2) {
                                passCount++;
                                drawPassesWithoutFireball = true;
                                countBBA++;
                            }
                        } else if (countB_inDraw === 1 && countA_inDraw === 2) { // BAA
                            // New criteria: difference between sortedThirdNumber and sortedSecondNumber is 2 or less
                            if (draw.sortedThirdNumber - draw.sortedSecondNumber <= 2) {
                                passCount++;
                                drawPassesWithoutFireball = true;
                                countBAA++;
                            }
                        }
                    }
                }
            }

            // --- FIREBALL ANALYSIS ---
            // Try replacing each position with the fireball and check if any variant passes
            for (let pos = 0; pos < 3; pos++) {
                // Create a new array with the fireball replacing one position
                let fireballNums = [...nums];
                fireballNums[pos] = fireball;

                // Skip if this creates duplicates
                const uniqueFireballNums = new Set(fireballNums);
                if (uniqueFireballNums.size !== 3) continue;

                // Sort the new numbers to determine positions
                let sortedFireballNums = [...fireballNums].sort((a, b) => a - b);
                let sortedFirstWithFireball = sortedFireballNums[0];
                let sortedSecondWithFireball = sortedFireballNums[1];
                let sortedThirdWithFireball = sortedFireballNums[2];

                // Check the criteria with fireball substitution
                // Check if sortedFirstNumber is 0, 1, or 2
                if (sortedFirstWithFireball === 0 || sortedFirstWithFireball === 1 || sortedFirstWithFireball === 2) {
                    // Check if sortedThirdNumber is 7, 8, or 9
                    if (sortedThirdWithFireball === 7 || sortedThirdWithFireball === 8 || sortedThirdWithFireball === 9) {
                        let countA_inFireballDraw = 0;
                        let countB_inFireballDraw = 0;

                        // Determine A/B category for each number in the fireball draw
                        for (const num of sortedFireballNums) {
                            if (num <= 4) { // 'B' numbers
                                countB_inFireballDraw++;
                            } else { // 'A' numbers
                                countA_inFireballDraw++;
                            }
                        }

                        // Check if the fireball draw is either BBA or BAA with the new criteria
                        if (countB_inFireballDraw === 2 && countA_inFireballDraw === 1) { // BBA
                            // New criteria: difference between sortedSecond and sortedFirst is 2 or less
                            if (sortedSecondWithFireball - sortedFirstWithFireball <= 2) {
                                // Only count each draw once, even if multiple fireball positions pass
                                if (!drawPassesWithFireball && !drawPassesWithoutFireball) {
                                    fireballPassCount++;
                                    drawPassesWithFireball = true;
                                    fireballCountBBA++;
                                }
                            }
                        } else if (countB_inFireballDraw === 1 && countA_inFireballDraw === 2) { // BAA
                            // New criteria: difference between sortedThird and sortedSecond is 2 or less
                            if (sortedThirdWithFireball - sortedSecondWithFireball <= 2) {
                                // Only count each draw once, even if multiple fireball positions pass
                                if (!drawPassesWithFireball && !drawPassesWithoutFireball) {
                                    fireballPassCount++;
                                    drawPassesWithFireball = true;
                                    fireballCountBAA++;
                                }
                            }
                        }
                    }
                }
            }
        } // End of loop through draws

        // --- Result Preparation ---
        const result = {
            totalDrawsFetched: snapshot.size,
            validDrawsProcessed: draws.length,
            regularAnalysis: {
                passCount: passCount,
                distributionCounts: {
                    BBA: countBBA,
                    BAA: countBAA,
                }
            },
            fireballAnalysis: {
                passCount: fireballPassCount,
                distributionCounts: {
                    BBA: fireballCountBBA,
                    BAA: fireballCountBAA,
                },
                note: "Counts only draws that didn't already pass the regular analysis"
            },
            totalPassCount: passCount + fireballPassCount,
        };
        console.log("Analysis Result:", JSON.stringify(result, null, 2));

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