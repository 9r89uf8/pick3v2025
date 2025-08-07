// app/api/pair-analysis/monthly-tracker/route.js - Track specific pairs (0,1), (1,2), (2,3) by month
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define the specific pairs we're tracking
const TRACKED_PAIRS = [
    { first: 0, second: 1, key: '0-1', combinations: 9 },
    { first: 1, second: 2, key: '1-2', combinations: 8 },
    { first: 2, second: 3, key: '2-3', combinations: 7 },
    { first: 0, second: 2, key: '0-2', combinations: 8 },
    { first: 1, second: 3, key: '1-3', combinations: 7 }
];

export async function POST(request) {
    try {
        const body = await request.json();
        const { month, year } = body;

        if (!month || !year) {
            return new Response(JSON.stringify({ 
                success: false,
                error: 'Missing required parameters: month and year'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const firestore = adminDb.firestore();
        
        // Fetch all draws for the specified month and year
        console.log(`Fetching draws for ${month} ${year}...`);
        const snapshot = await firestore
            .collection('draws')
            .where('drawMonth', '==', month)
            .where('year', '==', year)
            .orderBy('index', 'desc')
            .get();
        
        console.log(`Found ${snapshot.size} draws for ${month} ${year}`);
        
        // Initialize tracking for each pair
        const pairResults = TRACKED_PAIRS.map(pair => ({
            ...pair,
            count: 0,
            percentage: 0,
            combinations: new Map(), // Track unique combinations
            drawDates: [] // Track dates for each occurrence
        }));
        
        // Process each draw
        snapshot.forEach(doc => {
            const draw = doc.data();
            
            // Only process draws with valid sorted numbers
            if (typeof draw.sortedFirstNumber === 'number' &&
                typeof draw.sortedSecondNumber === 'number' &&
                typeof draw.sortedThirdNumber === 'number' &&
                draw.sortedFirstNumber >= 0 && draw.sortedFirstNumber <= 9 &&
                draw.sortedSecondNumber >= 0 && draw.sortedSecondNumber <= 9 &&
                draw.sortedThirdNumber >= 0 && draw.sortedThirdNumber <= 9) {
                
                const sortedNumbers = [
                    draw.sortedFirstNumber,
                    draw.sortedSecondNumber,
                    draw.sortedThirdNumber
                ].sort((a, b) => a - b);
                
                // Check each tracked pair
                pairResults.forEach(pairResult => {
                    // Check if the first two sorted numbers match the pair exactly
                    const containsPair = sortedNumbers[0] === pairResult.first && 
                                        sortedNumbers[1] === pairResult.second;
                    
                    if (containsPair) {
                        pairResult.count++;
                        
                        // Create combination string
                        const comboKey = sortedNumbers.join('-');
                        
                        // Track the combination and its dates
                        if (!pairResult.combinations.has(comboKey)) {
                            pairResult.combinations.set(comboKey, {
                                combo: comboKey,
                                numbers: sortedNumbers,
                                dates: [],
                                count: 0
                            });
                        }
                        
                        const combo = pairResult.combinations.get(comboKey);
                        combo.count++;
                        
                        // Create date string
                        const date = draw.date || `${month} ${draw.day || draw.index}, ${year}`;
                        combo.dates.push(date);
                        pairResult.drawDates.push({
                            date: date,
                            combination: comboKey,
                            index: draw.index
                        });
                    }
                });
            }
        });
        
        // Calculate percentages and format results
        const totalDraws = snapshot.size;
        const formattedResults = pairResults.map(pairResult => {
            // Convert Map to array and sort by count
            const combinationsArray = Array.from(pairResult.combinations.values())
                .sort((a, b) => b.count - a.count);
            
            return {
                pair: pairResult.key,
                first: pairResult.first,
                second: pairResult.second,
                possibleCombinations: pairResult.combinations,
                count: pairResult.count,
                percentage: totalDraws > 0 ? ((pairResult.count / totalDraws) * 100).toFixed(2) : 0,
                combinations: combinationsArray,
                totalUniqueCombinations: combinationsArray.length,
                drawDates: pairResult.drawDates.sort((a, b) => b.index - a.index)
            };
        });
        
        // Sort by count (highest first)
        formattedResults.sort((a, b) => b.count - a.count);
        
        // Calculate summary statistics
        const totalPairOccurrences = formattedResults.reduce((sum, pair) => sum + pair.count, 0);
        const averageOccurrence = totalPairOccurrences / TRACKED_PAIRS.length;
        const mostActivePair = formattedResults[0];
        const leastActivePair = formattedResults[formattedResults.length - 1];
        
        // Find which combinations appeared most across all pairs
        const allCombinations = new Map();
        formattedResults.forEach(pair => {
            pair.combinations.forEach(combo => {
                if (!allCombinations.has(combo.combo)) {
                    allCombinations.set(combo.combo, {
                        combo: combo.combo,
                        totalCount: 0,
                        pairs: []
                    });
                }
                const comboData = allCombinations.get(combo.combo);
                comboData.totalCount += combo.count;
                comboData.pairs.push(pair.pair);
            });
        });
        
        const topCombinations = Array.from(allCombinations.values())
            .sort((a, b) => b.totalCount - a.totalCount)
            .slice(0, 5);
        
        const result = {
            success: true,
            month: month,
            year: year,
            totalDraws: totalDraws,
            pairs: formattedResults,
            summary: {
                totalPairOccurrences: totalPairOccurrences,
                averageOccurrencePerPair: averageOccurrence.toFixed(1),
                coveragePercentage: totalDraws > 0 ? ((totalPairOccurrences / totalDraws) * 100).toFixed(2) : 0,
                mostActivePair: mostActivePair ? {
                    pair: mostActivePair.pair,
                    count: mostActivePair.count,
                    percentage: mostActivePair.percentage
                } : null,
                leastActivePair: leastActivePair ? {
                    pair: leastActivePair.pair,
                    count: leastActivePair.count,
                    percentage: leastActivePair.percentage
                } : null,
                topCombinations: topCombinations,
                analysisDate: new Date().toISOString()
            }
        };
        
        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
        
    } catch (error) {
        console.error("Error in monthly pair tracking:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to track monthly pairs",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// GET endpoint to fetch current month data by default
export async function GET() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear().toString();
    
    // Create a mock request with current month/year
    const mockRequest = {
        json: async () => ({ month: currentMonth, year: currentYear })
    };
    
    return POST(mockRequest);
}