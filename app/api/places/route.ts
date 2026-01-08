import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function logDebug(message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const logPath = path.join(process.cwd(), '..', 'debug_api.log'); // Write to root of workspace (CATBACK-ANTIGRAVITY)
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;

    try {
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        // Fallback if we can't write to file, though we shouldn't crash
        console.error("Failed to write to log file", e);
    }
}

const FULL_FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri';
const MINIMAL_FIELD_MASK = 'places.id,places.displayName,places.formattedAddress';

export async function GET(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    logDebug(`[${requestId}] API Request started`);

    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query');
        const apiKey = searchParams.get('key') || process.env.GOOGLE_PLACES_API_KEY;
        const pageToken = searchParams.get('pageToken');

        logDebug(`[${requestId}] Params`, { query, hasKey: !!apiKey, hasPageToken: !!pageToken });

        if ((!query && !pageToken) || !apiKey) {
            logDebug(`[${requestId}] Missing params`);
            return NextResponse.json({ error: 'Missing query/pageToken or API Key' }, { status: 400 });
        }

        const googleUrl = `https://places.googleapis.com/v1/places:searchText`;

        // Helper to fetch data
        const fetchPlaces = async (fieldMask: string, attemptName: string) => {
            logDebug(`[${requestId}] Attempt: ${attemptName} (Mask len: ${fieldMask.length})`);

            const body: Record<string, unknown> = { textQuery: query };
            if (pageToken) body.pageToken = pageToken;

            const response = await fetch(googleUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': fieldMask
                },
                body: JSON.stringify(body)
            });
            return response;
        };

        // Attempt 1: Full Data
        let response = await fetchPlaces(FULL_FIELD_MASK, "FULL_DATA");
        let status = response.status;

        logDebug(`[${requestId}] FULL_DATA Status: ${status}`);

        if (status === 500) {
            // Attempt 2: Minimal Data (Fallback)
            logDebug(`[${requestId}] FULL_DATA failed with 500. Retrying with MINIMAL_DATA...`);
            response = await fetchPlaces(MINIMAL_FIELD_MASK, "MINIMAL_DATA");
            status = response.status;
            logDebug(`[${requestId}] MINIMAL_DATA Status: ${status}`);
        }

        const data = await response.json();

        if (data.error) {
            logDebug(`[${requestId}] Google API Error`, data.error);
            return NextResponse.json({ error: data.error.message || 'Google API Error' }, { status: 400 });
        }

        logDebug(`[${requestId}] Success`);
        return NextResponse.json(data);
    } catch (error) {
        logDebug(`[${requestId}] CRITICAL ERROR`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
