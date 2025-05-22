// app/api/posts/route.js
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    return monthNames[currentMonthIndex];
};

// Check if combination has any repeating numbers
function hasRepeatingNumbers(array) {
    return new Set(array).size !== array.length;
}

// Check if a draw contains excluded numbers (by position)
function hasExcludedNumbers(draw, excludedNumbers) {
    // Check first position
    if (excludedNumbers.first.includes(draw[0])) return true;
    // Check second position
    if (excludedNumbers.second.includes(draw[1])) return true;
    // Check third position
    if (excludedNumbers.third.includes(draw[2])) return true;
    return false;
}

// Generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate three distinct random numbers between 0 and 9
function generateThreeDistinctNumbers() {
    const numbers = new Set();
    while (numbers.size < 3) {
        numbers.add(getRandomInt(0, 9));
    }
    return Array.from(numbers);
}

// ===========================================================
// The MAIN generator that enforces the 6 permutations + no reuse in the same position
// ===========================================================
function generateDraws(latestDraw, last50Combinations, excludedNumbers = { first: [], second: [], third: [] }) {
    /*
      We want exactly 6 draws with the permutations:
         1) (L, M, H)
         2) (L, H, M)
         3) (M, L, H)
         4) (M, H, L)
         5) (H, L, M)
         6) (H, M, L)
      where:
        L is the lowest number in the draw
        M is the median number in the draw
        H is the highest number in the draw
    */

    // The 6 permutations we want to fulfill exactly once each:
    const permutations = [
        ["L", "M", "H"], // #1
        ["L", "H", "M"], // #2
        ["M", "L", "H"], // #3
        ["M", "H", "L"], // #4
        ["H", "L", "M"], // #5
        ["H", "M", "L"], // #6
    ];

    // To ensure "no two draws can have the same number in the same position":
    // We'll track used values for each column.
    const usedInPosition = [new Set(), new Set(), new Set()];

    const draws = [];
    const MAX_ATTEMPTS = 2000;
    let attempts = 0;

    // For each of the 6 permutations, we attempt to find a valid triple (a,b,c).
    // We'll do a "retry" approach if we fail to find a valid assignment.
    for (let permIndex = 0; permIndex < permutations.length; permIndex++) {
        const [pos1Cat, pos2Cat, pos3Cat] = permutations[permIndex];
        let foundValid = false;

        // We try picking random values (with a limit on attempts to avoid infinite loop).
        for (let localTry = 0; localTry < 500; localTry++) {
            // Generate three distinct random numbers
            const threeNumbers = generateThreeDistinctNumbers();

            // Sort them to determine L, M, H values
            const sortedNumbers = [...threeNumbers].sort((a, b) => a - b);
            const L = sortedNumbers[0]; // Lowest
            const M = sortedNumbers[1]; // Middle/Median
            const H = sortedNumbers[2]; // Highest

            // Create the candidate based on the permutation pattern
            let val1, val2, val3;

            // Assign the correct values based on position category
            if (pos1Cat === "L") val1 = L;
            if (pos1Cat === "M") val1 = M;
            if (pos1Cat === "H") val1 = H;

            if (pos2Cat === "L") val2 = L;
            if (pos2Cat === "M") val2 = M;
            if (pos2Cat === "H") val2 = H;

            if (pos3Cat === "L") val3 = L;
            if (pos3Cat === "M") val3 = M;
            if (pos3Cat === "H") val3 = H;

            const candidate = [val1, val2, val3];

            // Check #1: not used in the same position
            if (usedInPosition[0].has(val1)) continue;
            if (usedInPosition[1].has(val2)) continue;
            if (usedInPosition[2].has(val3)) continue;

            // Check #2: excluded numbers by position
            if (hasExcludedNumbers(candidate, excludedNumbers)) continue;

            // If we passed all checks, we accept this triple
            draws.push(candidate);

            // Mark used in each position
            usedInPosition[0].add(val1);
            usedInPosition[1].add(val2);
            usedInPosition[2].add(val3);

            foundValid = true;
            break; // break from the localTry loop
        }

        if (!foundValid) {
            // If we fail to find a valid triple for this permutation, we can either:
            // a) Throw an error
            // b) Clear everything and re-try from scratch
            // For simplicity, let's throw an error:
            throw new Error(
                `Could not find a valid assignment for permutation #${permIndex + 1} (${permutations[permIndex]})`
            );
        }

        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            throw new Error("Too many attempts while generating draws.");
        }
    }

    if (draws.length < 6) {
        throw new Error('Could not generate 6 valid draws after maximum attempts.');
    }

    return draws;
}

// Function to generate extra draws with modified constraints
function generateExtraDraws(latestDraw, last50Combinations, excludedNumbers = { first: [], second: [], third: [] }, usedPositions) {
    const extraPermutations = [
        ["L","M","H"],
        ["L","H","M"],
        ["H","L","M"]
    ];

    const numberUsage = {};
    for (let pos = 0; pos < 3; pos++) {
        for (let num of usedPositions[pos]) {
            numberUsage[num] = (numberUsage[num] || 0) + 1;
        }
    }

    const positionUsage = usedPositions.map(set => new Set(set));

    function canUseNumber(num) {
        return !numberUsage[num] || numberUsage[num] < 3;
    }

    const extraDraws = [];
    const MAX_ATTEMPTS = 1000;

    const selectedPermutations = [];
    while (selectedPermutations.length < 2) {
        const randomIndex = Math.floor(Math.random() * extraPermutations.length);
        const perm = extraPermutations[randomIndex];
        if (!selectedPermutations.some(p =>
            p[0] === perm[0] && p[1] === perm[1] && p[2] === perm[2])) {
            selectedPermutations.push(perm);
        }
    }

    for (const [pos1Cat, pos2Cat, pos3Cat] of selectedPermutations) {
        let attempts = 0;
        let foundValid = false;

        while (attempts < MAX_ATTEMPTS && !foundValid) {
            // Generate three distinct random numbers
            const threeNumbers = generateThreeDistinctNumbers();

            // Sort them to determine L, M, H values
            const sortedNumbers = [...threeNumbers].sort((a, b) => a - b);
            const L = sortedNumbers[0]; // Lowest
            const M = sortedNumbers[1]; // Middle/Median
            const H = sortedNumbers[2]; // Highest

            // Create the candidate based on the permutation pattern
            let val1, val2, val3;

            // Assign the correct values based on position category
            if (pos1Cat === "L") val1 = L;
            if (pos1Cat === "M") val1 = M;
            if (pos1Cat === "H") val1 = H;

            if (pos2Cat === "L") val2 = L;
            if (pos2Cat === "M") val2 = M;
            if (pos2Cat === "H") val2 = H;

            if (pos3Cat === "L") val3 = L;
            if (pos3Cat === "M") val3 = M;
            if (pos3Cat === "H") val3 = H;

            const candidate = [val1, val2, val3];

            // Check both position-based restrictions and overall usage
            if (!canUseNumber(val1) || !canUseNumber(val2) || !canUseNumber(val3) ||
                positionUsage[0].has(val1) || positionUsage[1].has(val2) || positionUsage[2].has(val3)) {
                attempts++;
                continue;
            }

            // Check excluded numbers
            if (hasExcludedNumbers(candidate, excludedNumbers)) {
                attempts++;
                continue;
            }

            // If all checks pass, add the draw
            extraDraws.push(candidate);

            // Update both number usage and position tracking
            numberUsage[val1] = (numberUsage[val1] || 0) + 1;
            numberUsage[val2] = (numberUsage[val2] || 0) + 1;
            numberUsage[val3] = (numberUsage[val3] || 0) + 1;

            positionUsage[0].add(val1);
            positionUsage[1].add(val2);
            positionUsage[2].add(val3);

            foundValid = true;
        }

        if (!foundValid) {
            throw new Error(`Could not generate valid extra draw after ${MAX_ATTEMPTS} attempts`);
        }
    }

    return extraDraws;
}

// Modified POST handler
export async function POST(req) {
    try {
        const excludedNumbers = { first: [], second: [], third: [] }
        let month = getCurrentMonth();
        const firestore = adminDb.firestore();

        const [latestSnapshot, last50Snapshot] = await Promise.all([
            firestore
                .collection("draws")
                .where("drawMonth", "==", month)
                .orderBy("index", "desc")
                .limit(1)
                .get(),
            firestore
                .collection("draws")
                .where("drawMonth", "==", month)
                .orderBy("index", "desc")
                .limit(50)
                .get()
        ]);

        let latestDraw = null;
        if (!latestSnapshot.empty) {
            latestDraw = latestSnapshot.docs[0].data();
        }

        const last50Combinations = last50Snapshot.docs.map(doc => {
            const data = doc.data();
            return [data.originalFirstNumber, data.originalSecondNumber, data.originalThirdNumber];
        });

        // Generate the main 6 draws
        const main6 = generateDraws(latestDraw, last50Combinations, excludedNumbers);

        // Track used positions from main6
        const usedPositions = [new Set(), new Set(), new Set()];
        main6.forEach(draw => {
            usedPositions[0].add(draw[0]);
            usedPositions[1].add(draw[1]);
            usedPositions[2].add(draw[2]);
        });

        // Generate 2 extra draws
        const extra2 = generateExtraDraws(latestDraw, last50Combinations, excludedNumbers, usedPositions);

        // Combine all draws
        const allDraws = [...main6, ...extra2];

        return new Response(JSON.stringify(allDraws), {
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