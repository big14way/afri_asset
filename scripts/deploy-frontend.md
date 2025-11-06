# Frontend Deployment Guide

## Deploying to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Contract deployed to Futurenet
- Pinata account with API keys

### Step 1: Prepare Environment Variables

Create a `.env` file in the `app` directory with:

```bash
VITE_CONTRACT_ID=your_deployed_contract_id_here
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_USE_HELIA=false
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Step 2: Build the Application

```bash
cd app
npm run build
```

This will create an optimized production build in the `dist` directory.

### Step 3: Deploy via Vercel CLI

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
```

#### Deploy
```bash
cd app
vercel --prod
```

Follow the prompts:
- Set up and deploy: **Yes**
- Which scope: Select your account
- Link to existing project: **No**
- Project name: **afri-assets** (or your preferred name)
- Directory: **./dist**
- Override settings: **No**

### Step 4: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `VITE_CONTRACT_ID`
   - `VITE_PINATA_JWT` (mark as sensitive)
   - `VITE_PINATA_GATEWAY`
   - `VITE_USE_HELIA`
   - `VITE_WALLETCONNECT_PROJECT_ID`

4. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Step 5: Configure CORS for Soroban RPC

If you encounter CORS issues with Stellar RPC:

1. **For Futurenet:** Stellar's public RPC already has CORS enabled
2. **For Custom RPC:** Contact your RPC provider to whitelist your domain

### Step 6: Verify Deployment

1. Visit your deployed URL (e.g., `https://afri-assets.vercel.app`)
2. Test wallet connection (Freighter)
3. Test minting an asset
4. Test viewing marketplace
5. Test trading functionality

## Alternative Deployment Options

### Netlify

```bash
cd app
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
});
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

### Custom Server (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/afri-assets;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Post-Deployment Checklist

- [ ] Contract deployed to Futurenet
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Wallet connection working
- [ ] IPFS upload working (test with Pinata)
- [ ] Contract interactions successful (mint, transfer, trade)
- [ ] Events being emitted and captured
- [ ] Mobile responsive design verified
- [ ] Dark/light theme working
- [ ] Error handling working correctly

## Monitoring & Analytics

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

In `src/main.tsx`:
```typescript
import { inject } from '@vercel/analytics';

inject();
```

### Monitor Contract Activity

Use Stellar Expert to monitor your contract:
- Futurenet: `https://stellar.expert/explorer/futurenet/contract/YOUR_CONTRACT_ID`

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm ci`
- Check TypeScript errors: `npm run build`
- Verify environment variables are set

### Wallet Connection Issues
- Ensure Freighter extension is installed
- Check network is set to Futurenet in Freighter
- Verify NETWORK_PASSPHRASE in code matches Futurenet

### IPFS Upload Fails
- Verify Pinata JWT is correct
- Check Pinata account has sufficient storage
- Test with smaller files first

### Contract Invoke Fails
- Ensure CONTRACT_ID is correct
- Verify user has funded account on Futurenet
- Check contract is initialized
- Review transaction in Stellar Expert

## Performance Optimization

1. **Code Splitting:** Already configured in Vite
2. **Image Optimization:** Use WebP format for images
3. **Caching:** Configure proper cache headers
4. **CDN:** Vercel provides global CDN automatically

## Security Considerations

1. **Never commit `.env` files** - Always use `.env.example` as template
2. **Rotate API keys** periodically
3. **Use environment variables** for all sensitive data
4. **Enable HTTPS** (automatic with Vercel)
5. **Implement rate limiting** on API endpoints if using custom backend
