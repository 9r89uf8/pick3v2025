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


export async function GET() {
    try {
        const months = getMonths(2); // Get the current month and the previous month
        const firestore = adminDb.firestore();

        // Query for the specified months
        const drawsCollection = firestore
            .collection("draws")
            .where('year', '==', '2025')
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
        let firstNumbersF = [];
        for (const draw of draws) {
            firstNumbers.push(draw.originalDraw);
        }

        // --- START: Calculate Percentage for sortedFirstNumber in range 0-1 ---
        let countInRange = 0;
        const totalDraws = draws.length; // Get total number of draws for the month

        for (const draw of draws) {
            // Check if sortedFirstNumber exists and is within the 0-1 range
            if (typeof draw.sortedFirstNumber === 'number' && draw.sortedFirstNumber === 1) {
                countInRange++;
            }
        }

        // Calculate percentage, handle division by zero if no draws exist
        const percentageInRange = totalDraws > 0 ? (countInRange / totalDraws) * 100 : 0;
        // --- END: Calculation ---

        console.log(firstNumbersF);
        // Calculate comprehensive statistics for each number
        // const numberStats = calculateNumberStatistics(firstNumbers);

        // Add statistics to the response
        const response = {
            draws: draws,
            percentageFirstNumber0to1: percentageInRange.toFixed(2) // Format to 2 decimal places
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
