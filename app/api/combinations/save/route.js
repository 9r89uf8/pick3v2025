// app/api/combinations/save/route.js - Save combinations to Firebase
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const { combinations } = await request.json();
        
        if (!combinations || !Array.isArray(combinations)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Invalid combinations data"
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        const firestore = adminDb.firestore();
        const batch = firestore.batch();
        const combinationsCollection = firestore.collection('combinations');
        
        // Delete existing combinations first (optional - remove if you want to keep history)
        const existingDocs = await combinationsCollection.get();
        existingDocs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Add new combinations
        combinations.forEach((combo) => {
            const docRef = combinationsCollection.doc(); // Auto-generate ID
            batch.set(docRef, {
                ...combo,
                timestamp: adminDb.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString()
            });
        });
        
        // Commit the batch
        await batch.commit();
        
        // Create summary statistics document
        const statsDoc = {
            totalCombinations: combinations.length,
            patterns: {
                BBB: combinations.filter(c => c.pattern === 'BBB').length,
                BBA: combinations.filter(c => c.pattern === 'BBA').length,
                BAA: combinations.filter(c => c.pattern === 'BAA').length,
                AAA: combinations.filter(c => c.pattern === 'AAA').length
            },
            validCombinations: combinations.filter(c => c.isValid).length,
            uniqueNumberCombinations: combinations.filter(c => c.hasUniqueNumbers).length,
            cascadeDistribution: {},
            lastUpdated: adminDb.firestore.FieldValue.serverTimestamp()
        };
        
        // Calculate cascade distribution
        for (let i = 0; i <= 9; i++) {
            statsDoc.cascadeDistribution[i] = combinations.filter(c => c.cascadeNumber === i).length;
        }
        
        // Save statistics
        await firestore.collection('combinationStats').doc('summary').set(statsDoc);
        
        // Run frequency analysis automatically after saving
        console.log('Running frequency analysis on saved combinations...');
        try {
            const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/combinations/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (analyzeResponse.ok) {
                const analyzeResult = await analyzeResponse.json();
                console.log('Frequency analysis completed:', analyzeResult.message);
                
                return new Response(
                    JSON.stringify({
                        success: true,
                        message: `Successfully saved ${combinations.length} combinations to Firebase and analyzed frequencies`,
                        statistics: statsDoc,
                        frequencyAnalysis: analyzeResult.summary
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
        } catch (analyzeError) {
            console.error('Error running frequency analysis:', analyzeError);
            // Still return success for save, but note the analysis failed
        }
        
        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully saved ${combinations.length} combinations to Firebase`,
                statistics: statsDoc,
                note: 'Frequency analysis pending - run analyze endpoint separately'
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
    } catch (error) {
        console.error("Error saving combinations to Firebase:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to save combinations",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}