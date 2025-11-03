# AfriAsset Token Hub - Frontend

React + TypeScript + Vite frontend for the AfriAsset Token Hub RWA tokenization platform.

## Features

- **Wallet Integration**: Connect using Stellar Freighter wallet
- **Asset Minting**: Upload and tokenize real-world assets with IPFS metadata storage
- **Marketplace**: Browse and search tokenized assets
- **Trading**: Execute trades with escrow protection
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Dark/Light Theme**: Accessible theme switching
- **Real-time Updates**: Live marketplace updates via Soroban events

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Stellar SDK** - Blockchain interactions
- **Freighter API** - Wallet connection
- **Pinata** - IPFS storage
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js 18+
- npm or yarn
- Stellar Freighter wallet extension
- Pinata account for IPFS storage

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
```env
VITE_CONTRACT_ID=your_deployed_contract_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
app/
├── src/
│   ├── components/       # React components
│   │   ├── Layout.tsx
│   │   ├── AssetCard.tsx
│   │   ├── MintForm.tsx
│   │   └── TradeModal.tsx
│   ├── pages/           # Route pages
│   │   ├── Home.tsx
│   │   ├── Mint.tsx
│   │   └── Marketplace.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useSoroban.ts
│   │   ├── useRWAContract.ts
│   │   └── useIPFS.ts
│   ├── store/           # Zustand state management
│   │   └── useStore.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json
```

## Usage

### 1. Connect Wallet

Click "Connect Wallet" in the navigation bar and approve the connection in Freighter.

### 2. Mint an Asset

1. Navigate to the "Mint" page
2. Fill in asset details:
   - Name
   - Description
   - Region (e.g., "Lagos, Nigeria")
   - Asset Type
   - Expected Yield (in XLM)
   - Upload an image
3. Click "Mint RWA Token"
4. Confirm the transaction in Freighter

### 3. Browse Marketplace

- Navigate to "Marketplace"
- Search assets by name, region, or description
- Click "Trade" on any asset to initiate a trade

### 4. Trade Assets

1. In the trade modal, enter:
   - Buyer's Stellar address
   - Escrow amount (in XLM)
2. Review the fee estimate
3. Click "Confirm Trade"
4. Sign the transaction in Freighter

## Features Implementation

### Mobile-First Responsive Design

- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Responsive navigation with hamburger menu
- Touch-friendly buttons and inputs
- Optimized for low-bandwidth contexts

### Theme Toggle

- Dark/light mode switching
- Persisted in localStorage
- Respects system preferences
- Low-light optimized dark theme

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on form inputs
- Semantic HTML structure
- Screen reader friendly

### IPFS Integration

- Asset images uploaded to IPFS via Pinata
- Metadata stored as JSON on IPFS
- Decentralized content delivery
- Permanent asset proofs

### Real-time Updates

- Subscribe to `RwaMinted` events
- Automatic marketplace refresh
- Live asset status updates
- Event-driven state management

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONTRACT_ID` | Deployed RWA contract ID | Yes |
| `VITE_PINATA_JWT` | Pinata API JWT token | Yes |
| `VITE_PINATA_GATEWAY` | Pinata gateway URL | Yes |

## Troubleshooting

### Wallet Connection Issues

- Ensure Freighter extension is installed
- Check you're on Stellar Futurenet
- Refresh the page and try again

### IPFS Upload Failures

- Verify Pinata JWT is correct
- Check file size (max 10MB for images)
- Ensure stable internet connection

### Transaction Failures

- Ensure wallet has sufficient XLM balance
- Check contract ID is correct
- Verify network is Futurenet

## License

MIT
