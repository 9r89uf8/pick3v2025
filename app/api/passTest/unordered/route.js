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
            // Ensure the required fields exist before pushing
            if (drawData.originalFirstNumber !== undefined &&
                drawData.originalSecondNumber !== undefined &&
                drawData.originalThirdNumber !== undefined) {
                draws.push(drawData);
            } else {
                console.warn(`Skipping draw doc ID ${doc.id} due to missing number fields.`);
            }
        });

        let validDrawsAnalyzed = 0; // Count draws meeting the criteria
        let distributions = {
            LMH: 0, LHM: 0, MLH: 0,
            MHL: 0, HLM: 0, HML: 0
        };

        let movementDistributions = {
            BUB: 0, BBU: 0, UBB: 0, UBU: 0
        };

        // Initialize counters for L, M, and H positions
        let lPositions = { firstPosition: 0, secondPosition: 0, thirdPosition: 0 };
        let mPositions = { firstPosition: 0, secondPosition: 0, thirdPosition: 0 };
        let hPositions = { firstPosition: 0, secondPosition: 0, thirdPosition: 0 };

        // Loop through all fetched draws
        for (let i = 0; i < draws.length; i++) {
            let draw = draws[i];
            let nums = [
                draw.originalFirstNumber,
                draw.originalSecondNumber,
                draw.originalThirdNumber
            ];

            // --- Condition 1: Check for repeating numbers ---
            const uniqueNums = new Set(nums);
            if (uniqueNums.size !== nums.length) {
                continue; // Skip this draw if it contains duplicates
            }

            // --- Movement Distribution Analysis ---
            let movementPattern = "";
            for (let num of nums) {
                if (num >= 0 && num <= 4) {
                    movementPattern += "B";
                } else if (num >= 5 && num <= 9) {
                    movementPattern += "U";
                }
            }

            // Increment the counter for this pattern if it exists in our object
            if (movementDistributions.hasOwnProperty(movementPattern)) {
                movementDistributions[movementPattern]++;
            }

            // --- Condition 2: Determine L, M, H based on relative values ---
            // Pair numbers with their original positions (0, 1, 2)
            const indexedNums = [
                { value: nums[0], originalIndex: 0 },
                { value: nums[1], originalIndex: 1 },
                { value: nums[2], originalIndex: 2 }
            ];

            // Sort by value to find Lowest (L), Middle (M), Highest (H)
            const sortedNums = [...indexedNums].sort((a, b) => a.value - b.value);
            // sortedNums[0] is L, sortedNums[1] is M, sortedNums[2] is H

            // Determine the pattern based on the *original* positions of L, M, H
            let patternArray = ['', '', '']; // Represents [pos1, pos2, pos3]
            patternArray[sortedNums[0].originalIndex] = 'L'; // Place L in its original slot
            patternArray[sortedNums[1].originalIndex] = 'M'; // Place M in its original slot
            patternArray[sortedNums[2].originalIndex] = 'H'; // Place H in its original slot
            const pattern = patternArray.join(''); // e.g., "MHL", "LMH"

            // Check if the generated pattern is one of the expected 6 (it always should be if nums are unique)
            if (distributions.hasOwnProperty(pattern)) {
                distributions[pattern]++; // Increment count for this pattern

                // --- Track L, M, and H positions ---
                // The pattern string itself tells us the position:
                // pattern[0] is the label (L/M/H) for the first original number
                // pattern[1] is the label for the second original number
                // pattern[2] is the label for the third original number

                // L position
                const lIndex = pattern.indexOf('L');
                if (lIndex === 0) lPositions.firstPosition++;
                else if (lIndex === 1) lPositions.secondPosition++;
                else if (lIndex === 2) lPositions.thirdPosition++;

                // M position
                const mIndex = pattern.indexOf('M');
                if (mIndex === 0) mPositions.firstPosition++;
                else if (mIndex === 1) mPositions.secondPosition++;
                else if (mIndex === 2) mPositions.thirdPosition++;

                // H position
                const hIndex = pattern.indexOf('H');
                if (hIndex === 0) hPositions.firstPosition++;
                else if (hIndex === 1) hPositions.secondPosition++;
                else if (hIndex === 2) hPositions.thirdPosition++;

                validDrawsAnalyzed++; // Increment count of valid draws analyzed

            } else {
                // This case should theoretically not happen if numbers are unique
                console.warn(`Generated unexpected pattern: ${pattern} for draw ${nums}. Skipping count.`);
            }
        } // End of loop through draws

        // Prepare the final result object
        const result = {
            totalDrawsFetched: draws.length,
            validDrawsAnalyzed: validDrawsAnalyzed, // Draws meeting uniqueness criteria
            definition: "L=Lowest, M=Middle, H=Highest number in draw", // Added definition for clarity
            distributions: distributions,
            lPositions: lPositions,
            mPositions: mPositions,
            hPositions: hPositions,
            movementDefinition: "B=Below range (0-4), U=Upper range (5-9)",
            movementDistributions: movementDistributions
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