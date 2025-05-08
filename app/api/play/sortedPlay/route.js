// app/api/posts/route.js
import { NextResponse } from 'next/server';
// import { adminDb } from '@/app/utils/firebaseAdmin'; // Not used in this version for draw generation

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Constants for B and A numbers ---
const B_NUMBERS = [0, 1, 2, 3, 4]; // Numbers <= 4
const A_NUMBERS = [5, 6, 7, 8, 9]; // Numbers >= 5

// Helper function to shuffle an array (Fisher-Yates shuffle)
// Creates a new shuffled array, does not modify the original.
function shuffle(array) {
    const newArray = [...array]; // Create a copy
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Generates a single draw of 3 numbers based on a pattern (e.g., "BBA")
 * ensuring numbers are unique within the draw and not in globallyExcludedNumbers.
 * Numbers in the draw are sorted in ascending order.
 *
 * @param {string} pattern - The pattern string, e.g., "BBA" or "BAA". Must be of length 3.
 * @param {Set<number>} globallyExcludedNumbers - A set of numbers that cannot be used.
 * @returns {number[] | null} The generated draw as an array of 3 numbers, or null if generation fails.
 */
function generateSingleDrawWithPattern(pattern, globallyExcludedNumbers) {
    const draw = [];

    // Filter B_NUMBERS and A_NUMBERS based on globallyExcludedNumbers, then shuffle them.
    // Shuffling ensures that when we pop(), we get a random available number.
    let availableB = shuffle(B_NUMBERS.filter(n => !globallyExcludedNumbers.has(n)));
    let availableA = shuffle(A_NUMBERS.filter(n => !globallyExcludedNumbers.has(n)));

    for (const type of pattern) {
        let selectedNumber = -1; // Placeholder for the chosen number

        if (type === 'B') {
            if (availableB.length > 0) {
                selectedNumber = availableB.pop(); // Get a unique B number
            } else {
                // Not enough unique B numbers available
                return null;
            }
        } else if (type === 'A') {
            if (availableA.length > 0) {
                selectedNumber = availableA.pop(); // Get a unique A number
            } else {
                // Not enough unique A numbers available
                return null;
            }
        } else {
            console.error("Invalid character in pattern:", type);
            return null;
        }
        draw.push(selectedNumber);
    }

    if (draw.length !== pattern.length) {
        console.error("Draw generation resulted in incorrect length.");
        return null;
    }

    draw.sort((a, b) => a - b); // Sort numbers from least to greatest
    return draw;
}


// --- API Route Handler ---
export async function POST(req) {
    try {
        const MAX_ATTEMPTS = 200; // Number of attempts to find a valid pair of draws
        let bbaDraw = null;
        let baaDraw = null;
        let generatedDraws = null;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            // This set will keep track of numbers used across both draws for a single attempt.
            const usedNumbersGlobally = new Set();

            // --- Attempt to generate the BBA draw ---
            bbaDraw = generateSingleDrawWithPattern("BBA", usedNumbersGlobally);

            if (!bbaDraw) {
                // If BBA draw couldn't be generated (e.g., not enough unique B numbers).
                continue; // Try a new attempt.
            }

            // --- Validate BBA draw difference condition ---
            // For BBA [B1, B2, A1], the difference B2 - B1 must be 2 or less.
            // bbaDraw is sorted: bbaDraw[0] is B1, bbaDraw[1] is B2.
            if (bbaDraw[1] - bbaDraw[0] > 2) {
                // console.log(`Attempt ${attempt + 1}: BBA draw ${bbaDraw.join(',')} failed B2-B1 <= 2 condition.`);
                bbaDraw = null; // Invalidate this bbaDraw.
                continue; // Try a new attempt for BBA.
            }

            // Add numbers from the successfully generated and validated bbaDraw to the set.
            bbaDraw.forEach(num => usedNumbersGlobally.add(num));

            // --- Attempt to generate the BAA draw ---
            // Numbers from the valid bbaDraw are now in usedNumbersGlobally.
            baaDraw = generateSingleDrawWithPattern("BAA", usedNumbersGlobally);

            if (!baaDraw) {
                // If BAA draw failed, it means the numbers chosen for BBA draw
                // (even if it met its own criteria) didn't leave enough valid options for BAA.
                // console.log(`Attempt ${attempt + 1}: BAA draw generation failed after BBA ${bbaDraw ? bbaDraw.join(',') : 'N/A'}.`);
                bbaDraw = null; // Invalidate bbaDraw for this attempt.
                continue; // Try a new attempt for both draws.
            }

            // --- Validate BAA draw difference condition ---
            // For BAA [B1, A1, A2], the difference A2 - A1 must be 2 or less.
            // baaDraw is sorted: baaDraw[1] is A1, baaDraw[2] is A2.
            if (baaDraw[2] - baaDraw[1] > 2) {
                // console.log(`Attempt ${attempt + 1}: BAA draw ${baaDraw.join(',')} failed A2-A1 <= 2 condition (BBA was ${bbaDraw.join(',')}).`);
                bbaDraw = null; // Invalidate bbaDraw.
                baaDraw = null; // Invalidate this baaDraw.
                continue; // Try a new attempt for both.
            }

            // If both draws are successfully generated and meet all conditions
            generatedDraws = [bbaDraw, baaDraw];
            // console.log(`Attempt ${attempt + 1}: Successfully generated draws: BBA ${bbaDraw.join(',')}, BAA ${baaDraw.join(',')}`);
            break; // Exit loop, solution found.
        }

        if (!generatedDraws) {
            // If after MAX_ATTEMPTS, no valid pair of draws was found.
            console.error(`Failed to generate unique draws satisfying all conditions after ${MAX_ATTEMPTS} attempts.`);
            return NextResponse.json(
                { error: "Could not generate the required draws. The system might be under high load or constraints are too tight. Please try again." },
                { status: 500 }
            );
        }

        // If successful, generatedDraws will contain [bbaDraw, baaDraw]
        return NextResponse.json(generatedDraws, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (error) {
        // Log the full error for server-side debugging
        console.error("Error in POST handler:", error.message, error.stack);
        return NextResponse.json(
            { error: "An internal server error occurred while generating draws.", details: error.message },
            { status: 500 }
        );
    }
}
