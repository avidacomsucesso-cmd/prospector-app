/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');

// Template for restoration - actual values should be provided by the user or env
const ADS_CONFIG = {
    GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID || 'PENDING',
    GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET || 'PENDING',
    GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'PENDING',
    GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN || 'PENDING',
    GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID || 'PENDING'
};

try {
    let placesKey = '';

    // Try to rescue Places API Key
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GOOGLE_PLACES_API_KEY=(.+)/);
        if (match && match[1]) {
            placesKey = match[1].trim();
            console.log("✅ Rescued Google Places API Key");
        }
    }

    if (!placesKey) {
        console.warn("⚠️  Could not find GOOGLE_PLACES_API_KEY in existing file. You may need to add it manually.");
        placesKey = "YOUR_PLACES_KEY_HERE";
    }

    const newContent = `# Google Places API
GOOGLE_PLACES_API_KEY=${placesKey}

# Google Ads API (Restored)
GOOGLE_ADS_CLIENT_ID=${ADS_CONFIG.GOOGLE_ADS_CLIENT_ID}
GOOGLE_ADS_CLIENT_SECRET=${ADS_CONFIG.GOOGLE_ADS_CLIENT_SECRET}
GOOGLE_ADS_DEVELOPER_TOKEN=${ADS_CONFIG.GOOGLE_ADS_DEVELOPER_TOKEN}
GOOGLE_ADS_REFRESH_TOKEN=${ADS_CONFIG.GOOGLE_ADS_REFRESH_TOKEN}
GOOGLE_ADS_CUSTOMER_ID=${ADS_CONFIG.GOOGLE_ADS_CUSTOMER_ID}
`;

    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log("✅ .env.local has been fully restored with all credentials!");
    console.log("\nIMPORTANT: You must RESTART your server for these changes to take effect.");

} catch (e) {
    console.error("Failed to restore env:", e);
}
