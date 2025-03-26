// app/api/posts/route.js
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getMonths = (n) => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-11 (January is 0, December is 11)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const months = [];
    for (let i = 0; i < n; i++) {
        // Calculate the month index for i months ago
        let monthIndex = (currentMonthIndex - i + 12) % 12;
        months.push(monthNames[monthIndex]);
    }
    return months; // Months are in reverse chronological order
};

// Function to calculate comprehensive statistics about number occurrences
function calculateNumberStatistics(numbers) {
    const indices = {};
    const stats = [];

    // First pass: record all indices where each number appears
    numbers.forEach((num, index) => {
        if (!indices[num]) {
            indices[num] = [];
        }
        indices[num].push(index);
    });

    // Calculate statistics for each number
    for (const [num, positions] of Object.entries(indices)) {
        // Calculate distances between consecutive occurrences
        const distances = [];
        for (let i = 0; i < positions.length - 1; i++) {
            distances.push(positions[i + 1] - positions[i]);
        }

        // Calculate average wait time (if applicable)
        let averageWaitTime = 0;
        if (distances.length > 0) {
            averageWaitTime = distances.reduce((sum, val) => sum + val, 0) / distances.length;
        }

        // Calculate time since last occurrence (position 0 is the most recent)
        const timeSinceLastOccurrence = positions[0];

        stats[num] = {
            totalOccurrences: positions.length,
            timeSinceLastOccurrence: timeSinceLastOccurrence,
            averageWaitTime: averageWaitTime.toFixed(2), // Round to 2 decimal places
            recurrenceDistances: distances.length > 0 ? distances : ["Only occurs once"]
        };
    }

    return stats;
}

export async function GET() {
    try {
        const months = getMonths(1); // Get the current month and the previous month
        const firestore = adminDb.firestore();

        // Query for the specified months
        const drawsCollection = firestore
            .collection("draws")
            .where("drawMonth", "in", months);

        const snapshot = await drawsCollection.get();
        const draws = [];

        // Assign an order to each month based on its position in the months array
        snapshot.forEach((doc) => {
            const drawData = doc.data();
            drawData.id = doc.id; // Add the document ID to the draw data
            drawData.monthOrder = months.indexOf(drawData.drawMonth); // 0 for current month
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

        // Extract firstNumbers
        let firstNumbers = [];
        for (const draw of draws) {
            firstNumbers.push(draw.sortedFirstNumber);
        }

        // Calculate comprehensive statistics for each number
        const numberStats = calculateNumberStatistics(firstNumbers);

        // Add statistics to the response
        const response = {
            draws: draws,
            numberStats: numberStats
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.log(error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
