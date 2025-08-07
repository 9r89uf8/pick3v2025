// app/api/combinations/check-history/route.js - Check historical occurrences of combinations
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const { numbers } = await request.json();
        
        if (!numbers || !Array.isArray(numbers) || numbers.length === 0 || numbers.length > 3) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Please provide 1-3 numbers to check"
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const firestore = adminDb.firestore();
        
        // Get the last 3 months of draws
        const currentDate = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const months = [];
        
        for (let i = 0; i < 3; i++) {
            const monthIndex = (currentDate.getMonth() - i + 12) % 12;
            months.push(monthNames[monthIndex]);
        }

        const drawsSnapshot = await firestore
            .collection('draws')
            .where('year', '==', '2025')
            .where('drawMonth', 'in', months)
            .orderBy('index', 'desc')
            .get();

        const results = {
            numbers: numbers,
            pattern: getPattern(numbers),
            partialMatches: [],
            fullMatches: [],
            statistics: {
                firstNumber: null,
                firstTwo: null,
                fullCombination: null
            },
            monthlyBreakdown: {},
            recentOccurrences: []
        };

        const totalDraws = drawsSnapshot.size;
        let firstNumberCount = 0;
        let firstTwoCount = 0;
        let fullComboCount = 0;

        drawsSnapshot.forEach(doc => {
            const draw = doc.data();
            const drawNumbers = [
                draw.sortedFirstNumber,
                draw.sortedSecondNumber,
                draw.sortedThirdNumber
            ].filter(n => typeof n === 'number');

            if (drawNumbers.length !== 3) return;

            // Check for matches based on how many numbers are selected
            let matchLevel = 0;
            
            if (numbers.length >= 1 && drawNumbers[0] === numbers[0]) {
                matchLevel = 1;
                firstNumberCount++;
            }
            
            if (numbers.length >= 2 && matchLevel === 1 && drawNumbers[1] === numbers[1]) {
                matchLevel = 2;
                firstTwoCount++;
            }
            
            if (numbers.length === 3 && matchLevel === 2 && drawNumbers[2] === numbers[2]) {
                matchLevel = 3;
                fullComboCount++;
            }

            // Store match details
            if (matchLevel > 0) {
                const occurrence = {
                    date: draw.drawDate || 'Unknown',
                    month: draw.drawMonth,
                    year: draw.year,
                    numbers: drawNumbers,
                    matchLevel: matchLevel,
                    time: draw.time || 'Unknown',
                    fireball: draw.fireball,
                    index: draw.index
                };

                if (matchLevel === numbers.length) {
                    results.fullMatches.push(occurrence);
                } else if (matchLevel > 0) {
                    results.partialMatches.push(occurrence);
                }

                // Track monthly breakdown
                const monthKey = `${draw.drawMonth}-${draw.year}`;
                if (!results.monthlyBreakdown[monthKey]) {
                    results.monthlyBreakdown[monthKey] = {
                        partial: 0,
                        full: 0,
                        dates: []
                    };
                }
                
                if (matchLevel === numbers.length) {
                    results.monthlyBreakdown[monthKey].full++;
                    results.monthlyBreakdown[monthKey].dates.push(draw.drawDate);
                } else {
                    results.monthlyBreakdown[monthKey].partial++;
                }
            }
        });

        // Calculate statistics
        if (numbers.length >= 1) {
            results.statistics.firstNumber = {
                count: firstNumberCount,
                percentage: ((firstNumberCount / totalDraws) * 100).toFixed(2),
                frequency: firstNumberCount > 0 ? `${firstNumberCount} times in ${totalDraws} draws` : 'Never appeared',
                lastSeen: results.fullMatches.length > 0 || results.partialMatches.length > 0 
                    ? (results.fullMatches[0] || results.partialMatches[0]).date 
                    : null
            };
        }

        if (numbers.length >= 2) {
            results.statistics.firstTwo = {
                count: firstTwoCount,
                percentage: ((firstTwoCount / totalDraws) * 100).toFixed(2),
                frequency: firstTwoCount > 0 ? `${firstTwoCount} times in ${totalDraws} draws` : 'Never appeared together',
                lastSeen: firstTwoCount > 0 
                    ? results.fullMatches.find(m => m.matchLevel >= 2)?.date || 
                      results.partialMatches.find(m => m.matchLevel >= 2)?.date
                    : null,
                possibleThirds: []
            };

            // Find all third numbers that appeared with this pair
            const thirdNumbers = new Map();
            [...results.fullMatches, ...results.partialMatches]
                .filter(m => m.matchLevel >= 2)
                .forEach(m => {
                    const third = m.numbers[2];
                    if (!thirdNumbers.has(third)) {
                        thirdNumbers.set(third, { number: third, count: 0, dates: [] });
                    }
                    const data = thirdNumbers.get(third);
                    data.count++;
                    data.dates.push(m.date);
                });
            
            results.statistics.firstTwo.possibleThirds = Array.from(thirdNumbers.values())
                .sort((a, b) => b.count - a.count);
        }

        if (numbers.length === 3) {
            results.statistics.fullCombination = {
                count: fullComboCount,
                percentage: ((fullComboCount / totalDraws) * 100).toFixed(2),
                frequency: fullComboCount > 0 ? `${fullComboCount} times in ${totalDraws} draws` : 'Never appeared',
                lastSeen: fullComboCount > 0 ? results.fullMatches[0].date : null,
                isHot: fullComboCount > (totalDraws * 0.01),
                isCold: fullComboCount === 0 || (results.fullMatches[0]?.index < totalDraws - 50)
            };
        }

        // Get recent occurrences (last 10)
        results.recentOccurrences = [...results.fullMatches, ...results.partialMatches]
            .sort((a, b) => (b.index || 0) - (a.index || 0))
            .slice(0, 10);

        // Add insights
        results.insights = generateInsights(results, numbers, totalDraws);

        return new Response(
            JSON.stringify({
                success: true,
                data: results,
                totalDrawsAnalyzed: totalDraws
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error("Error checking combination history:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to check combination history",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

function getPattern(numbers) {
    if (numbers.length === 0) return '';
    
    const pattern = numbers.map(n => n <= 4 ? 'B' : 'A').join('');
    return pattern;
}

function generateInsights(results, numbers, totalDraws) {
    const insights = [];

    if (numbers.length === 1) {
        const freq = results.statistics.firstNumber;
        if (freq.count === 0) {
            insights.push(`Number ${numbers[0]} hasn't appeared in first position recently.`);
        } else if (freq.count > totalDraws * 0.15) {
            insights.push(`Number ${numbers[0]} is HOT! Appearing frequently in first position.`);
        }
    }

    if (numbers.length === 2) {
        const freq = results.statistics.firstTwo;
        if (freq.count === 0) {
            insights.push(`The pair ${numbers.join('-')} has never appeared together.`);
        } else if (freq.count === 1) {
            insights.push(`Rare pair! Only appeared once on ${freq.lastSeen}.`);
        } else if (freq.count > 3) {
            insights.push(`Active pair with ${freq.count} occurrences.`);
        }

        if (freq.possibleThirds && freq.possibleThirds.length > 0) {
            const topThird = freq.possibleThirds[0];
            insights.push(`Most common third number: ${topThird.number} (${topThird.count} times)`);
        }
    }

    if (numbers.length === 3) {
        const freq = results.statistics.fullCombination;
        if (freq.count === 0) {
            insights.push(`This exact combination has never been drawn.`);
        } else if (freq.count === 1) {
            insights.push(`Hit once before on ${freq.lastSeen}!`);
        } else {
            insights.push(`Repeated ${freq.count} times, last on ${freq.lastSeen}.`);
        }

        if (freq.isHot) {
            insights.push(`🔥 HOT combination!`);
        } else if (freq.isCold) {
            insights.push(`❄️ COLD combination - due for a hit?`);
        }
    }

    // Pattern insights
    const pattern = results.pattern;
    if (pattern === 'BBB' || pattern === 'AAA') {
        insights.push(`All ${pattern[0] === 'B' ? 'low' : 'high'} numbers pattern.`);
    } else if (pattern === 'BBA' || pattern === 'BAA') {
        insights.push(`Valid ${pattern} pattern for COMBO play.`);
    }

    return insights;
}