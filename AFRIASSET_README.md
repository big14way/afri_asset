# AfriAsset Token Hub

A micro-Real-World Asset (RWA) tokenization platform for African users, built on Stellar's Soroban blockchain.

## Project Overview

AfriAsset Token Hub enables users to tokenize real-world assets (like crop yields, livestock, or other tangible goods) as NFTs on the Stellar blockchain. The platform focuses on:

- **Inclusive Finance**: Low fees and mobile-friendly UX for emerging markets
- **Asset Tokenization**: Convert illiquid assets into tradable digital tokens
- **Marketplace**: Browse and trade tokenized assets with atomic swaps
- **IPFS Integration**: Decentralized storage for asset proofs and metadata

## Tech Stack

- **Smart Contracts**: Rust + Soroban SDK (Stellar)
- **Frontend**: React 18+ with TypeScript and Vite
- **Blockchain**: Stellar Soroban (testnet: Futurenet)
- **Storage**: IPFS for asset metadata
- **Wallet**: Stellar Wallet Kit + Reown AppKit (WalletConnect v2)

## Phase 1: Smart Contract Development ✅

### RWA Token Contract

The core smart contract (`contracts/rwa_token`) implements:

#### Features
- **NFT Minting**: Create unique RWA tokens with IPFS metadata
- **Ownership Transfer**: Transfer tokens between addresses
- **Escrow Trading**: Atomic swaps with XLM escrow
- **Token Burning**: Deactivate expired or invalid tokens
- **Event Emissions**: Track all contract activities

#### Contract Functions

```rust
// Initialize contract with admin
initialize(admin: Address) -> Result<(), Error>

// Mint new RWA token
mint_rwa(metadata: String, owner: Address, yield_data: u128) -> Result<TokenId, Error>

// Transfer token ownership
transfer(token_id: TokenId, to: Address) -> Result<(), Error>

// Trade with escrow
trade_with_escrow(token_id: TokenId, buyer: Address, escrow_xlm: u128) -> Result<(), Error>

// Burn/deactivate token
burn(token_id: TokenId) -> Result<(), Error>

// Query functions
get_token(token_id: TokenId) -> Result<Metadata, Error>
get_token_count() -> u64
get_admin() -> Option<Address>
get_escrow(token_id: TokenId) -> Option<u128>
```

## Getting Started

### Prerequisites

- Rust 1.89+ with `wasm32-unknown-unknown` target
- Soroban CLI
- Node.js 18+
- Docker (for local testnet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/big14way/afri_asset.git
cd afri_asset
```

2. Install Rust target:
```bash
rustup target add wasm32-unknown-unknown
```

3. Install dependencies:
```bash
cargo build
```

### Building the Contract

Build the RWA token contract:
```bash
cargo build --package rwa_token --target wasm32-unknown-unknown --release
```

The compiled WASM file will be at:
```
target/wasm32-unknown-unknown/release/rwa_token.wasm
```

### Running Tests

```bash
cargo test --package rwa_token
```

All 6 tests should pass:
- ✅ test_initialize
- ✅ test_mint_rwa
- ✅ test_transfer
- ✅ test_trade_with_escrow
- ✅ test_burn
- ✅ test_trade_insufficient_escrow

### Deployment

#### Deploy to Futurenet (Testnet)

1. Install Soroban CLI:
```bash
cargo install --locked soroban-cli
```

2. Configure Futurenet network:
```bash
soroban network add \
  --global futurenet \
  --rpc-url https://rpc-futurenet.stellar.org:443 \
  --network-passphrase "Test SDF Future Network ; October 2022"
```

3. Create and fund test account:
```bash
soroban keys generate --global alice --network futurenet
soroban keys address alice

# Fund account at: https://laboratory.stellar.org/#account-creator?network=futurenet
```

4. Deploy contract:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/rwa_token.wasm \
  --source alice \
  --network futurenet
```

Save the contract ID returned from this command!

5. Initialize contract (replace `<CONTRACT_ID>` and `<ADMIN_ADDRESS>`):
```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network futurenet \
  -- initialize \
  --admin <ADMIN_ADDRESS>
```

#### Example: Mint an RWA Token

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network futurenet \
  -- mint_rwa \
  --metadata "QmYourIPFSHashHere" \
  --owner <OWNER_ADDRESS> \
  --yield_data 1000
```

## Contract Architecture

### Data Structures

**Metadata**:
```rust
pub struct Metadata {
    pub ipfs_hash: String,      // IPFS hash for asset proof
    pub owner: Address,          // Current owner
    pub yield_data: u128,        // Expected yield/value
    pub is_active: bool,         // Token status
}
```

**Events**:
- `Initialized`: Contract initialization
- `RwaMinted`: New token created
- `Transfer`: Ownership change
- `Trade`: Escrow trade completed
- `Burned`: Token deactivated

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 1 | NotInitialized | Contract not initialized |
| 2 | AlreadyInitialized | Contract already initialized |
| 3 | Unauthorized | Caller not authorized |
| 4 | TokenNotFound | Token ID doesn't exist |
| 5 | TokenInactive | Token is deactivated |
| 6 | InsufficientEscrow | Escrow amount too low |
| 7 | TransferFailed | Transfer operation failed |

## Development Roadmap

- [x] Phase 1: Smart Contract Development
  - [x] RWA token contract
  - [x] Minting, transfer, trading functions
  - [x] Event emissions
  - [x] Comprehensive tests
  - [x] Build and deployment configuration

- [ ] Phase 2: Frontend Development
  - [ ] React/Vite/TypeScript setup
  - [ ] Wallet integration (Freighter + AppKit)
  - [ ] Asset upload and minting UI
  - [ ] Marketplace dashboard
  - [ ] IPFS integration

- [ ] Phase 3: Advanced Features
  - [ ] Mobile wallet support (QR codes)
  - [ ] Multi-asset support
  - [ ] Fractional ownership
  - [ ] Trade fee implementation (0.5%)

- [ ] Phase 4: Production Deployment
  - [ ] Mainnet deployment
  - [ ] Frontend hosting (Vercel/Netlify)
  - [ ] Documentation and tutorials

## Project Structure

```
afri_asset/
├── contracts/
│   ├── rwa_token/          # Main RWA token contract
│   │   ├── src/
│   │   │   └── lib.rs      # Contract implementation
│   │   └── Cargo.toml
│   ├── registry/            # Scaffold Stellar registry
│   └── test/                # Example contracts
├── website/                 # Frontend (Phase 2)
├── Cargo.toml               # Workspace configuration
└── AFRIASSET_README.md      # This file
```

## Contributing

This is a hackathon project. Contributions are welcome!

## License

MIT License - see LICENSE file for details

## Contact

GitHub: [@big14way](https://github.com/big14way)
