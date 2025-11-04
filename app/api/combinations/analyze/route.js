// app/api/combinations/analyze/route.js - Analyze combination frequencies in historical draws
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Analyzes how often each combination appears in historical draws
 */
export async function POST(request) {
    try {
        const firestore = adminDb.firestore();
        
        // Fetch all saved combinations
        console.log('Fetching saved combinations...');
        const combinationsSnapshot = await firestore.collection('combinations').get();
        
        if (combinationsSnapshot.empty) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No combinations found. Please generate and save combinations first."
                }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // Fetch all historical draws
        console.log('Fetching historical draws...');
        const drawsSnapshot = await firestore
            .collection('draws')
            .orderBy('index', 'desc')
            .get();
        
        console.log(`Analyzing ${combinationsSnapshot.size} combinations against ${drawsSnapshot.size} draws...`);
        
        // Create maps for quick draw lookup - one for full combinations, one for first-two
        const drawsMap = new Map();
        const firstTwoMap = new Map();
        const monthlyDrawCounts = {};
        let totalValidDraws = 0;
        
        drawsSnapshot.forEach(doc => {
            const draw = doc.data();
            
            // Validate draw has required fields
            if (typeof draw.sortedFirstNumber === 'number' &&
                typeof draw.sortedSecondNumber === 'number' &&
                typeof draw.sortedThirdNumber === 'number') {
                
                // Full combination key
                const fullKey = `${draw.sortedFirstNumber}-${draw.sortedSecondNumber}-${draw.sortedThirdNumber}`;
                
                if (!drawsMap.has(fullKey)) {
                    drawsMap.set(fullKey, {
                        count: 0,
                        occurrences: []
                    });
                }
                
                const drawData = drawsMap.get(fullKey);
                drawData.count++;
                drawData.occurrences.push({
                    date: draw.drawDate || null,
                    month: draw.drawMonth || null,
                    year: draw.year || null,
                    index: draw.index || null,
                    time: draw.time || null
                });
                
                // First-two numbers key
                const firstTwoKey = `${draw.sortedFirstNumber}-${draw.sortedSecondNumber}`;
                
                if (!firstTwoMap.has(firstTwoKey)) {
                    firstTwoMap.set(firstTwoKey, {
                        count: 0,
                        occurrences: [],
                        thirdNumbers: new Set() // Track which third numbers appeared with this pair
                    });
                }
                
                const firstTwoData = firstTwoMap.get(firstTwoKey);
                firstTwoData.count++;
                firstTwoData.thirdNumbers.add(draw.sortedThirdNumber);
                firstTwoData.occurrences.push({
                    date: draw.drawDate || null,
                    month: draw.drawMonth || null,
                    year: draw.year || null,
                    index: draw.index || null,
                    time: draw.time || null,
                    thirdNumber: draw.sortedThirdNumber
                });
                
                // Track monthly counts
                if (draw.drawMonth && draw.year) {
                    const monthKey = `${draw.drawMonth}-${draw.year}`;
                    monthlyDrawCounts[monthKey] = (monthlyDrawCounts[monthKey] || 0) + 1;
                }
                
                totalValidDraws++;
            }
        });
        
        console.log(`Found ${totalValidDraws} valid draws with ${drawsMap.size} unique combinations`);
        console.log(`Found ${firstTwoMap.size} unique first-two combinations`);
        
        // Batch update combinations with frequency data
        const batch = firestore.batch();
        let updateCount = 0;
        const analysisResults = [];
        
        // Calculate frequency for each combination
        combinationsSnapshot.forEach(doc => {
            const combo = doc.data();
            const sortedNumbers = combo.sortedNumbers || combo.numbers;
            
            if (Array.isArray(sortedNumbers) && sortedNumbers.length === 3) {
                const fullKey = sortedNumbers.join('-');
                const firstTwoKey = `${sortedNumbers[0]}-${sortedNumbers[1]}`;
                
                const drawData = drawsMap.get(fullKey) || { count: 0, occurrences: [] };
                const firstTwoData = firstTwoMap.get(firstTwoKey) || { count: 0, occurrences: [], thirdNumbers: new Set() };
                
                // Calculate full combination statistics
                const frequency = {
                    count: drawData.count,
                    percentage: totalValidDraws > 0 ? (drawData.count / totalValidDraws) * 100 : 0,
                    occurrences: drawData.occurrences.slice(0, 10), // Keep last 10 occurrences
                    lastOccurrence: null,
                    daysSinceLastOccurrence: null,
                    monthlyBreakdown: {},
                    category: 'never',
                    isHot: false,
                    isCold: false
                };
                
                // Calculate first-two numbers statistics
                const firstTwoFrequency = {
                    count: firstTwoData.count,
                    percentage: totalValidDraws > 0 ? (firstTwoData.count / totalValidDraws) * 100 : 0,
                    occurrences: firstTwoData.occurrences.slice(0, 10), // Keep last 10 occurrences
                    lastOccurrence: null,
                    daysSinceLastOccurrence: null,
                    monthlyBreakdown: {},
                    category: 'never',
                    isHot: false,
                    isCold: false,
                    uniqueThirdNumbers: firstTwoData.thirdNumbers ? firstTwoData.thirdNumbers.size : 0,
                    relativeToFull: drawData.count > 0 ? firstTwoData.count / drawData.count : 0
                };
                
                // Process full combination occurrences
                if (drawData.occurrences.length > 0) {
                    // Sort occurrences by date (most recent first)
                    drawData.occurrences.sort((a, b) => {
                        if (b.index && a.index) return b.index - a.index;
                        return 0;
                    });
                    
                    // Get last occurrence
                    const lastOcc = drawData.occurrences[0];
                    frequency.lastOccurrence = lastOcc.date;
                    
                    // Calculate days since last occurrence (approximate)
                    if (lastOcc.date) {
                        const today = new Date();
                        const lastDate = new Date(); // This would need proper date parsing
                        // For now, use index as a proxy for recency
                        frequency.daysSinceLastOccurrence = totalValidDraws - (lastOcc.index || totalValidDraws);
                    }
                    
                    // Monthly breakdown
                    drawData.occurrences.forEach(occ => {
                        if (occ.month && occ.year) {
                            const monthKey = `${occ.month}-${occ.year}`;
                            frequency.monthlyBreakdown[monthKey] = (frequency.monthlyBreakdown[monthKey] || 0) + 1;
                        }
                    });
                }
                
                // Process first-two occurrences
                if (firstTwoData.occurrences.length > 0) {
                    // Sort occurrences by date (most recent first)
                    firstTwoData.occurrences.sort((a, b) => {
                        if (b.index && a.index) return b.index - a.index;
                        return 0;
                    });
                    
                    // Get last occurrence
                    const lastOcc = firstTwoData.occurrences[0];
                    firstTwoFrequency.lastOccurrence = lastOcc.date;
                    
                    // Calculate days since last occurrence (approximate)
                    if (lastOcc.date) {
                        // For now, use index as a proxy for recency
                        firstTwoFrequency.daysSinceLastOccurrence = totalValidDraws - (lastOcc.index || totalValidDraws);
                    }
                    
                    // Monthly breakdown
                    firstTwoData.occurrences.forEach(occ => {
                        if (occ.month && occ.year) {
                            const monthKey = `${occ.month}-${occ.year}`;
                            firstTwoFrequency.monthlyBreakdown[monthKey] = (firstTwoFrequency.monthlyBreakdown[monthKey] || 0) + 1;
                        }
                    });
                }
                
                // Categorize full frequency
                if (frequency.count === 0) {
                    frequency.category = 'never';
                } else if (frequency.count === 1) {
                    frequency.category = 'rare';
                } else if (frequency.count <= 5) {
                    frequency.category = 'occasional';
                } else {
                    frequency.category = 'frequent';
                }
                
                // Categorize first-two frequency (usually higher counts)
                if (firstTwoFrequency.count === 0) {
                    firstTwoFrequency.category = 'never';
                } else if (firstTwoFrequency.count <= 3) {
                    firstTwoFrequency.category = 'rare';
                } else if (firstTwoFrequency.count <= 10) {
                    firstTwoFrequency.category = 'occasional';
                } else {
                    firstTwoFrequency.category = 'frequent';
                }
                
                // Hot/Cold analysis for full combination
                frequency.isHot = frequency.count > (totalValidDraws * 0.01); // More than 1% of draws
                frequency.isCold = frequency.daysSinceLastOccurrence > 100; // Not drawn in last 100 draws
                
                // Hot/Cold analysis for first-two (adjusted thresholds)
                firstTwoFrequency.isHot = firstTwoFrequency.count > (totalValidDraws * 0.02); // More than 2% of draws
                firstTwoFrequency.isCold = firstTwoFrequency.daysSinceLastOccurrence > 50; // Not drawn in last 50 draws
                
                // Update document with both frequency types
                batch.update(doc.ref, {
                    frequency: frequency,
                    firstTwoFrequency: firstTwoFrequency,
                    lastAnalyzed: adminDb.firestore.FieldValue.serverTimestamp()
                });
                
                updateCount++;
                
                // Collect results for response
                analysisResults.push({
                    id: doc.id,
                    numbers: sortedNumbers,
                    pattern: combo.pattern,
                    cascadeNumber: combo.cascadeNumber,
                    frequency: frequency,
                    firstTwoFrequency: firstTwoFrequency
                });
            }
        });
        
        // Commit batch update
        await batch.commit();
        console.log(`Updated ${updateCount} combinations with frequency data`);
        
        // Calculate summary statistics
        const summary = {
            totalCombinations: combinationsSnapshot.size,
            totalDrawsAnalyzed: totalValidDraws,
            uniqueDrawnCombinations: drawsMap.size,
            combinationsUpdated: updateCount,
            frequencyDistribution: {
                never: analysisResults.filter(r => r.frequency.category === 'never').length,
                rare: analysisResults.filter(r => r.frequency.category === 'rare').length,
                occasional: analysisResults.filter(r => r.frequency.category === 'occasional').length,
                frequent: analysisResults.filter(r => r.frequency.category === 'frequent').length
            },
            mostFrequent: analysisResults
                .sort((a, b) => b.frequency.count - a.frequency.count)
                .slice(0, 10)
                .map(r => ({
                    numbers: r.numbers,
                    count: r.frequency.count,
                    percentage: r.frequency.percentage.toFixed(2)
                })),
            neverDrawn: analysisResults
                .filter(r => r.frequency.count === 0)
                .length,
            hotCombinations: analysisResults.filter(r => r.frequency.isHot).length,
            coldCombinations: analysisResults.filter(r => r.frequency.isCold).length,
            // First-two frequency statistics
            firstTwoStats: {
                totalUniquePairs: firstTwoMap.size,
                frequencyDistribution: {
                    never: analysisResults.filter(r => r.firstTwoFrequency.category === 'never').length,
                    rare: analysisResults.filter(r => r.firstTwoFrequency.category === 'rare').length,
                    occasional: analysisResults.filter(r => r.firstTwoFrequency.category === 'occasional').length,
                    frequent: analysisResults.filter(r => r.firstTwoFrequency.category === 'frequent').length
                },
                mostFrequentPairs: analysisResults
                    .sort((a, b) => b.firstTwoFrequency.count - a.firstTwoFrequency.count)
                    .slice(0, 10)
                    .map(r => ({
                        firstTwo: r.numbers.slice(0, 2),
                        count: r.firstTwoFrequency.count,
                        percentage: r.firstTwoFrequency.percentage.toFixed(2),
                        uniqueThirds: r.firstTwoFrequency.uniqueThirdNumbers
                    })),
                hotPairs: analysisResults.filter(r => r.firstTwoFrequency.isHot).length,
                coldPairs: analysisResults.filter(r => r.firstTwoFrequency.isCold).length
            }
        };
        
        // Save summary to separate document
        await firestore.collection('combinationStats').doc('frequencyAnalysis').set({
            ...summary,
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        });
        
        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully analyzed ${updateCount} combinations`,
                summary: summary,
                timestamp: new Date().toISOString()
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
    } catch (error) {
        console.error("Error analyzing combination frequencies:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to analyze frequencies",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}