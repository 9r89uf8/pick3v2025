import { NextResponse } from 'next/server';
import {adminDb} from "@/app/utils/firebaseAdmin";

// The URL for your Lambda function
const LAMBDA_URL = "https://cpp4cknnn7rn6idxxtmwvkylxq0bzefn.lambda-url.us-east-2.on.aws/";

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

        const draws = adminDb.firestore().collection('draws');

        console.log('Saving response to Firestore...');
        const docRef = await draws.add(data);

        // Send the Lambda's response back to the browser/client
        return NextResponse.json(data);

    } catch (error) {
        // Handle network errors or issues calling fetch itself
        console.error("Error calling the Lambda function:", error);
        return NextResponse.json({ error: 'Failed to reach Lambda function', details: error.message }, { status: 500 });
    }
}