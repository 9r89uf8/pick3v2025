// app/api/display/straight/get/route.js - STRAIGHT stats retrieval
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getMonths = () => {
    const currentDate = new Date(); // Assuming current date is May 8, 2025
    const currentMonthIndex = currentDate.getMonth(); // 4 (May)

    const currentYear = currentDate.getFullYear(); // 2025

    let previousMonthIndex = currentMonthIndex - 1; // 3 (Apr)
    let previousMonthYear = currentYear; // 2025
    if (previousMonthIndex < 0) {
        previousMonthIndex = 11;
        previousMonthYear = currentYear - 1;
    }

    let twoMonthsAgoIndex = currentMonthIndex - 2; // 2 (Mar)
    let twoMonthsAgoYear = currentYear; // 2025
    if (twoMonthsAgoIndex < 0) {
        twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
        twoMonthsAgoYear = currentYear -1;
        if (twoMonthsAgoIndex < 0) { // Should not happen with 12 + index logic here for May
            twoMonthsAgoIndex = 12 + twoMonthsAgoIndex;
            twoMonthsAgoYear = currentYear -2;
        }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
        current: { month: monthNames[currentMonthIndex], year: currentYear.toString() }, // May 2025
        previous: { month: monthNames[previousMonthIndex], year: previousMonthYear.toString() }, // Apr 2025
        twoMonthsAgo: { month: monthNames[twoMonthsAgoIndex], year: twoMonthsAgoYear.toString() } // Mar 2025
    };
};

export async function GET() {
    try {
        const months = getMonths();
        const currentMonthName = months.current.month;
        const currentYearStr = months.current.year;
        const prevMonthName = months.previous.month;
        const prevMonthYearStr = months.previous.year;
        const firestore = adminDb.firestore();

        // Get the current month's short name (e.g., "Jan", "Feb", "Mar", etc.)
        const currentDate = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Current month (0-based index)
        const currentMonthIndex = currentDate.getMonth();
        const currentMonth = monthNames[currentMonthIndex];

        // Previous month, with wrap-around if currentMonth is "Jan"
        const prevMonthIndex = (currentMonthIndex + 12 - 1) % 12;
        const previousMonth = monthNames[prevMonthIndex];

        // Fetch current month stats
        const currentStatsDocId = `${currentMonthName}-${currentYearStr}--unordered`;
        const currentMonthRef = firestore.collection('drawStats').doc(currentStatsDocId);
        const currentSnap = await currentMonthRef.get();
        const currentData = currentSnap.data();

        // Fetch previous month stats
        const previousStatsDocId = `${prevMonthName}-${prevMonthYearStr}--unordered`;
        const previousMonthRef = firestore.collection('drawStats').doc(previousStatsDocId);
        const previousSnap = await previousMonthRef.get();
        const prevData = previousSnap.data();

        // If current month doc doesn't exist, throw an error or handle accordingly
        if (!currentSnap.exists) {
            return new Response(
                JSON.stringify({ error: `No stats found for ${currentMonth}.` }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Build the response object
        const responseData = {
            currentMonthStats: currentData ? {
                monthYear: currentData.monthYear,
                totalDraws: currentData.totalDraws,
                totalPassed: currentData.totalPassedConditions,
                totalFireballPassed: currentData.totalFireballPassed,
                percentage: currentData.percentageConditions,
                fireballPercentage: currentData.fireballPercentage,
                // Include new fireball stats in response:
                totalFireballSubstitutionsPassed: currentData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: currentData.totalFireballSubstitutionsChecked || 0,
                averageFireballPassesPerDraw: currentData.averageFireballPassesPerDraw || 0,
                fireballSubstitutionPassRate: currentData.fireballSubstitutionPassRate || 0
            } : null,
            previousMonthStats: prevData ? {
                monthYear: prevData.monthYear,
                totalDraws: prevData.totalDraws,
                totalPassed: prevData.totalPassedConditions,
                totalFireballPassed: prevData.totalFireballPassed,
                percentage: prevData.percentageConditions,
                fireballPercentage: prevData.fireballPercentage,
                // Include new fireball stats for previous month:
                totalFireballSubstitutionsPassed: prevData.totalFireballSubstitutionsPassed || 0,
                totalFireballSubstitutionsChecked: prevData.totalFireballSubstitutionsChecked || 0,
                averageFireballPassesPerDraw: prevData.averageFireballPassesPerDraw || 0,
                fireballSubstitutionPassRate: prevData.fireballSubstitutionPassRate || 0
            } : null,
        };

        return new Response(JSON.stringify(responseData), {
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
            headers: { 'Content-Type': 'application/json' },
        });
    }
}