// app/api/posts/route.js
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Get the current month's short name (e.g., "Jan", "Feb", "Mar", etc.)
        const currentDate = new Date();
        const currentMonthIndex = currentDate.getMonth(); // 0-11
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = monthNames[currentMonthIndex];

        // Fetch the document corresponding to the current month in drawStats
        const docRef = firestore.collection('drawStats').doc(currentMonth);
        const docSnap = await docRef.get();

        // If the document exists, return its data. Otherwise, return an error message.
        if (!docSnap.exists) {
            return new Response(JSON.stringify({ error: `No stats found for ${currentMonth}.` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const stats = docSnap.data();

        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
