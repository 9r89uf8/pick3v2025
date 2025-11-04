// app/api/favorites/monthly-analysis/route.js - Analyze favorites performance by month
import { adminDb } from '@/app/utils/firebaseAdmin';
import { NextRequest } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { month, year, favorites } = body;

        if (!month || !year || !favorites || !Array.isArray(favorites)) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'Missing required parameters: month, year, and favorites array'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const firestore = adminDb.firestore();

        // Fetch all draws for the specified month and year
        const drawsSnapshot = await firestore
            .collection("draws")
            .where('drawMonth', '==', month)
            .where('year', '==', year)
            .orderBy('index', 'desc')
            .get();

        const draws = [];
        drawsSnapshot.forEach((doc) => {
            const data = doc.data();
            draws.push({
                id: doc.id,
                date: data.date || `${year}-${month}-${data.index}`,
                sortedNumbers: [data.sortedFirstNumber, data.sortedSecondNumber, data.sortedThirdNumber],
                originalNumbers: [data.originalFirstNumber, data.originalSecondNumber, data.originalThirdNumber],
                index: data.index,
                fireball: data.fireball
            });
        });

        // Analyze which favorites appeared in the draws
        const results = [];
        let totalHits = 0;

        favorites.forEach(favorite => {
            const combo = favorite.combination;
            const hitDates = [];
            const hitIndices = [];
            
            draws.forEach(draw => {
                // Check if the combination matches the sorted numbers
                const sortedCombo = [...combo].sort((a, b) => a - b);
                const drawSorted = [...draw.sortedNumbers].sort((a, b) => a - b);
                
                if (sortedCombo[0] === drawSorted[0] && 
                    sortedCombo[1] === drawSorted[1] && 
                    sortedCombo[2] === drawSorted[2]) {
                    hitDates.push(draw.date);
                    hitIndices.push(draw.index);
                    totalHits++;
                }
            });

            if (hitDates.length > 0) {
                results.push({
                    combination: combo,
                    combinationString: combo.join('-'),
                    pattern: favorite.pattern,
                    hitCount: hitDates.length,
                    dates: hitDates,
                    indices: hitIndices,
                    monthlyHitRate: ((hitDates.length / draws.length) * 100).toFixed(2)
                });
            }
        });

        // Sort results by hit count (highest first)
        results.sort((a, b) => b.hitCount - a.hitCount);

        // Calculate overall statistics
        const favoritesHit = results.length;
        const hitRate = favorites.length > 0 ? ((favoritesHit / favorites.length) * 100).toFixed(2) : 0;
        const drawsCovered = [...new Set(results.flatMap(r => r.indices))].length;
        const drawCoverage = draws.length > 0 ? ((drawsCovered / draws.length) * 100).toFixed(2) : 0;

        return new Response(JSON.stringify({ 
            success: true,
            month,
            year,
            totalDraws: draws.length,
            totalFavorites: favorites.length,
            favoritesHit,
            hitRate: parseFloat(hitRate),
            totalHits,
            drawsCovered,
            drawCoverage: parseFloat(drawCoverage),
            results,
            summary: {
                bestPerformer: results[0] || null,
                message: `${favoritesHit} of ${favorites.length} favorites appeared in ${month} ${year}`
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error analyzing monthly favorites:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}