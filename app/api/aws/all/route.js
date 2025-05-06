import { NextResponse } from 'next/server';
import {adminDb} from "@/app/utils/firebaseAdmin";

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

// The URL for your Lambda function
const LAMBDA_URL = "https://qysdnsuoryaiyih2mx3eolvcwm0quwin.lambda-url.us-east-2.on.aws/";

export async function GET(request) {
    try {
        // Call the Lambda URL
        const response = await fetch(LAMBDA_URL, {
            method: 'GET',
            cache: 'no-store' // Ensures you get a fresh response every time
        });

        // Check if the Lambda call was successful
        if (!response.ok) {
            // If Lambda returned an error (like 4xx or 5xx)
            const errorText = await response.text();
            console.error(`Lambda Error (${response.status}): ${errorText}`);
            return NextResponse.json({ error: `Lambda failed: ${response.status}`, details: errorText }, { status: response.status });
        }

        // Get the response data from Lambda (assuming it's JSON)
        // If your Lambda returns plain text, use response.text() instead
        const data = await response.json();


        console.log('Saving response to Firestore...');
        await writeBatchToFirestore(data);

        // Send the Lambda's response back to the browser/client
        return NextResponse.json(data);

    } catch (error) {
        // Handle network errors or issues calling fetch itself
        console.error("Error calling the Lambda function:", error);
        return NextResponse.json({ error: 'Failed to reach Lambda function', details: error.message }, { status: 500 });
    }
}