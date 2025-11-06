# RWA Token Minting Setup

## Contract Deployment

The RWA token contract has been deployed to Stellar Futurenet with the following details:

- **Contract ID**: `CBZEUEFA2W5GDVTHYG5566L6EGOJVWHCNZB5JPODOBIRE46C3C5UDWO6`
- **Network**: Futurenet (Testnet)
- **Deployer**: `GAFIME2M3VR4KDX6UNDY6H32JGKPTI2FB6NDOCDZIKTCKLBAZWDGCD22`

### Contract Features

1. **Permissionless Minting**: Users can mint tokens for themselves without requiring admin authorization
2. **Persistent Storage**: All contract data uses persistent storage with 1-year TTL extension
3. **Owner Authorization**: Each mint requires the owner's wallet signature

## Frontend Integration

The frontend now includes full Stellar SDK integration for contract interactions:

### Implemented Functions

#### `mintRwa(ipfsHash: string, yieldData: number)`

Located in: `app/src/hooks/useRWAContract.ts`

**Process:**
1. Validates wallet connection
2. Loads source account from Stellar network
3. Converts parameters to Soroban ScVals:
   - `ipfsHash` → String ScVal
   - `owner` (wallet address) → Address ScVal
   - `yieldData` → u128 ScVal
4. Builds contract invocation operation
5. Simulates transaction on network
6. Assembles transaction with auth entries
7. Signs transaction with Freighter wallet
8. Submits to network and polls for confirmation
9. Returns token ID and transaction hash

**Parameters:**
- `metadata`: IPFS hash string (e.g., "bafkreiauy...")
- `owner`: Stellar address (automatically uses connected wallet)
- `yield_data`: Yield amount in stroops (u128)

**Returns:**
```typescript
{
  success: true,
  tokenId: number,
  txHash: string
}
```

### Transaction Flow

```
User clicks "Mint RWA Token"
  ↓
IPFS Upload (Helia or Pinata)
  ↓
Get IPFS hash
  ↓
Build Soroban transaction
  ↓
Simulate on Futurenet RPC
  ↓
Request signature from Freighter
  ↓
User approves in Freighter popup
  ↓
Submit signed transaction
  ↓
Poll for confirmation (max 10 attempts)
  ↓
Parse result & show success toast
  ↓
Add asset to local store
```

### Console Logging

The minting process includes detailed console logging:
- 🔨 Starting mint transaction
- ✓ Loaded source account
- ✓ Converted parameters to ScVals
- ✓ Built contract operation
- ✓ Built transaction
- 📡 Simulating transaction
- ✓ Simulation successful
- ✓ Prepared transaction with auth
- 📝 Transaction XDR ready
- 🔐 Requesting signature from wallet
- ✓ Transaction signed
- 📤 Submitting transaction to network
- ⏳ Waiting for transaction confirmation
- ✅ Transaction successful!

## Testing the Minting Flow

1. **Connect Wallet**: Click "Connect Wallet" and approve in Freighter
2. **Navigate to Mint Page**: Go to `/mint`
3. **Fill Form**:
   - Asset Name (required)
   - Description (required)
   - Region (e.g., "Lagos, Nigeria")
   - Asset Type (e.g., "Real Estate")
   - Expected Yield (in XLM)
   - Upload Image (uploaded to IPFS)
4. **Click "Mint RWA Token"**
5. **Approve in Freighter**: Sign the transaction
6. **Wait for Confirmation**: Watch console logs for progress
7. **Success**: See success toast and asset in store

## Environment Variables

The following environment variables are configured in `app/.env`:

```env
# Contract ID
VITE_CONTRACT_ID=CBZEUEFA2W5GDVTHYG5566L6EGOJVWHCNZB5JPODOBIRE46C3C5UDWO6

# IPFS (using Helia for decentralized storage)
VITE_USE_HELIA=true
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud

# Network
Network: Futurenet
RPC URL: https://rpc-futurenet.stellar.org
Network Passphrase: Test SDF Future Network ; October 2022
```

## Contract Changes

### Storage Migration

Changed from `instance()` to `persistent()` storage:
- Better durability (doesn't expire quickly)
- Explicit TTL extension (31536000 ledgers = ~1 year)
- Prevents "Missing Entry" errors on testnet

### Permissionless Architecture

Removed admin requirement from `mint_rwa`:
- **Before**: Required admin authorization (centralized)
- **After**: Requires owner authorization (decentralized)
- Users can mint tokens for themselves
- Simpler and more aligned with Web3 principles

### TTL Extension

Added explicit TTL extension for all persistent data:
```rust
env.storage()
    .persistent()
    .extend_ttl(&DataKey::TokenCounter, 31536000, 31536000);
```

## Known Issues & Limitations

1. **Testnet Expiration**: Futurenet storage can still expire. For production, use Mainnet
2. **Gas Estimation**: Currently using BASE_FEE. Could be optimized with dynamic fee estimation
3. **Error Handling**: Basic error messages. Could be improved with more specific error codes
4. **Loading States**: Loading indicator works, but no progress percentage
5. **Transaction Retry**: No automatic retry on failure. User must retry manually

## Next Steps

1. **Add Transaction History**: Show past mints in UI
2. **Implement Transfer**: Enable token transfers between users
3. **Implement Trading**: Complete the escrow-based trading feature
4. **Add Event Listening**: Subscribe to RwaMinted events for real-time updates
5. **Deploy to Mainnet**: When ready for production

## Troubleshooting

### "Wallet Not Connected" after connecting
- **Fixed**: WalletContext now syncs with Zustand store automatically

### "Contract ID not configured"
- Check `.env` file has correct VITE_CONTRACT_ID
- Restart dev server after changing .env

### "Simulation failed"
- Check wallet has sufficient XLM balance (need ~1 XLM for fees)
- Verify network is Futurenet in Freighter

### "Transaction failed"
- Check console logs for specific error
- Verify contract hasn't expired (redeploy if needed)
- Ensure wallet signature was approved

## Resources

- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Freighter Wallet](https://www.freighter.app/)
- [Futurenet Explorer](https://futurenet.steexp.com/)
