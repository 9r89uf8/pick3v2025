// app/api/posts/route.js
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Function to calculate comprehensive statistics about number occurrences
function calculateNumberStatistics(numbers) {
    // Handle empty or invalid input
    if (!numbers || numbers.length === 0) {
        return [];
    }

    const indices = {};
    const totalNumbers = numbers.length; // Get total count for percentage calculation

    // First pass: record all indices where each number appears
    numbers.forEach((num, index) => {
        // Ensure the key in indices is treated consistently (e.g., as a string)
        const key = String(num);
        if (!indices[key]) {
            indices[key] = [];
        }
        indices[key].push(index);
    });

    const stats = []; // Initialize as an empty array to store result objects

    // Calculate statistics for each unique number found
    for (const [numStr, positions] of Object.entries(indices)) {
        const num = parseInt(numStr); // Convert string key back to number if needed
        const totalOccurrences = positions.length;

        // Calculate percentage of occurrences
        const occurrencesPercentage = (totalOccurrences / totalNumbers) * 100;

        // Sort positions numerically to ensure correct distance and timeSinceLast calculations
        const sortedPositions = positions.sort((a, b) => a - b);

        // Calculate distances between consecutive occurrences
        const distances = [];
        for (let i = 0; i < sortedPositions.length - 1; i++) {
            // Distance is the gap between indices
            distances.push(sortedPositions[i + 1] - sortedPositions[i]);
        }

        // Calculate average wait time (average distance between occurrences)
        let averageWaitTime = 0;
        if (distances.length > 0) {
            averageWaitTime = distances.reduce((sum, val) => sum + val, 0) / distances.length;
        } else if (totalOccurrences === 1) {
            // Handle single occurrence case - average wait is undefined/infinite
            // Set to 0, null, or totalNumbers based on desired representation
            averageWaitTime = 0; // Defaulting to 0, adjust if needed
        }

        // Calculate time since last occurrence (index of the most recent occurrence)
        // Since index 0 is the most recent item, the smallest index in sortedPositions is the most recent occurrence.
        const timeSinceLastOccurrence = sortedPositions[0];

        // Push the stats object into the results array
        stats.push({
            number: num, // Store the actual number
            totalOccurrences: totalOccurrences,
            occurrencesPercentage: occurrencesPercentage.toFixed(2), // Format percentage
            timeSinceLastOccurrence: timeSinceLastOccurrence, // Index of most recent
            averageWaitTime: averageWaitTime.toFixed(2)      // Format average wait
        });
    }

    // Optional: Sort the final stats array by number for consistent output order
    stats.sort((a, b) => a.number - b.number);

    return stats;
}

// --- Define Markov Matrices ---

// first-order Markov chain (State -> Next State Probabilities [0-6])
const firstOrderMatrix = {
    0: [0.22, 0.33, 0.08, 0.18, 0.11, 0.02, 0.05],
    1: [0.21, 0.22, 0.17, 0.17, 0.12, 0.05, 0.04],
    2: [0.23, 0.21, 0.19, 0.19, 0.08, 0.06, 0.02],
    3: [0.25, 0.19, 0.19, 0.11, 0.11, 0.06, 0.04],
    4: [0.33, 0.15, 0.24, 0.12, 0.03, 0.06, 0.00],
    5: [0.24, 0.35, 0.12, 0.06, 0.00, 0.06, 0.18],
    6: [0.15, 0.08, 0.15, 0.31, 0.23, 0.08, 0.00],
    7: [0.62, 0.00, 0.12, 0.00, 0.12, 0.12, 0.00],
    8: [1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
};

// second-order Markov chain ((Prev2, Prev1) -> Next State Probabilities [0-6])
// Using string keys "Prev2,Prev1" for clarity
const secondOrderMatrix = {
    "0,0": [0.16, 0.36, 0.11, 0.11, 0.06, 0.11, 0.06],
    "0,1": [0.11, 0.25, 0.14, 0.25, 0.11, 0.04, 0.07],
    "0,2": [0.27, 0.01, 0.01, 0.39, 0.14, 0.14, 0.01], // Note: probabilities don't sum perfectly to 1, likely rounding
    "0,3": [0.26, 0.19, 0.19, 0.01, 0.13, 0.13, 0.01],
    "0,4": [0.21, 0.11, 0.31, 0.11, 0.01, 0.11, 0.01],
    "0,5": [0.38, 0.03, 0.03, 0.03, 0.03, 0.38, 0.03],
    "0,6": [0.43, 0.02, 0.02, 0.02, 0.22, 0.22, 0.02],
    "0,7": [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 7
    "1,0": [0.18, 0.12, 0.12, 0.30, 0.12, 0.01, 0.12],
    "1,1": [0.34, 0.17, 0.23, 0.06, 0.06, 0.12, 0.01],
    "1,2": [0.22, 0.15, 0.15, 0.22, 0.08, 0.08, 0.08],
    "1,3": [0.08, 0.22, 0.22, 0.08, 0.22, 0.01, 0.08],
    "1,4": [0.41, 0.11, 0.21, 0.11, 0.01, 0.01, 0.01],
    "1,5": [0.22, 0.43, 0.02, 0.02, 0.02, 0.02, 0.22],
    "1,6": [0.03, 0.03, 0.28, 0.54, 0.03, 0.03, 0.03],
    "1,7": [0.38, 0.03, 0.03, 0.03, 0.03, 0.38, 0.03], // Assuming this is meant for state 7
    "1,8": [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 8
    "2,0": [0.32, 0.24, 0.09, 0.24, 0.09, 0.01, 0.01],
    "2,1": [0.34, 0.26, 0.01, 0.18, 0.01, 0.09, 0.01],
    "2,2": [0.19, 0.10, 0.47, 0.10, 0.01, 0.10, 0.01],
    "2,3": [0.28, 0.01, 0.10, 0.38, 0.10, 0.01, 0.01],
    "2,4": [0.02, 0.43, 0.22, 0.22, 0.02, 0.02, 0.02],
    "2,5": [0.03, 0.54, 0.28, 0.03, 0.03, 0.03, 0.03],
    "2,6": [0.05, 0.05, 0.58, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 6
    "2,7": [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 7
    "3,0": [0.22, 0.51, 0.01, 0.01, 0.22, 0.01, 0.01],
    "3,1": [0.10, 0.01, 0.19, 0.10, 0.38, 0.01, 0.10],
    "3,2": [0.31, 0.21, 0.11, 0.21, 0.11, 0.01, 0.01],
    "3,3": [0.59, 0.16, 0.01, 0.01, 0.01, 0.16, 0.01],
    "3,4": [0.30, 0.01, 0.30, 0.01, 0.16, 0.16, 0.01],
    "3,5": [0.28, 0.28, 0.03, 0.03, 0.03, 0.03, 0.28],
    "3,6": [0.03, 0.38, 0.03, 0.38, 0.03, 0.03, 0.03], // Assuming this is meant for state 6
    "3,7": [0.38, 0.03, 0.03, 0.03, 0.38, 0.03, 0.03], // Assuming this is meant for state 7
    "3,8": [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 8
    "4,0": [0.18, 0.43, 0.09, 0.18, 0.09, 0.01, 0.01],
    "4,1": [0.19, 0.36, 0.02, 0.19, 0.19, 0.02, 0.02],
    "4,2": [0.12, 0.35, 0.24, 0.01, 0.12, 0.01, 0.01],
    "4,3": [0.02, 0.22, 0.43, 0.02, 0.02, 0.02, 0.22],
    "4,4": [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Assuming this is meant for state 4
    "4,5": [0.03, 0.38, 0.38, 0.03, 0.03, 0.03, 0.03], // Assuming this is meant for state 5
    // Note: Some pairs like (5, X), (6, X), (7, X), (8, X) might be missing from the provided second-order data
    // Also, pairs like (4,6), (4,7), (4,8) etc. seem missing. The code will handle this by falling back.
};


// --- Helper Function to find the index (predicted number) with the highest probability ---
function findHighestProbIndex(probabilities) {
    if (!probabilities || probabilities.length === 0) {
        return null; // Cannot determine from empty/invalid probabilities
    }

    let maxProb = -1;
    let bestIndex = null; // Start with null

    for (let i = 0; i < probabilities.length; i++) {
        // Use 0 if probability is missing/undefined, though ideally matrices should be complete
        const currentProb = probabilities[i] === undefined ? 0 : probabilities[i];
        if (currentProb > maxProb) {
            maxProb = currentProb;
            bestIndex = i; // The index represents the predicted number (0-6)
        }
    }
    // We should always find a max probability >= 0 if the input array is valid
    return bestIndex;
}

// --- API Route ---
export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Query for the specified months
        const drawsCollection = firestore
            .collection("draws")
            .where("drawMonth", "==", 'Dec');

        const snapshot = await drawsCollection.get();
        const draws = [];

        // Assign an order to each month based on its position in the months array
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            drawData.id = doc.id; // Add the document ID to the draw data
            drawData.monthOrder = 1 // 0 for current month
            draws.push(drawData);
        });

        // Sort the combined array by 'monthOrder' and then by 'index'
        draws.sort((a, b) => {
            // Sort by 'monthOrder' first (ascending order)
            if (a.monthOrder !== b.monthOrder) {
                return a.monthOrder - b.monthOrder;
            } else {
                // If 'monthOrder' is equal, sort by 'index' in descending order
                return b.index - a.index;
            }
        });

        let totalCorrectPredictions = 0;
        let totalPredictionsMade = 0; // Count only draws where a prediction was possible

        // The original unused counters, initialize them if needed elsewhere
        let totalFirst = 0;
        let totalSecond = 0;
        let totalThird = 0;
        let totalCorrectIfAlwaysZero = 0;
        let zeroAccuracy = 0;

        draws.reverse()

        console.log(`Starting prediction analysis for ${draws.length} draws...`);

        // Loop through draws, starting from the 3rd draw (index 2)
        // because we need two previous draws for the second-order model.
        for (let i = 0; i < draws.length; i++) {
            const currentDraw = draws[i];
            const previousDraws = draws.slice(0,i);

            // Extract firstNumbers
            let firstNumbers = [];
            for (const draw of previousDraws) {
                firstNumbers.unshift(draw.sortedFirstNumber);
            }
            const numberStats = calculateNumberStatistics(firstNumbers);
            console.log(numberStats)
            let currentFirstNumber = currentDraw.sortedFirstNumber

            let previousFirstNumber1 = currentDraw.sortedPreviousFirst1

            let previousFirstNumber2 = currentDraw.sortedPreviousFirst2

            // Inside the loop where you're making predictions, add this code after the existing comparison
            if (currentFirstNumber === 0) {
                totalCorrectIfAlwaysZero++;
            }

            // --- Data Validation ---
            if (currentFirstNumber === undefined || currentFirstNumber === null ||
                previousFirstNumber1 === undefined || previousFirstNumber1 === null ||
                previousFirstNumber2 === undefined || previousFirstNumber2 === null) {
                console.warn(`Skipping draw index ${currentDraw.index || i}: Missing necessary number data.`);
                continue; // Skip this iteration if data is bad
            }

            let predictedNumber = null;

            // --- Prediction Logic ---

            // 1. Try Second-Order Model
            const secondOrderKey = `${previousFirstNumber2},${previousFirstNumber1}`;
            if (secondOrderMatrix.hasOwnProperty(secondOrderKey)) {
                const probabilities = secondOrderMatrix[secondOrderKey];
                predictedNumber = findHighestProbIndex(probabilities);
                // console.log(`Draw ${currentDraw.index || i}: Used 2nd order. Key=${secondOrderKey}. Probs=${probabilities}. Predicted=${predictedNumber}`);
            }

            // 2. Fallback to First-Order Model if second-order failed or key missing
            if (predictedNumber === null) {
                const firstOrderKey = previousFirstNumber1; // Key is just the number
                if (firstOrderMatrix.hasOwnProperty(firstOrderKey)) {
                    const probabilities = firstOrderMatrix[firstOrderKey];
                    predictedNumber = findHighestProbIndex(probabilities);
                    // console.log(`Draw ${currentDraw.index || i}: Used 1st order (fallback). Key=${firstOrderKey}. Probs=${probabilities}. Predicted=${predictedNumber}`);
                }
            }

            // --- Comparison ---
            if (predictedNumber !== null) {
                totalPredictionsMade++;
                console.log(`Draw ${currentDraw.index || i}: Prev2=${previousFirstNumber2}, Prev1=${previousFirstNumber1} -> Predicted=${predictedNumber}, Actual=${currentFirstNumber}`);
                if (predictedNumber === currentFirstNumber) {
                    totalCorrectPredictions++;
                    console.log(`   -> Correct Prediction!`);
                } else {
                    console.log(`   -> Incorrect Prediction.`);
                }
            } else {
                // This case happens if neither the 2nd order pair nor the 1st order state were found in the matrices
                console.warn(`Draw ${currentDraw.index || i}: Prev2=${previousFirstNumber2}, Prev1=${previousFirstNumber1}. Could NOT make prediction (missing state/pair in matrices?). Actual=${currentFirstNumber}`);
            }
        } // End of loop

        // After the prediction loop, calculate the "always zero" accuracy
        zeroAccuracy = totalPredictionsMade > 0 ? (totalCorrectIfAlwaysZero / totalPredictionsMade) * 100 : 0;

// Add this to your console log summary
        console.log(`If always guessing 0: ${totalCorrectIfAlwaysZero} correct (${zeroAccuracy.toFixed(2)}%)`);

        // --- Results ---
        const accuracy = totalPredictionsMade > 0 ? (totalCorrectPredictions / totalPredictionsMade) * 100 : 0;

        console.log('--- Prediction Summary ---');
        console.log('Total draws processed:', draws.length);
        console.log('Total predictions attempted:', totalPredictionsMade);
        console.log(`Total correct predictions: ${totalCorrectPredictions}`);
        console.log(`Prediction Accuracy: ${accuracy.toFixed(2)}%`);

        // Keep original counters if they serve another purpose, otherwise remove them
        console.log(`First condition met (Unused): ${totalFirst}`);
        console.log(`Second condition met (Unused): ${totalSecond}`);
        console.log(`Third condition met (Unused): ${totalThird}`);

        return new Response(JSON.stringify({
            totalDrawsInData: draws.length,
            totalPredictionsMade: totalPredictionsMade,
            totalCorrectPredictions: totalCorrectPredictions,
            accuracyPercent: parseFloat(accuracy.toFixed(2)), // Return as number
            // Include original counters if needed, or remove
            firstConditionMet: totalFirst,
            secondConditionMet: totalSecond,
            thirdConditionMet: totalThird,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error("Error in GET /api/posts:", error); // Use console.error for errors
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}