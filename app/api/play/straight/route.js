// app/api/play/straight/route.js - STRAIGHT play generation
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Constants for B and A numbers ---
const B_NUMBERS = [0, 1, 2, 3, 4]; // Numbers <= 4
const A_NUMBERS = [5, 6, 7, 8, 9]; // Numbers >= 5

// All valid patterns for STRAIGHT bets (2:1 ratio patterns)
const VALID_PATTERNS = ['BBA', 'BAB', 'ABB', 'BAA', 'ABA', 'AAB'];

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Gets positions of matching categories in a pattern
 * @param {string} pattern - The pattern string (e.g., "BBA")
 * @returns {number[][]} An array of position pairs, e.g., [[0, 1]]
 */
function getMatchingPositions(pattern) {
    const positions = [];
    for (let i = 0; i < pattern.length; i++) {
        for (let j = i + 1; j < pattern.length; j++) {
            if (pattern[i] === pattern[j]) {
                positions.push([i, j]);
            }
        }
    }
    return positions;
}

/**
 * Validates difference rule for a draw based on its pattern.
 * Returns true if the draw passes the difference <= 2 rule for the numbers in the same category.
 * @param {number[]} draw - The generated draw, e.g., [3, 4, 8]
 * @param {string} pattern - The pattern string, e.g., "BBA"
 * @returns {boolean} True if the difference rule is satisfied.
 */
function validateDifference(draw, pattern) {
    const matchingPos = getMatchingPositions(pattern);
    if (matchingPos.length === 1) {
        const [pos1, pos2] = matchingPos[0];
        const diff = Math.abs(draw[pos1] - draw[pos2]);
        return diff <= 2;
    }
    return true; // No matching pair to validate, so it's valid by default.
}

/**
 * Generates a single STRAIGHT draw for a given pattern, ensuring numbers are unique
 * across all previously generated draws for their respective positions.
 *
 * @param {string} pattern - The pattern string (e.g., "BBA")
 * @param {Set<number>[]} usedInAllPositions - An array of Sets, where each Set tracks used numbers for a position (0, 1, or 2).
 * @returns {number[] | null} The generated draw or null if generation fails.
 */
function generateStraightDrawWithPattern(pattern, usedInAllPositions) {
    const MAX_ATTEMPTS_PER_PATTERN = 100;

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PATTERN; attempt++) {
        const draw = [];
        const usedInThisDraw = new Set(); // Tracks numbers used only within this single draw

        // Fresh shuffled copies for this attempt
        let availableB = shuffle([...B_NUMBERS]);
        let availableA = shuffle([...A_NUMBERS]);

        let success = true;
        // Loop with an index to know which position (0, 1, or 2) we are filling
        for (let i = 0; i < pattern.length; i++) {
            const type = pattern[i];
            const usedInThisPosition = usedInAllPositions[i]; // The set of numbers already used in this column
            let selectedNumber = -1;

            if (type === 'B') {
                // Find a B number that is not used in this draw AND not used in this position globally
                const unusedB = availableB.find(n => !usedInThisDraw.has(n) && !usedInThisPosition.has(n));
                if (unusedB !== undefined) {
                    selectedNumber = unusedB;
                } else {
                    success = false;
                    break;
                }
            } else if (type === 'A') {
                // Find an A number that is not used in this draw AND not used in this position globally
                const unusedA = availableA.find(n => !usedInThisDraw.has(n) && !usedInThisPosition.has(n));
                if (unusedA !== undefined) {
                    selectedNumber = unusedA;
                } else {
                    success = false;
                    break;
                }
            }

            draw.push(selectedNumber);
            usedInThisDraw.add(selectedNumber);
        }

        if (!success || draw.length !== 3) {
            continue; // Try again if we couldn't find unique numbers
        }

        // Validate the difference rule
        if (validateDifference(draw, pattern)) {
            return draw; // Success! Return the draw.
        }
    }

    // console.warn(`Failed to generate a valid draw for pattern "${pattern}" considering cross-draw uniqueness.`);
    return null; // Failed to generate a valid draw for this pattern.
}

// --- API Route Handler ---
export async function POST(req) {
    const MAX_TOTAL_ATTEMPTS = 50; // Max attempts to generate the entire set of 6 draws

    try {
        for (let attempt = 0; attempt < MAX_TOTAL_ATTEMPTS; attempt++) {
            const tempResults = [];
            // Keep track of used numbers for each position (column) across all draws
            const usedInAllPositions = [new Set(), new Set(), new Set()];
            let allPatternsGenerated = true;

            // Shuffle patterns on each attempt to avoid getting stuck in a failing sequence
            const shuffledPatterns = shuffle([...VALID_PATTERNS]);

            for (const pattern of shuffledPatterns) {
                const draw = generateStraightDrawWithPattern(pattern, usedInAllPositions);

                if (draw) {
                    // Store the draw with its pattern to re-order later
                    tempResults.push({ pattern, draw });
                    // IMPORTANT: Update the sets of used numbers for each position
                    usedInAllPositions[0].add(draw[0]);
                    usedInAllPositions[1].add(draw[1]);
                    usedInAllPositions[2].add(draw[2]);
                } else {
                    // If any pattern fails, this entire attempt is invalid.
                    allPatternsGenerated = false;
                    break; // Break the inner loop and start a new main attempt
                }
            }

            // If we successfully generated all patterns in this attempt
            if (allPatternsGenerated) {
                // Re-order the results to match the original VALID_PATTERNS order
                const finalDraws = VALID_PATTERNS.map(p => {
                    const found = tempResults.find(res => res.pattern === p);
                    return found.draw;
                });

                console.log("Successfully generated straight bet draws:", finalDraws);
                return NextResponse.json(finalDraws, {
                    status: 200,
                    headers: { 'Cache-Control': 'no-store, max-age=0' },
                });
            }
            // If not successful, the outer loop will continue to the next attempt
        }

        // If we exit the loop after all attempts, we have failed.
        console.error(`Failed to generate a valid set of draws after ${MAX_TOTAL_ATTEMPTS} attempts.`);
        return NextResponse.json(
            { error: "Could not generate all required draws due to uniqueness constraints." },
            { status: 500 }
        );

    } catch (error) {
        console.error("Error in POST handler:", error.message, error.stack);
        return NextResponse.json(
            {
                error: "An internal server error occurred while generating draws.",
                details: error.message
            },
            { status: 500 }
        );
    }
}