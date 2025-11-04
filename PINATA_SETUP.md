# How to Get Your Pinata API Key

Pinata provides IPFS storage with a generous free tier. Follow these steps to get your API key:

## Step 1: Create a Pinata Account

1. Go to https://app.pinata.cloud/register
2. Sign up with your email or Google account
3. Verify your email address

## Step 2: Generate API Key

1. Log in to https://app.pinata.cloud
2. Click on **"API Keys"** in the left sidebar
3. Click **"New Key"** button
4. Configure your API key:
   - **Key Name**: `AfriAssets Development` (or any name you prefer)
   - **Permissions**: Check these boxes:
     - ✅ `pinFileToIPFS`
     - ✅ `pinJSONToIPFS`
   - Leave other options as default
5. Click **"Generate Key"**
6. **IMPORTANT**: Copy the JWT token immediately - you won't be able to see it again!

## Step 3: Add to Your Project

1. Open `app/.env` file
2. Find the line: `# VITE_PINATA_JWT=your_pinata_jwt_here`
3. Uncomment it and replace with your JWT:
   ```env
   VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_jwt_here
   ```
4. Change `VITE_USE_HELIA=true` to `VITE_USE_HELIA=false` to use Pinata:
   ```env
   VITE_USE_HELIA=false
   ```
5. Restart your dev server:
   ```bash
   cd app
   npm run dev
   ```

## Free Tier Limits

Pinata's free tier includes:
- ✅ 1 GB storage
- ✅ Unlimited API requests
- ✅ Perfect for development and testing

## Alternative: Use Helia (Decentralized IPFS)

If you prefer not to use Pinata, the app is already configured to use **Helia**, a fully decentralized IPFS client that runs in your browser.

**Current setup (Helia):**
```env
VITE_USE_HELIA=true
```

**Pros:**
- ✅ No API keys needed
- ✅ Fully decentralized
- ✅ Works immediately

**Cons:**
- ⚠️ Slower uploads (browser-based)
- ⚠️ Files pinned only on local node initially
- ⚠️ May need additional pinning services for persistence

## Troubleshooting

### Error: "Authentication failed: token signature is invalid"
- Your JWT token is expired or incorrect
- Generate a new API key from Pinata dashboard
- Make sure you copied the entire JWT (it's very long)

### Error: "IPFS upload failed"
- Check your internet connection
- Verify the JWT is correctly pasted in `.env`
- Make sure there are no extra spaces before/after the JWT
- Try refreshing the page and connecting wallet again

### Switch between Pinata and Helia
Simply change `VITE_USE_HELIA` in your `.env` file:
- `false` = Use Pinata (faster, requires API key)
- `true` = Use Helia (decentralized, no API key needed)

## Support

- Pinata Docs: https://docs.pinata.cloud
- Pinata Support: support@pinata.cloud
- Helia Docs: https://helia.io
