#!/bin/bash

# AfriAsset RWA Token Deployment Script
# This script deploys the RWA token contract to Stellar Futurenet

set -e

echo "🚀 AfriAsset RWA Token Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NETWORK="futurenet"
CONTRACT_NAME="rwa_token"
WASM_PATH="target/wasm32-unknown-unknown/release/rwa_token.wasm"

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo -e "${YELLOW}⚠️  Soroban CLI not found. Installing...${NC}"
    cargo install --locked soroban-cli
fi

# Step 1: Build the contract
echo -e "${BLUE}📦 Step 1: Building contract...${NC}"
cargo build --package $CONTRACT_NAME --target wasm32-unknown-unknown --release

if [ -f "$WASM_PATH" ]; then
    echo -e "${GREEN}✅ Contract built successfully!${NC}"
else
    echo "❌ Error: WASM file not found at $WASM_PATH"
    exit 1
fi

# Step 2: Check if network is configured
echo -e "\n${BLUE}🌐 Step 2: Checking network configuration...${NC}"
if ! soroban network ls | grep -q "futurenet"; then
    echo "Adding Futurenet network..."
    soroban network add \
      --global futurenet \
      --rpc-url https://rpc-futurenet.stellar.org:443 \
      --network-passphrase "Test SDF Future Network ; October 2022"
    echo -e "${GREEN}✅ Futurenet network added${NC}"
else
    echo -e "${GREEN}✅ Futurenet network already configured${NC}"
fi

# Step 3: Check for identity
echo -e "\n${BLUE}🔑 Step 3: Checking identity...${NC}"
if ! soroban keys ls | grep -q "alice"; then
    echo "Creating new identity 'alice'..."
    soroban keys generate --global alice --network futurenet
    ADDRESS=$(soroban keys address alice)
    echo -e "${GREEN}✅ Identity created: $ADDRESS${NC}"
    echo -e "${YELLOW}⚠️  Please fund this account at:${NC}"
    echo "https://laboratory.stellar.org/#account-creator?network=futurenet"
    echo ""
    read -p "Press ENTER after funding the account..."
else
    ADDRESS=$(soroban keys address alice)
    echo -e "${GREEN}✅ Using existing identity: $ADDRESS${NC}"
fi

# Step 4: Deploy contract
echo -e "\n${BLUE}🚀 Step 4: Deploying contract...${NC}"
CONTRACT_ID=$(soroban contract deploy \
  --wasm $WASM_PATH \
  --source alice \
  --network $NETWORK)

echo -e "${GREEN}✅ Contract deployed!${NC}"
echo -e "${GREEN}Contract ID: $CONTRACT_ID${NC}"

# Save contract ID to file
echo $CONTRACT_ID > .contract_id
echo "Contract ID saved to .contract_id"

# Step 5: Initialize contract
echo -e "\n${BLUE}⚙️  Step 5: Initializing contract...${NC}"
echo "Using $ADDRESS as admin..."

soroban contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network $NETWORK \
  -- initialize \
  --admin $ADDRESS

echo -e "${GREEN}✅ Contract initialized!${NC}"

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Contract ID: $CONTRACT_ID"
echo "Network: Futurenet"
echo "Admin: $ADDRESS"
echo ""
echo "Example commands:"
echo ""
echo "1. Mint an RWA token:"
echo "   soroban contract invoke \\"
echo "     --id $CONTRACT_ID \\"
echo "     --source alice \\"
echo "     --network futurenet \\"
echo "     -- mint_rwa \\"
echo "     --metadata \"QmYourIPFSHash\" \\"
echo "     --owner $ADDRESS \\"
echo "     --yield_data 1000"
echo ""
echo "2. Get token count:"
echo "   soroban contract invoke \\"
echo "     --id $CONTRACT_ID \\"
echo "     --source alice \\"
echo "     --network futurenet \\"
echo "     -- get_token_count"
echo ""
echo "3. View contract on Stellar Explorer:"
echo "   https://stellar.expert/explorer/futurenet/contract/$CONTRACT_ID"
echo ""
