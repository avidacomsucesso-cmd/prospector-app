# Setup Google Ads API

1. Copy this content to a file named `.env.local` in `prospector-app/`.

```ini
# Google Places API (Existing)
GOOGLE_PLACES_API_KEY=your_places_key_here

# Google Ads API (New - For Search Volume)
# Get ID/Secret from Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=

# Get Developer Token from Google Ads Manager Account > Tools & Settings > API Center
GOOGLE_ADS_DEVELOPER_TOKEN=

# Your Ads Account ID (format: 123-456-7890 or 1234567890)
GOOGLE_ADS_CUSTOMER_ID=

# Generated via scripts/get_refresh_token.js
GOOGLE_ADS_REFRESH_TOKEN=
```

2. Run the helper script to get your Refresh Token:
   `node scripts/get_refresh_token.js`
