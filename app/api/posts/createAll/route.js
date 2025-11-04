import { adminDb } from '@/app/utils/firebaseAdmin';
import puppeteer from 'puppeteer-core';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BROWSER_WS = process.env.PROXY;

// User agents pool
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const getMonths = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    let twoMonthsAgoIndex;
    let previousMonthIndex;

    if (currentMonthIndex === 0) {
        twoMonthsAgoIndex = 10;
        previousMonthIndex = 11;
    } else if (currentMonthIndex === 1) {
        twoMonthsAgoIndex = 11;
        previousMonthIndex = 0;
    } else {
        twoMonthsAgoIndex = currentMonthIndex - 2;
        previousMonthIndex = currentMonthIndex - 1;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [monthNames[previousMonthIndex], monthNames[currentMonthIndex], monthNames[twoMonthsAgoIndex]];
};

async function scrapePageData(pageNum) {
    console.log(`Processing page ${pageNum}...`);
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://production-sfo.browserless.io/?token=${BROWSER_WS}`
    });

    try {
        const page = await browser.newPage();
        
        // Enhanced stealth configuration
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        console.log(`Setting user agent for page ${pageNum}:`, userAgent);
        await page.setUserAgent(userAgent);
        
        // Set viewport
        await page.setViewport({ 
            width: 1920, 
            height: 1080,
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false 
        });
        
        // Add stealth scripts before navigation
        await page.evaluateOnNewDocument(() => {
            // Remove webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            
            // Add chrome object
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            if (originalQuery) {
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            }
            
            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
            
            // Fix toString
            window.navigator.permissions.query.toString = () => 'function query() { [native code] }';
        });
        
        // Set extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        });
        
        // Enable request interception to block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            const url = request.url();
            
            // Block images, stylesheets, fonts, and tracking scripts
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else if (url.includes('google-analytics') || url.includes('doubleclick') || url.includes('facebook')) {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        console.log(`Navigating to page ${pageNum}...`);
        
        // Navigate with optimized settings
        const response = await page.goto(`https://www.illinoislottery.com/dbg/results/pick3?page=${pageNum}`, {
            waitUntil: 'domcontentloaded', // Faster than networkidle0
            timeout: 30000
        });
        
        console.log(`Page ${pageNum} loaded with status: ${response.status()}`);
        
        // Wait a bit for JavaScript to execute
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try multiple selectors with shorter timeouts
        const selectors = [
            '.results__list-item',
            '.dbg-results__list-item',
            '[class*="results__list-item"]',
            '[class*="result-item"]',
            '.pick3-results',
            '[data-game="pick3"]'
        ];
        
        let foundSelector = null;
        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                const count = await page.$$eval(selector, els => els.length);
                if (count > 0) {
                    foundSelector = selector;
                    break;
                }
            } catch (e) {
                // Continue trying other selectors
            }
        }
        
        if (!foundSelector) {
            foundSelector = '.results__list-item';
            await page.waitForSelector(foundSelector, { timeout: 15000 });
        }

        console.log(`Extracting data from page ${pageNum} using selector: ${foundSelector}`);
        
        const divsWithClassDfs = await page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements with selector ${selector}`);
            return Array.from(elements).map(elem => {
                try {
                    // Try multiple possible selectors for date/draw info
                    const dateSelectors = ['.dbg-results__date-info', '.date-info', '[class*="date"]'];
                    const drawSelectors = ['.dbg-results__draw-info', '.draw-info', '[class*="draw"]'];
                    const ballSelectors = ['.grid-ball--pick3-primary', '.pick3-ball', '[class*="ball"]'];
                    const fireballSelectors = ['.grid-ball--pick3-secondary--selected', '.fireball', '[class*="fireball"]'];
                    
                    let dateInfo = '';
                    for (const sel of dateSelectors) {
                        const el = elem.querySelector(sel);
                        if (el) {
                            dateInfo = el.textContent;
                            break;
                        }
                    }
                    
                    let drawInfo = '';
                    for (const sel of drawSelectors) {
                        const el = elem.querySelector(sel);
                        if (el) {
                            drawInfo = el.textContent;
                            break;
                        }
                    }
                    
                    let pick = [];
                    for (const sel of ballSelectors) {
                        const els = elem.querySelectorAll(sel);
                        if (els.length > 0) {
                            pick = Array.from(els).map(e => {
                                const num = parseInt(e.textContent.replace(/[^0-9]/g, ""));
                                return isNaN(num) ? null : num;
                            });
                            break;
                        }
                    }
                    
                    let fireball = null;
                    for (const sel of fireballSelectors) {
                        const el = elem.querySelector(sel);
                        if (el) {
                            fireball = el.textContent.trim();
                            break;
                        }
                    }
                    
                    return {
                        dateInfo,
                        drawInfo,
                        pick,
                        fireball
                    };
                } catch (error) {
                    return {
                        dateInfo: null,
                        drawInfo: null,
                        fireball: null,
                        pick: [null, null, null]
                    };
                }
            });
        }, foundSelector);

        console.log(`Extracted ${divsWithClassDfs.length} draws from page ${pageNum}`);
        if (divsWithClassDfs.length > 0) {
            console.log(`First draw from page ${pageNum}:`, divsWithClassDfs[0]);
        }
        
        return divsWithClassDfs.reverse();
    } finally {
        await browser.close();
    }
}

async function processPage(pageNum, currentMonth, previousPicks) {
    const pageData = await scrapePageData(pageNum);
    let draws = [];

    //dateInfo return example: Jan 2, 2024

    console.log(`Processing ${pageData.length} draws from page ${pageNum} for month ${currentMonth}`);
    
    for (let i = 0; i < pageData.length; i++) {
        const { dateInfo, drawInfo, pick, fireball } = pageData[i];
        const drawMonth = dateInfo?.substring(0, 3);
        
        if (i === 0) {
            console.log(`First draw date: ${dateInfo}, month: ${drawMonth}, looking for: ${currentMonth}`);
        }
        
        if (drawMonth === currentMonth) {
            // Ensure we have 3 numbers
            while (pick.length < 3) {
                pick.push(null);
            }
            // Original order numbers
            let [originalFirst = null, originalSecond = null, originalThird = null] = pick;

            let r = null;
            let timeOfDay = null;
            if (dateInfo && drawInfo) {
                const dateMatch = dateInfo.match(/\d+/);
                const dayOfMonth = dateMatch ? parseInt(dateMatch[0]) : null;
                timeOfDay = drawInfo.replace(/[^a-zA-Z]+/g, "").toLowerCase();

                if (dayOfMonth !== null) {
                    r = timeOfDay === 'midday' ? (dayOfMonth * 2) : (dayOfMonth * 2) + 1;
                }
            }

            // Create sorted version
            let sortedNumbers = [...pick].filter(n => n !== null);
            let sortedFirst = null, sortedSecond = null, sortedThird = null;
            if (sortedNumbers.length === 3) {
                sortedNumbers.sort((a, b) => a - b);
                [sortedFirst, sortedSecond, sortedThird] = sortedNumbers;
            } else if (sortedNumbers.length === 2) {
                sortedNumbers.sort((a, b) => a - b);
                [sortedFirst, sortedSecond] = sortedNumbers;
                sortedThird = null;
            } else if (sortedNumbers.length === 1) {
                sortedFirst = sortedNumbers[0];
                sortedSecond = null;
                sortedThird = null;
            }

            const parsedFireball = fireball ? parseInt(fireball.replace(/[^0-9]/g, "")) : null;
            const finalFireball = isNaN(parsedFireball) ? null : parsedFireball;

            // Helper function to check if all numbers are valid
            const areNumsValid = (n1, n2, n3) => n1 !== null && n2 !== null && n3 !== null;

            // Calculate sums
            const sortedNumsValid = areNumsValid(sortedFirst, sortedSecond, sortedThird);
            const sortedDrawSum = sortedNumsValid
                ? sortedFirst + sortedSecond + sortedThird
                : null;

            const originalNumsValid = areNumsValid(originalFirst, originalSecond, originalThird);
            const originalDrawSum = originalNumsValid
                ? originalFirst + originalSecond + originalThird
                : null;

            // Create draw data object
            const drawData = {
                // Original order data
                originalFirstNumber: originalFirst,
                originalSecondNumber: originalSecond,
                originalThirdNumber: originalThird,
                originalDraw: originalNumsValid
                    ? `${originalFirst}${originalSecond}${originalThird}`
                    : null,
                originalDrawSum,
                originalFirstAndSecond: (originalFirst !== null && originalSecond !== null)
                    ? `${originalFirst}${originalSecond}`
                    : null,
                originalSecondAndThird: (originalSecond !== null && originalThird !== null)
                    ? `${originalSecond}${originalThird}`
                    : null,
                originalFirstAndThird: (originalFirst !== null && originalThird !== null)
                    ? `${originalFirst}${originalThird}`
                    : null,

                // Previous numbers (original order)
                originalPreviousFirst1: previousPicks.original[0]?.[0] ?? null,
                originalPreviousFirst2: previousPicks.original[1]?.[0] ?? null,
                originalPreviousFirst3: previousPicks.original[2]?.[0] ?? null,
                originalPreviousFirst4: previousPicks.original[3]?.[0] ?? null,
                originalPreviousFirst5: previousPicks.original[4]?.[0] ?? null,
                originalPreviousFirst6: previousPicks.original[5]?.[0] ?? null,
                originalPreviousFirst7: previousPicks.original[6]?.[0] ?? null,
                originalPreviousFirst8: previousPicks.original[7]?.[0] ?? null,

                originalPreviousSecond1: previousPicks.original[0]?.[1] ?? null,
                originalPreviousSecond2: previousPicks.original[1]?.[1] ?? null,
                originalPreviousSecond3: previousPicks.original[2]?.[1] ?? null,
                originalPreviousSecond4: previousPicks.original[3]?.[1] ?? null,
                originalPreviousSecond5: previousPicks.original[4]?.[1] ?? null,
                originalPreviousSecond6: previousPicks.original[5]?.[1] ?? null,
                originalPreviousSecond7: previousPicks.original[6]?.[1] ?? null,
                originalPreviousSecond8: previousPicks.original[7]?.[1] ?? null,

                originalPreviousThird1: previousPicks.original[0]?.[2] ?? null,
                originalPreviousThird2: previousPicks.original[1]?.[2] ?? null,
                originalPreviousThird3: previousPicks.original[2]?.[2] ?? null,
                originalPreviousThird4: previousPicks.original[3]?.[2] ?? null,
                originalPreviousThird5: previousPicks.original[4]?.[2] ?? null,
                originalPreviousThird6: previousPicks.original[5]?.[2] ?? null,
                originalPreviousThird7: previousPicks.original[6]?.[2] ?? null,
                originalPreviousThird8: previousPicks.original[7]?.[2] ?? null,

                // Sorted data
                sortedFirstNumber: sortedFirst,
                sortedSecondNumber: sortedSecond,
                sortedThirdNumber: sortedThird,
                sortedDraw: sortedNumsValid
                    ? `${sortedFirst}${sortedSecond}${sortedThird}`
                    : null,
                sortedDrawSum,
                sortedFirstAndSecond: (sortedFirst !== null && sortedSecond !== null)
                    ? `${sortedFirst}${sortedSecond}`
                    : null,
                sortedSecondAndThird: (sortedSecond !== null && sortedThird !== null)
                    ? `${sortedSecond}${sortedThird}`
                    : null,
                sortedFirstAndThird: (sortedFirst !== null && sortedThird !== null)
                    ? `${sortedFirst}${sortedThird}`
                    : null,

                // Previous numbers (sorted)
                sortedPreviousFirst1: previousPicks.sorted[0]?.[0] ?? null,
                sortedPreviousFirst2: previousPicks.sorted[1]?.[0] ?? null,
                sortedPreviousFirst3: previousPicks.sorted[2]?.[0] ?? null,
                sortedPreviousFirst4: previousPicks.sorted[3]?.[0] ?? null,
                sortedPreviousFirst5: previousPicks.sorted[4]?.[0] ?? null,
                sortedPreviousFirst6: previousPicks.sorted[5]?.[0] ?? null,
                sortedPreviousFirst7: previousPicks.sorted[6]?.[0] ?? null,
                sortedPreviousFirst8: previousPicks.sorted[7]?.[0] ?? null,

                sortedPreviousSecond1: previousPicks.sorted[0]?.[1] ?? null,
                sortedPreviousSecond2: previousPicks.sorted[1]?.[1] ?? null,
                sortedPreviousSecond3: previousPicks.sorted[2]?.[1] ?? null,
                sortedPreviousSecond4: previousPicks.sorted[3]?.[1] ?? null,
                sortedPreviousSecond5: previousPicks.sorted[4]?.[1] ?? null,
                sortedPreviousSecond6: previousPicks.sorted[5]?.[1] ?? null,
                sortedPreviousSecond7: previousPicks.sorted[6]?.[1] ?? null,
                sortedPreviousSecond8: previousPicks.sorted[7]?.[1] ?? null,

                sortedPreviousThird1: previousPicks.sorted[0]?.[2] ?? null,
                sortedPreviousThird2: previousPicks.sorted[1]?.[2] ?? null,
                sortedPreviousThird3: previousPicks.sorted[2]?.[2] ?? null,
                sortedPreviousThird4: previousPicks.sorted[3]?.[2] ?? null,
                sortedPreviousThird5: previousPicks.sorted[4]?.[2] ?? null,
                sortedPreviousThird6: previousPicks.sorted[5]?.[2] ?? null,
                sortedPreviousThird7: previousPicks.sorted[6]?.[2] ?? null,
                sortedPreviousThird8: previousPicks.sorted[7]?.[2] ?? null,

                // Common fields
                fireball: finalFireball,
                year: '2025',
                drawDate: dateInfo || null,
                drawMonth: dateInfo ? dateInfo.substring(0, 3) : null,
                index: r,
                time: timeOfDay,
                timestamp: adminDb.firestore.Timestamp.now(),
            };

            draws.push(drawData);

            // Update previous picks
            previousPicks.sorted.unshift([sortedFirst, sortedSecond, sortedThird]);
            previousPicks.original.unshift([originalFirst, originalSecond, originalThird]);

            // Keep only last 8 picks
            previousPicks.sorted = previousPicks.sorted.slice(0, 8);
            previousPicks.original = previousPicks.original.slice(0, 8);
        }
    }

    console.log(`Found ${draws.length} draws for ${currentMonth} on page ${pageNum}`);
    return { draws, previousPicks };
}

async function writeBatchToFirestore(draws) {
    if (draws.length === 0) return;

    const infoCollection = adminDb.firestore().collection('draws');
    const batch = adminDb.firestore().batch();

    draws.forEach(draw => {
        const docRef = infoCollection.doc();
        batch.set(docRef, draw);
    });

    await batch.commit();
    console.log(`Batch write succeeded for ${draws.length} draws`);
}


export async function GET(req) {
    console.log('Puppeteer version:', require('puppeteer-core/package.json').version);
    try {
        const [prevMonth, currentMonth, twoMonthsAgo] = getMonths();
        console.log('Starting sequential scraping for month:', currentMonth);
        console.log('Previous month:', prevMonth, 'Two months ago:', twoMonthsAgo);

        let previousPicks = {
            sorted: Array(8).fill([null, null, null]),
            original: Array(8).fill([null, null, null])
        };

        // Collect all draws here instead of writing after each page
        let allDraws = [];


        // Process pages sequentially
        for (let pageNum = 4; pageNum >= 1; pageNum--) {
            try {
                console.log(`Starting to process page ${pageNum}`);
                const result = await processPage(pageNum, currentMonth, previousPicks);

                // Add draws to collection instead of writing immediately
                allDraws = [...allDraws, ...result.draws];

                // Update previous picks for next iteration
                previousPicks = result.previousPicks;

                // Optional: Add a small delay between pages
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error processing page ${pageNum}:`, error);
                // Instead of continue, throw the error to prevent saving
                throw new Error(`Failed to process page ${pageNum}: ${error.message}`);
            }
        }

        // Only write to Firestore if all pages were processed successfully
        await writeBatchToFirestore(allDraws);
        console.log(`Successfully processed and saved ${allDraws.length} total draws`);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Successfully saved ${allDraws.length} draws for ${currentMonth}`,
            drawsCount: allDraws.length 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error:', error.message);

        if (error.code === 'ECONNABORTED') {
            return new Response(JSON.stringify({ error: 'Request timed out' }), {
                status: 504,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}