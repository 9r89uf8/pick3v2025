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

export async function GET(req) {
    console.log('Puppeteer version:', require('puppeteer-core/package.json').version);
    let browser;
    try {
        console.log('Connecting to Browserless.io...');
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://production-sfo.browserless.io/?token=${BROWSER_WS}`
        });
        
        const page = await browser.newPage();
        
        // Enhanced stealth configuration
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        console.log('Setting user agent:', userAgent);
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
                console.log(`Blocking ${resourceType}: ${url.substring(0, 50)}...`);
                request.abort();
            } else if (url.includes('google-analytics') || url.includes('doubleclick') || url.includes('facebook')) {
                console.log(`Blocking tracker: ${url.substring(0, 50)}...`);
                request.abort();
            } else {
                request.continue();
            }
        });
        
        console.log('Navigating to lottery website...');
        
        // Navigate with optimized settings
        const response = await page.goto('https://www.illinoislottery.com/dbg/results/pick3?page=1', {
            waitUntil: 'domcontentloaded', // Faster than networkidle0
            timeout: 30000
        });
        
        console.log(`Page loaded with status: ${response.status()}`);
        
        // Wait a bit for JavaScript to execute
// Wait a bit for JavaScript to execute
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('done')
        
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
                console.log(`Trying selector: ${selector}`);
                await page.waitForSelector(selector, { timeout: 5000 });
                const count = await page.$$eval(selector, els => els.length);
                console.log(`Found ${count} elements with selector: ${selector}`);
                if (count > 0) {
                    foundSelector = selector;
                    break;
                }
            } catch (e) {
                console.log(`Selector ${selector} not found`);
            }
        }
        
        // If no selector found, try to extract data from page source
        if (!foundSelector) {
            console.log('No selectors found, attempting alternative data extraction...');
            
            // Check for JSON data in scripts
            const pageContent = await page.content();
            const jsonMatch = pageContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
            if (jsonMatch) {
                console.log('Found initial state data');
                const data = JSON.parse(jsonMatch[1]);
                console.log('Parsed data:', JSON.stringify(data).substring(0, 200));
            }
            
            // Try to find any elements with pick3 data
            const pick3Elements = await page.evaluate(() => {
                const allElements = document.querySelectorAll('*');
                const results = [];
                for (const el of allElements) {
                    if (el.textContent && el.textContent.includes('Pick 3') && el.children.length < 10) {
                        results.push({
                            tag: el.tagName,
                            class: el.className,
                            text: el.textContent.substring(0, 100)
                        });
                    }
                }
                return results;
            });
            console.log('Found Pick 3 elements:', pick3Elements.slice(0, 5));
            
            // Last resort: wait for any results
            foundSelector = '.results__list-item';
            await page.waitForSelector(foundSelector, { timeout: 15000 });
        }
        
        console.log('Extracting draw data...');
        
        // Extract data with the found selector
        const divsWithClassDfs = await page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements in page`);
            
            return Array.from(elements).slice(0, 9).map(elem => {
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
                        pick = Array.from(els).map(e => parseInt(e.textContent.replace(/[^0-9]/g, "")));
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
            });
        }, foundSelector);
        
        console.log(`Extracted ${divsWithClassDfs.length} draws`);
        
        // Process only the first draw for saving, but we need all 9 for the previous numbers
        if (!divsWithClassDfs || divsWithClassDfs.length === 0) {
            throw new Error('No draw data found after evaluation.');
        }
        console.log(`Found ${divsWithClassDfs.length} draw results.`);

        // Process all 9 draws to get previous numbers
        const allDraws = Array(9).fill(null).map((_, index) => {
            if (index < divsWithClassDfs.length && divsWithClassDfs[index]) {
                const draw = divsWithClassDfs[index];
                const { dateInfo, drawInfo, pick, fireball } = draw;

                // Ensure we have 3 numbers
                while (pick.length < 3) {
                    pick.push(null);
                }
                let [originalFirstNumber = null, originalSecondNumber = null, originalThirdNumber = null] = pick;

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
                let sortedFirstNumber = null, sortedSecondNumber = null, sortedThirdNumber = null;
                if (sortedNumbers.length === 3) {
                    sortedNumbers.sort((a, b) => a - b);
                    [sortedFirstNumber, sortedSecondNumber, sortedThirdNumber] = sortedNumbers;
                } else if (sortedNumbers.length === 2) {
                    sortedNumbers.sort((a, b) => a - b);
                    [sortedFirstNumber, sortedSecondNumber] = sortedNumbers;
                    sortedThirdNumber = null;
                } else if (sortedNumbers.length === 1) {
                    sortedFirstNumber = sortedNumbers[0];
                    sortedSecondNumber = null;
                    sortedThirdNumber = null;
                }

                const parsedFireball = fireball ? parseInt(fireball.replace(/[^0-9]/g, "")) : null;

                return {
                    originalFirstNumber: originalFirstNumber,
                    originalSecondNumber: originalSecondNumber,
                    originalThirdNumber: originalThirdNumber,
                    sortedFirstNumber: sortedFirstNumber,
                    sortedSecondNumber: sortedSecondNumber,
                    sortedThirdNumber: sortedThirdNumber,
                    fireball: isNaN(parsedFireball) ? null : parsedFireball,
                    dateInfo: dateInfo,
                    drawInfo: drawInfo,
                    timeOfDay: timeOfDay,
                    r: r
                };
            } else {
                return {
                    originalFirstNumber: null,
                    originalSecondNumber: null,
                    originalThirdNumber: null,
                    sortedFirstNumber: null,
                    sortedSecondNumber: null,
                    sortedThirdNumber: null,
                    fireball: null,
                    dateInfo: null,
                    drawInfo: null,
                    timeOfDay: null,
                    r: null
                };
            }
        });

        const currentDraw = allDraws[0];
        
        if (!currentDraw || currentDraw.dateInfo === null) {
            throw new Error('Could not retrieve valid current draw data.');
        }

        // Helper function to check if all numbers are valid
        const areNumsValid = (n1, n2, n3) => n1 !== null && n2 !== null && n3 !== null;

        // Calculate original draw values
        const originalNumsValid = areNumsValid(currentDraw.originalFirstNumber, currentDraw.originalSecondNumber, currentDraw.originalThirdNumber);
        const originalDrawSum = originalNumsValid
            ? currentDraw.originalFirstNumber + currentDraw.originalSecondNumber + currentDraw.originalThirdNumber
            : null;
        const originalDraw = originalNumsValid
            ? `${currentDraw.originalFirstNumber}${currentDraw.originalSecondNumber}${currentDraw.originalThirdNumber}`
            : null;
        const originalFirstAndSecond = currentDraw.originalFirstNumber !== null && currentDraw.originalSecondNumber !== null
            ? `${currentDraw.originalFirstNumber}${currentDraw.originalSecondNumber}`
            : null;
        const originalSecondAndThird = currentDraw.originalSecondNumber !== null && currentDraw.originalThirdNumber !== null
            ? `${currentDraw.originalSecondNumber}${currentDraw.originalThirdNumber}`
            : null;
        const originalFirstAndThird = currentDraw.originalFirstNumber !== null && currentDraw.originalThirdNumber !== null
            ? `${currentDraw.originalFirstNumber}${currentDraw.originalThirdNumber}`
            : null;

        // Calculate sorted draw values
        const sortedNumsValid = areNumsValid(currentDraw.sortedFirstNumber, currentDraw.sortedSecondNumber, currentDraw.sortedThirdNumber);
        const sortedDrawSum = sortedNumsValid
            ? currentDraw.sortedFirstNumber + currentDraw.sortedSecondNumber + currentDraw.sortedThirdNumber
            : null;
        const sortedDraw = sortedNumsValid
            ? `${currentDraw.sortedFirstNumber}${currentDraw.sortedSecondNumber}${currentDraw.sortedThirdNumber}`
            : null;
        const sortedFirstAndSecond = currentDraw.sortedFirstNumber !== null && currentDraw.sortedSecondNumber !== null
            ? `${currentDraw.sortedFirstNumber}${currentDraw.sortedSecondNumber}`
            : null;
        const sortedSecondAndThird = currentDraw.sortedSecondNumber !== null && currentDraw.sortedThirdNumber !== null
            ? `${currentDraw.sortedSecondNumber}${currentDraw.sortedThirdNumber}`
            : null;
        const sortedFirstAndThird = currentDraw.sortedFirstNumber !== null && currentDraw.sortedThirdNumber !== null
            ? `${currentDraw.sortedFirstNumber}${currentDraw.sortedThirdNumber}`
            : null;

        const finalResultObject = {
            originalFirstNumber: currentDraw.originalFirstNumber,
            originalSecondNumber: currentDraw.originalSecondNumber,
            originalThirdNumber: currentDraw.originalThirdNumber,
            originalDraw: originalDraw,
            originalDrawSum: originalDrawSum,
            originalFirstAndSecond: originalFirstAndSecond,
            originalSecondAndThird: originalSecondAndThird,
            originalFirstAndThird: originalFirstAndThird,

            sortedFirstNumber: currentDraw.sortedFirstNumber,
            sortedSecondNumber: currentDraw.sortedSecondNumber,
            sortedThirdNumber: currentDraw.sortedThirdNumber,
            sortedDraw: sortedDraw,
            sortedDrawSum: sortedDrawSum,
            sortedFirstAndSecond: sortedFirstAndSecond,
            sortedSecondAndThird: sortedSecondAndThird,
            sortedFirstAndThird: sortedFirstAndThird,

            originalPreviousFirst1: allDraws[1]?.originalFirstNumber ?? null,
            originalPreviousFirst2: allDraws[2]?.originalFirstNumber ?? null,
            originalPreviousFirst3: allDraws[3]?.originalFirstNumber ?? null,
            originalPreviousFirst4: allDraws[4]?.originalFirstNumber ?? null,
            originalPreviousFirst5: allDraws[5]?.originalFirstNumber ?? null,
            originalPreviousFirst6: allDraws[6]?.originalFirstNumber ?? null,
            originalPreviousFirst7: allDraws[7]?.originalFirstNumber ?? null,
            originalPreviousFirst8: allDraws[8]?.originalFirstNumber ?? null,

            originalPreviousSecond1: allDraws[1]?.originalSecondNumber ?? null,
            originalPreviousSecond2: allDraws[2]?.originalSecondNumber ?? null,
            originalPreviousSecond3: allDraws[3]?.originalSecondNumber ?? null,
            originalPreviousSecond4: allDraws[4]?.originalSecondNumber ?? null,
            originalPreviousSecond5: allDraws[5]?.originalSecondNumber ?? null,
            originalPreviousSecond6: allDraws[6]?.originalSecondNumber ?? null,
            originalPreviousSecond7: allDraws[7]?.originalSecondNumber ?? null,
            originalPreviousSecond8: allDraws[8]?.originalSecondNumber ?? null,

            originalPreviousThird1: allDraws[1]?.originalThirdNumber ?? null,
            originalPreviousThird2: allDraws[2]?.originalThirdNumber ?? null,
            originalPreviousThird3: allDraws[3]?.originalThirdNumber ?? null,
            originalPreviousThird4: allDraws[4]?.originalThirdNumber ?? null,
            originalPreviousThird5: allDraws[5]?.originalThirdNumber ?? null,
            originalPreviousThird6: allDraws[6]?.originalThirdNumber ?? null,
            originalPreviousThird7: allDraws[7]?.originalThirdNumber ?? null,
            originalPreviousThird8: allDraws[8]?.originalThirdNumber ?? null,

            sortedPreviousFirst1: allDraws[1]?.sortedFirstNumber ?? null,
            sortedPreviousFirst2: allDraws[2]?.sortedFirstNumber ?? null,
            sortedPreviousFirst3: allDraws[3]?.sortedFirstNumber ?? null,
            sortedPreviousFirst4: allDraws[4]?.sortedFirstNumber ?? null,
            sortedPreviousFirst5: allDraws[5]?.sortedFirstNumber ?? null,
            sortedPreviousFirst6: allDraws[6]?.sortedFirstNumber ?? null,
            sortedPreviousFirst7: allDraws[7]?.sortedFirstNumber ?? null,
            sortedPreviousFirst8: allDraws[8]?.sortedFirstNumber ?? null,

            sortedPreviousSecond1: allDraws[1]?.sortedSecondNumber ?? null,
            sortedPreviousSecond2: allDraws[2]?.sortedSecondNumber ?? null,
            sortedPreviousSecond3: allDraws[3]?.sortedSecondNumber ?? null,
            sortedPreviousSecond4: allDraws[4]?.sortedSecondNumber ?? null,
            sortedPreviousSecond5: allDraws[5]?.sortedSecondNumber ?? null,
            sortedPreviousSecond6: allDraws[6]?.sortedSecondNumber ?? null,
            sortedPreviousSecond7: allDraws[7]?.sortedSecondNumber ?? null,
            sortedPreviousSecond8: allDraws[8]?.sortedSecondNumber ?? null,

            sortedPreviousThird1: allDraws[1]?.sortedThirdNumber ?? null,
            sortedPreviousThird2: allDraws[2]?.sortedThirdNumber ?? null,
            sortedPreviousThird3: allDraws[3]?.sortedThirdNumber ?? null,
            sortedPreviousThird4: allDraws[4]?.sortedThirdNumber ?? null,
            sortedPreviousThird5: allDraws[5]?.sortedThirdNumber ?? null,
            sortedPreviousThird6: allDraws[6]?.sortedThirdNumber ?? null,
            sortedPreviousThird7: allDraws[7]?.sortedThirdNumber ?? null,
            sortedPreviousThird8: allDraws[8]?.sortedThirdNumber ?? null,

            year: '2025',
            fireball: currentDraw.fireball,
            drawDate: currentDraw.dateInfo,
            drawMonth: currentDraw.dateInfo ? currentDraw.dateInfo.substring(0, 3) : null,
            index: currentDraw.r,
            time: currentDraw.timeOfDay,
            timestamp: adminDb.firestore.FieldValue.serverTimestamp()
        };
        
        await browser.close();

        const draws = adminDb.firestore().collection('draws');

        console.log('Saving response to Firestore...');
        const docRef = await draws.add(finalResultObject);
        console.log("Document successfully written with ID: ", docRef.id);

        return new Response(JSON.stringify(finalResultObject), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error in scraping:', error.message);
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                console.error('Error closing browser:', e);
            }
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}