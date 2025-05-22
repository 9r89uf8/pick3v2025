// app/api/posts/route.js
// Dynamic combinations where middle number is between first and last
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper: Shuffle an array in place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Pre-generate all possible combinations based on the allowed ranges
function generateAllCombinations() {
    const combinations = [];
    // first: 0-2, third: 7-9, second: between first and third
    for (let first = 0; first < 3; first++) {
        for (let third = 7; third < 10; third++) {
            // Middle number must be between first and third (exclusive)
            for (let second = first + 1; second < third; second++) {
                combinations.push([first, second, third]);
            }
        }
    }
    return combinations;
}

// Generate draws by selecting from the pre-generated pool while enforcing positional uniqueness
function generateDraws(numberOfDraws = 5) {
    // Generate the full pool of valid combinations
    let pool = generateAllCombinations();
    // Shuffle the pool to ensure randomness
    pool = shuffle(pool);

    const selectedDraws = [];

    // Sets to track used numbers in each position across the selected draws.
    const usedFirstNumbers = new Set();
    const usedSecondNumbers = new Set();
    const usedThirdNumbers = new Set();

    // Loop until we have the desired number of draws or run out of valid candidates.
    while (selectedDraws.length < numberOfDraws && pool.length > 0) {
        // Find the index of the first candidate that doesn't conflict with previously used numbers.
        const candidateIndex = pool.findIndex(draw => {
            const [first, second, third] = draw;
            return !usedFirstNumbers.has(first) &&
                !usedSecondNumbers.has(second) &&
                !usedThirdNumbers.has(third);
        });

        if (candidateIndex === -1) {
            // No candidate found that satisfies the positional uniqueness requirement.
            break;
        }

        // Select the candidate and remove it from the pool.
        const candidate = pool[candidateIndex];
        pool.splice(candidateIndex, 1);
        selectedDraws.push(candidate);

        // Mark the numbers as used in their respective positions.
        usedFirstNumbers.add(candidate[0]);
        usedSecondNumbers.add(candidate[1]);
        usedThirdNumbers.add(candidate[2]);

        // Optionally, filter the pool to remove any draws that conflict with these used numbers.
        pool = pool.filter(draw => {
            const [first, second, third] = draw;
            return !usedFirstNumbers.has(first) &&
                !usedSecondNumbers.has(second) &&
                !usedThirdNumbers.has(third);
        });
    }

    return selectedDraws;
}

// Modified POST handler
export async function POST(req) {
    try {
        // Generate new draws using the pre-generated combination approach.
        const drawsS = generateDraws(3);

        return new Response(JSON.stringify(drawsS), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error(error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }
}