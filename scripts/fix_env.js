/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');

try {
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }

    // Read as binary buffer to detect encoding if needed, but let's try utf8 first
    // If it's UTF-16, this might look like "C\0L\0I\0..." or garbage.
    let content = fs.readFileSync(envPath).toString('binary');

    // Check for UTF-16 LE BOM (FF FE) or BE (FE FF)
    // Simple heuristic: if we see null bytes in between chars, it's widely encoded
    if (content.indexOf('\x00') !== -1) {
        console.log("⚠️  Detected potential UTF-16/Wide char encoding. Attempting to convert...");
        // Try to read as utf16le
        content = fs.readFileSync(envPath, 'utf16le');
    } else {
        // Re-read as standard utf8
        content = fs.readFileSync(envPath, 'utf8');
    }

    console.log("Read content length:", content.length);

    // Extract values using Regex to be robust
    const extract = (name, patterns) => {
        for (const p of patterns) {
            const match = content.match(p);
            if (match && match[1]) return match[1].trim();
        }
        return '';
    };

    const clientId = extract('CLIENT_ID', [/GOOGLE_ADS_CLIENT_ID=(.+)/, /CLIENT_ID:(.+)/]);
    const clientSecret = extract('CLIENT_SECRET', [/GOOGLE_ADS_CLIENT_SECRET=(.+)/, /CLIENT_SECRET:(.+)/]);
    // Allow user to use "DEVELOPER_TOKEN" or "GOOGLE_ADS_DEVELOPER_TOKEN"
    const devToken = extract('DEVELOPER_TOKEN', [/GOOGLE_ADS_DEVELOPER_TOKEN=(.+)/, /DEVELOPER_TOKEN:(.+)/]);
    const refreshToken = extract('REFRESH_TOKEN', [/GOOGLE_ADS_REFRESH_TOKEN=(.+)/, /REFRESH_TOKEN:(.+)/]);
    const customerId = extract('CUSTOMER_ID', [/GOOGLE_ADS_CUSTOMER_ID=(.+)/, /CUSTOMER_ID:(.+)/]);

    if (!clientId || !clientSecret) {
        console.error("❌ Could not find Client ID or Secret in the file. Detected content:");
        console.log(content.substring(0, 200) + "...");
        process.exit(1);
    }

    let newContent = `# Google Ads API Credentials (Fixed by Script)
GOOGLE_ADS_CLIENT_ID=${clientId}
GOOGLE_ADS_CLIENT_SECRET=${clientSecret}
GOOGLE_ADS_DEVELOPER_TOKEN=${devToken}
GOOGLE_ADS_REFRESH_TOKEN=${refreshToken}
GOOGLE_ADS_CUSTOMER_ID=${customerId}

# Google Places API (Preserved if possible, otherwise user needs to add back)
`;

    // Try to find Places Key separately
    const placesKey = extract('PLACES_KEY', [/GOOGLE_PLACES_API_KEY=(.+)/]);
    if (placesKey) {
        newContent += `GOOGLE_PLACES_API_KEY=${placesKey}\n`;
    }

    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log("✅ Successfully rewrote .env.local with correct formatting.");
    console.log("Found Refresh Token:", refreshToken ? "YES" : "NO");

} catch (e) {
    console.error("Failed:", e);
}
