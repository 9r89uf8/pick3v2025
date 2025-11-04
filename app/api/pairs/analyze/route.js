// app/api/pairs/analyze/route.js - Analyze pairs from current month's draws
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Format pair key consistently (smaller number first)
 */
const formatPairKey = (num1, num2) => {
    const [a, b] = [num1, num2].sort((x, y) => x - y);
    return `${a}-${b}`;
};

/**
 * Get current month name and year
 */
const getCurrentMonthInfo = () => {
    const now = new Date();
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return {
        month: monthNames[now.getMonth()],
        year: String(now.getFullYear()) // Convert to string to match database format
    };
};

/**
 * Analyze pairs from draws data
 */
const analyzePairs = (draws) => {
    const pairStats = {};
    const timeline = [];
    
    draws.forEach(draw => {
        const { sortedFirstNumber, sortedSecondNumber, sortedThirdNumber, drawDate } = draw;
        
        if (typeof sortedFirstNumber !== 'number' || 
            typeof sortedSecondNumber !== 'number' || 
            typeof sortedThirdNumber !== 'number') {
            return;
        }
        
        // Extract pairs from each position
        const pairs = {
            '1st & 2nd': formatPairKey(sortedFirstNumber, sortedSecondNumber),
            '1st & 3rd': formatPairKey(sortedFirstNumber, sortedThirdNumber),
            '2nd & 3rd': formatPairKey(sortedSecondNumber, sortedThirdNumber)
        };
        
        // Add to timeline
        timeline.push({
            drawDate: drawDate || 'Unknown',
            pairs,
            numbers: [sortedFirstNumber, sortedSecondNumber, sortedThirdNumber]
        });
        
        // Update pair statistics
        Object.entries(pairs).forEach(([position, pairKey]) => {
            if (!pairStats[pairKey]) {
                pairStats[pairKey] = {
                    'position_1_2': 0,
                    'position_1_3': 0,
                    'position_2_3': 0,
                    total: 0
                };
            }
            
            // Map position names to stat keys
            const positionMap = {
                '1st & 2nd': 'position_1_2',
                '1st & 3rd': 'position_1_3', 
                '2nd & 3rd': 'position_2_3'
            };
            
            pairStats[pairKey][positionMap[position]]++;
            pairStats[pairKey].total++;
        });
    });
    
    // Calculate dominant positions for each pair
    const monthlyPairs = {};
    Object.entries(pairStats).forEach(([pairKey, stats]) => {
        const positions = [
            { key: 'position_1_2', label: '1st & 2nd', count: stats.position_1_2 },
            { key: 'position_1_3', label: '1st & 3rd', count: stats.position_1_3 },
            { key: 'position_2_3', label: '2nd & 3rd', count: stats.position_2_3 }
        ];
        
        const dominant = positions.reduce((max, pos) => 
            pos.count > max.count ? pos : max
        );
        
        monthlyPairs[pairKey] = {
            position_1_2: stats.position_1_2,
            position_1_3: stats.position_1_3,
            position_2_3: stats.position_2_3,
            total: stats.total,
            dominant: dominant.label,
            percentage: stats.total > 0 ? (dominant.count / stats.total * 100) : 0
        };
    });
    
    return { monthlyPairs, timeline: timeline.reverse() }; // newest first
};

/**
 * Categorize pairs by their dominant position
 */
const categorizePairsByPosition = (monthlyPairs) => {
    const categories = {
        '1st & 2nd': [],
        '1st & 3rd': [],
        '2nd & 3rd': []
    };
    
    Object.entries(monthlyPairs).forEach(([pairKey, data]) => {
        categories[data.dominant].push({
            pair: pairKey,
            count: data[data.dominant === '1st & 2nd' ? 'position_1_2' : 
                       data.dominant === '1st & 3rd' ? 'position_1_3' : 'position_2_3'],
            percentage: data.percentage,
            total: data.total
        });
    });
    
    // Sort each category by count (descending)
    Object.keys(categories).forEach(key => {
        categories[key].sort((a, b) => b.count - a.count);
    });
    
    return categories;
};

/**
 * Main API handler
 */
export async function GET(request) {
    try {
        const firestore = adminDb.firestore();
        const { searchParams } = new URL(request.url);
        
        // Get month and year from query parameters, default to current month
        const queryMonth = searchParams.get('month');
        const queryYear = searchParams.get('year');
        
        let month, year;
        if (queryMonth && queryYear) {
            month = queryMonth;
            year = queryYear;
        } else {
            const currentInfo = getCurrentMonthInfo();
            month = currentInfo.month;
            year = currentInfo.year;
        }
        
        console.log(`Analyzing pairs for ${month} ${year}`);
        
        // Fetch current month's draws
        const snapshot = await firestore
            .collection('draws')
            .where('drawMonth', '==', month)
            .where('year', '==', year)
            .orderBy('index', 'desc')
            .get();
        
        console.log(`Found ${snapshot.size} draws for ${month} ${year}`);
        
        if (snapshot.empty) {
            return Response.json({
                success: true,
                data: {
                    monthlyPairs: {},
                    timeline: [],
                    categories: {
                        '1st & 2nd': [],
                        '1st & 3rd': [],
                        '2nd & 3rd': []
                    },
                    summary: {
                        totalDraws: 0,
                        totalPairs: 0,
                        month,
                        year
                    }
                }
            });
        }
        
        // Convert to array
        const draws = [];
        snapshot.forEach(doc => {
            draws.push({ ...doc.data(), docId: doc.id });
        });
        
        // Analyze pairs
        const { monthlyPairs, timeline } = analyzePairs(draws);
        const categories = categorizePairsByPosition(monthlyPairs);
        
        return Response.json({
            success: true,
            data: {
                monthlyPairs,
                timeline,
                categories,
                summary: {
                    totalDraws: draws.length,
                    totalPairs: Object.keys(monthlyPairs).length,
                    month,
                    year
                }
            }
        });
        
    } catch (error) {
        console.error('Error analyzing pairs:', error);
        return Response.json(
            {
                success: false,
                error: 'Failed to analyze pairs',
                details: error.message
            },
            { status: 500 }
        );
    }
}