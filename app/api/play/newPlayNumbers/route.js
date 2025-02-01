// app/api/posts/route.js
// 36 possible combinations (3 x 4 x 3)
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getMonths = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    let twoMonthsAgoIndex;
    let previousMonthIndex;

    if (currentMonthIndex === 0) {  // January
        twoMonthsAgoIndex = 10;     // November of the previous year
        previousMonthIndex = 11;    // December of the previous year
    } else if (currentMonthIndex === 1) {  // February
        twoMonthsAgoIndex = 11;     // December of the previous year
        previousMonthIndex = 0;     // January
    } else {
        twoMonthsAgoIndex = currentMonthIndex - 2;
        previousMonthIndex = currentMonthIndex - 1;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [monthNames[previousMonthIndex], monthNames[currentMonthIndex], monthNames[twoMonthsAgoIndex]];
};

function isExcluded(num, position, excludedNumbers) {
    if (position === 0) return excludedNumbers.first.includes(num);
    if (position === 1) return excludedNumbers.second.includes(num);
    if (position === 2) return excludedNumbers.third.includes(num);
    return false;
}

// Helper: Shuffle an array in place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Pre-generate all possible combinations based on the allowed ranges
function generateAllCombinations(excludedNumbers) {
    const combinations = [];
    // first: 0-2, second: 3-6, third: 7-9
    for (let first = 0; first < 3; first++) {
        if (isExcluded(first, 0, excludedNumbers)) continue;
        for (let second = 3; second < 7; second++) {
            if (isExcluded(second, 1, excludedNumbers)) continue;
            for (let third = 7; third < 10; third++) {
                if (isExcluded(third, 2, excludedNumbers)) continue;
                // The ranges are disjoint so the numbers are always distinct and in ascending order.
                combinations.push([first, second, third]);
            }
        }
    }
    return combinations;
}

// Generate draws by selecting from the pre-generated pool while enforcing positional uniqueness
function generateDraws(numberOfDraws = 5, latestDraw, excludedNumbers) {
    // Generate the full pool of valid combinations
    let pool = generateAllCombinations(excludedNumbers);
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
        const [prevMonth, currentMonth] = getMonths();
        const firestore = adminDb.firestore();
        const { excludedNumbers = { first: [], second: [], third: [] } } = await req.json();

        // Query for current and previous month
        const drawsCollection = firestore
            .collection("draws")
            .where("drawMonth", "in", [currentMonth, prevMonth]);

        const snapshot = await drawsCollection.get();

        if (snapshot.empty) {
            return new Response(JSON.stringify({ error: "No draws found." }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const allDraws = [];

        // First pass: collect all draws with monthOrder
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            drawData.id = doc.id;
            drawData.monthOrder = drawData.drawMonth === currentMonth ? 1 : 2;
            allDraws.push(drawData);
        });

        // Sort draws by monthOrder and index
        allDraws.sort((a, b) => {
            if (a.monthOrder !== b.monthOrder) {
                return a.monthOrder - b.monthOrder;
            }
            return b.index - a.index;
        });

        const draws = allDraws.slice(0, 4);

        // Generate new draws using the pre-generated combination approach.
        const drawsS = generateDraws(3, draws[0], excludedNumbers);

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
