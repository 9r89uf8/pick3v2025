// app/api/combinations/fetch/route.js - Fetch saved combinations from Firebase
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('sortBy') || 'id'; // id, frequency, pattern, cascade
        const order = searchParams.get('order') || 'asc'; // asc, desc
        const filterPattern = searchParams.get('pattern'); // BBA, BAA, BBB, AAA
        const filterCategory = searchParams.get('category'); // never, rare, occasional, frequent
        const limit = parseInt(searchParams.get('limit') || '0'); // 0 = all
        
        const firestore = adminDb.firestore();
        
        // Build query
        let query = firestore.collection('combinations');
        
        // Add filters if specified
        if (filterPattern) {
            query = query.where('pattern', '==', filterPattern);
        }
        
        if (filterCategory) {
            query = query.where('frequency.category', '==', filterCategory);
        }
        
        // Fetch combinations
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No combinations found in database",
                    combinations: []
                }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // Process combinations
        const combinations = [];
        snapshot.forEach(doc => {
            combinations.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort combinations based on sortBy parameter
        combinations.sort((a, b) => {
            let compareValue = 0;
            
            switch (sortBy) {
                case 'frequency':
                    compareValue = (b.frequency?.count || 0) - (a.frequency?.count || 0);
                    break;
                case 'pattern':
                    compareValue = (a.pattern || '').localeCompare(b.pattern || '');
                    break;
                case 'cascade':
                    compareValue = (a.cascadeNumber || 0) - (b.cascadeNumber || 0);
                    break;
                case 'lastOccurrence':
                    // Sort by days since last occurrence (most recent first)
                    const aDays = a.frequency?.daysSinceLastOccurrence ?? Infinity;
                    const bDays = b.frequency?.daysSinceLastOccurrence ?? Infinity;
                    compareValue = aDays - bDays;
                    break;
                case 'id':
                default:
                    compareValue = (a.id || 0) - (b.id || 0);
                    break;
            }
            
            return order === 'desc' ? -compareValue : compareValue;
        });
        
        // Apply limit if specified
        const limitedCombinations = limit > 0 ? combinations.slice(0, limit) : combinations;
        
        // Get frequency analysis summary if it exists
        const statsDoc = await firestore.collection('combinationStats').doc('frequencyAnalysis').get();
        const frequencyStats = statsDoc.exists ? statsDoc.data() : null;
        
        // Calculate summary statistics
        const summary = {
            totalCombinations: combinations.length,
            hasFrequencyData: combinations.some(c => c.frequency && c.frequency.count !== undefined),
            patterns: {
                BBB: combinations.filter(c => c.pattern === 'BBB').length,
                BBA: combinations.filter(c => c.pattern === 'BBA').length,
                BAA: combinations.filter(c => c.pattern === 'BAA').length,
                AAA: combinations.filter(c => c.pattern === 'AAA').length
            },
            frequencyCategories: {
                never: combinations.filter(c => c.frequency?.category === 'never').length,
                rare: combinations.filter(c => c.frequency?.category === 'rare').length,
                occasional: combinations.filter(c => c.frequency?.category === 'occasional').length,
                frequent: combinations.filter(c => c.frequency?.category === 'frequent').length
            },
            cascadeDistribution: {}
        };
        
        // Calculate cascade distribution
        for (let i = 0; i <= 9; i++) {
            summary.cascadeDistribution[i] = combinations.filter(c => c.cascadeNumber === i).length;
        }
        
        // Find most and least frequent
        const withFrequency = combinations.filter(c => c.frequency && c.frequency.count !== undefined);
        if (withFrequency.length > 0) {
            const sortedByFreq = [...withFrequency].sort((a, b) => b.frequency.count - a.frequency.count);
            summary.mostFrequent = sortedByFreq.slice(0, 5).map(c => ({
                numbers: c.numbers || c.sortedNumbers,
                count: c.frequency.count,
                percentage: c.frequency.percentage?.toFixed(2)
            }));
            summary.leastFrequent = sortedByFreq.slice(-5).reverse().map(c => ({
                numbers: c.numbers || c.sortedNumbers,
                count: c.frequency.count,
                percentage: c.frequency.percentage?.toFixed(2)
            }));
        }
        
        return new Response(
            JSON.stringify({
                success: true,
                combinations: limitedCombinations,
                summary: summary,
                frequencyAnalysis: frequencyStats,
                query: {
                    sortBy,
                    order,
                    pattern: filterPattern,
                    category: filterCategory,
                    limit: limit || 'all',
                    returned: limitedCombinations.length
                }
            }, null, 2),
            {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0'
                }
            }
        );
        
    } catch (error) {
        console.error("Error fetching combinations:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to fetch combinations",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}