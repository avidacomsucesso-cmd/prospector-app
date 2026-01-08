import { NextRequest, NextResponse } from 'next/server';
import { getKeywordVolume, hasAdsCredentials } from '@/lib/google-ads-client';
import fs from 'fs';
import path from 'path';

function logDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'debug_ads.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch {
        // ignore
    }
}

export async function GET(request: NextRequest) {
    try {
        logDebug("--- Request Received at /api/keywords ---");
        const searchParams = request.nextUrl.searchParams;
        const keyword = searchParams.get('term');
        const locationId = searchParams.get('locationId') || undefined;

        logDebug(`Term: ${keyword}, LocationId: ${locationId}`);

        if (!keyword) {
            logDebug("Error: Missing term");
            return NextResponse.json({ error: 'Missing term parameter' }, { status: 400 });
        }

        if (!hasAdsCredentials()) {
            logDebug("Error: Credentials Missing");
            // Log which ones are missing if possible
            const missing = [];
            if (!process.env.GOOGLE_ADS_CLIENT_ID) missing.push("CLIENT_ID");
            if (!process.env.GOOGLE_ADS_CLIENT_SECRET) missing.push("CLIENT_SECRET");
            if (!process.env.GOOGLE_ADS_REFRESH_TOKEN) missing.push("REFRESH_TOKEN");
            logDebug(`Missing vars: ${missing.join(', ')}`);

            return NextResponse.json({
                error: 'Configuration Missing',
                code: 'NO_CREDS'
            }, { status: 503 });
        }

        logDebug("Credentials present. Fetching volume...");
        const metrics = await getKeywordVolume(keyword, locationId);

        if (!metrics) {
            logDebug("Error: metrics is null");
            return NextResponse.json({ error: 'No data or API failure' }, { status: 404 });
        }

        logDebug("Success! Returning metrics.");
        return NextResponse.json(metrics);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logDebug(`CRITICAL ERROR: ${errorMessage}`);
        logDebug(JSON.stringify(error, null, 2));
        console.error("API Keywords Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
