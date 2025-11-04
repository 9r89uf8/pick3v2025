// app/api/draws/count/route.js - Get total count of all draws in database
import { adminDb } from '@/app/utils/firebaseAdmin';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const firestore = adminDb.firestore();

        // Fetch all draws without any year or month restrictions
        const snapshot = await firestore
            .collection("draws")
            .get();

        const totalDraws = snapshot.size;

        return new Response(JSON.stringify({ 
            success: true,
            totalDraws: totalDraws,
            message: `Found ${totalDraws} total draws in database`
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error fetching draws count:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message,
            totalDraws: 0
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}