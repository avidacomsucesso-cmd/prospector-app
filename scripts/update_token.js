/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const newToken = process.env.NEW_REFRESH_TOKEN || ''; // Should be passed via env var

try {
    if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');

        // Remove old token lines
        const lines = content.split('\n').filter(line => !line.trim().startsWith('GOOGLE_ADS_REFRESH_TOKEN='));

        // Add new token
        lines.push(`GOOGLE_ADS_REFRESH_TOKEN=${newToken}`);

        fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
        console.log("✅ Updated .env.local with the captured Refresh Token.");
    } else {
        console.error("❌ .env.local not found!");
    }
} catch (e) {
    console.error("Failed to update env:", e);
}
