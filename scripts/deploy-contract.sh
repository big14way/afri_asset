#!/bin/bash
set -e

# Contract Deployment Script
# Deploys RWA token contract to specified network (local, testnet, futurenet)

NETWORK="${1:-futurenet}"
SOURCE_ACCOUNT="${2:-default}"

echo "🚀 Deploying RWA Token Contract to $NETWORK..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Build the contract
echo -e "\n${BLUE}[1/5] Building contract...${NC}"
stellar contract build --profile contracts --package rwa_token

# Step 2: Optimize WASM
echo -e "\n${BLUE}[2/5] Optimizing WASM...${NC}"
stellar contract optimize \
    --wasm target/stellar/local/rwa_token.wasm \
    --wasm-out target/stellar/local/rwa_token.optimized.wasm

# Step 3: Deploy contract
echo -e "\n${BLUE}[3/5] Deploying contract to $NETWORK...${NC}"
CONTRACT_ID=$(stellar contract deploy \
    --wasm target/stellar/local/rwa_token.optimized.wasm \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK")

echo -e "${GREEN}✅ Contract deployed!${NC}"
echo -e "${BLUE}Contract ID: $CONTRACT_ID${NC}"

# Step 4: Save contract ID
echo -e "\n${BLUE}[4/5] Saving contract ID...${NC}"
mkdir -p .soroban/contract-ids/$NETWORK
echo "$CONTRACT_ID" > .soroban/contract-ids/$NETWORK/rwa_token.txt

# Also save to app/.env for frontend
if [ "$NETWORK" = "futurenet" ]; then
    echo -e "\n${BLUE}Updating app/.env file...${NC}"
    if [ -f app/.env ]; then
        # Update existing file
        sed -i.bak "s|VITE_CONTRACT_ID=.*|VITE_CONTRACT_ID=$CONTRACT_ID|" app/.env
    else
        # Create from example
        cp app/.env.example app/.env
        sed -i.bak "s|VITE_CONTRACT_ID=.*|VITE_CONTRACT_ID=$CONTRACT_ID|" app/.env
    fi
    echo -e "${GREEN}✅ Updated app/.env${NC}"
fi

# Step 5: Initialize contract
echo -e "\n${BLUE}[5/5] Initializing contract...${NC}"
ADMIN=$(stellar keys address "$SOURCE_ACCOUNT")

stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    initialize \
    --admin "$ADMIN"

echo -e "${GREEN}✅ Contract initialized with admin: $ADMIN${NC}"

# Summary
echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Network:      ${YELLOW}$NETWORK${NC}"
echo -e "Contract ID:  ${YELLOW}$CONTRACT_ID${NC}"
echo -e "Admin:        ${YELLOW}$ADMIN${NC}"
echo -e "WASM:         target/stellar/local/rwa_token.optimized.wasm"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Next steps
echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Update frontend .env with CONTRACT_ID=$CONTRACT_ID"
echo "  2. Run: npm run build (in app directory)"
echo "  3. Deploy frontend to Vercel"
echo "  4. Test the application"

# Export for shell session
echo -e "\n${BLUE}To use in this session:${NC}"
echo "export CONTRACT_ID=$CONTRACT_ID"
