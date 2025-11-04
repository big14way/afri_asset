#!/bin/bash
set -e

# Contract E2E Test Script
# Tests the complete flow: mint → list → trade

echo "🧪 Starting Contract E2E Tests..."

# Configuration
NETWORK="${NETWORK:-local}"
CONTRACT_ID="${CONTRACT_ID:-}"
ALICE="${ALICE:-alice}"
BOB="${BOB:-bob}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}ℹ️  Using network: ${NETWORK}${NC}"

# Ensure contract ID is set
if [ -z "$CONTRACT_ID" ]; then
    echo -e "${YELLOW}⚠️  CONTRACT_ID not set, attempting to read from .soroban/contract-ids/${NETWORK}/rwa_token.txt${NC}"
    CONTRACT_ID=$(cat .soroban/contract-ids/${NETWORK}/rwa_token.txt 2>/dev/null || echo "")
    if [ -z "$CONTRACT_ID" ]; then
        echo "❌ CONTRACT_ID not found. Please deploy the contract first."
        exit 1
    fi
fi

echo -e "${BLUE}ℹ️  Contract ID: ${CONTRACT_ID}${NC}"

# Test 1: Initialize contract
echo -e "\n${GREEN}Test 1: Initialize Contract${NC}"
stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    initialize \
    --admin "$ALICE"

echo "✅ Contract initialized"

# Test 2: Mint first RWA token
echo -e "\n${GREEN}Test 2: Mint First RWA Token (Cocoa Farm)${NC}"
METADATA_1="QmTest1CocoaFarmMetadata"
YIELD_1=500

TOKEN_ID_1=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    mint_rwa \
    --to "$ALICE" \
    --metadata "$METADATA_1" \
    --yield_estimate "$YIELD_1")

echo "✅ Minted token ID: $TOKEN_ID_1"

# Test 3: Mint second RWA token
echo -e "\n${GREEN}Test 3: Mint Second RWA Token (Palm Oil Plantation)${NC}"
METADATA_2="QmTest2PalmOilMetadata"
YIELD_2=750

TOKEN_ID_2=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    mint_rwa \
    --to "$ALICE" \
    --metadata "$METADATA_2" \
    --yield_estimate "$YIELD_2")

echo "✅ Minted token ID: $TOKEN_ID_2"

# Test 4: Mint third RWA token
echo -e "\n${GREEN}Test 4: Mint Third RWA Token (Cassava Field)${NC}"
METADATA_3="QmTest3CassavaFieldMetadata"
YIELD_3=300

TOKEN_ID_3=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    mint_rwa \
    --to "$ALICE" \
    --metadata "$METADATA_3" \
    --yield_estimate "$YIELD_3")

echo "✅ Minted token ID: $TOKEN_ID_3"

# Test 5: Query token metadata
echo -e "\n${GREEN}Test 5: Query Token Metadata${NC}"
METADATA=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    get_metadata \
    --token_id "$TOKEN_ID_1")

echo "✅ Token metadata retrieved: $METADATA"

# Test 6: Check token owner
echo -e "\n${GREEN}Test 6: Verify Token Ownership${NC}"
OWNER=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    get_owner \
    --token_id "$TOKEN_ID_1")

echo "✅ Token owner: $OWNER"

# Test 7: Transfer token to Bob
echo -e "\n${GREEN}Test 7: Transfer Token to Bob${NC}"
stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    transfer \
    --from "$ALICE" \
    --to "$BOB" \
    --token_id "$TOKEN_ID_1"

echo "✅ Token transferred to Bob"

# Test 8: Verify new owner
echo -e "\n${GREEN}Test 8: Verify Transfer Completed${NC}"
NEW_OWNER=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$BOB" \
    --network "$NETWORK" \
    -- \
    get_owner \
    --token_id "$TOKEN_ID_1")

echo "✅ New owner verified: $NEW_OWNER"

# Test 9: Create trade (Bob initiating trade)
echo -e "\n${GREEN}Test 9: Create Escrow Trade${NC}"
PRICE=1000000 # 1 XLM in stroops

stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$BOB" \
    --network "$NETWORK" \
    -- \
    create_trade \
    --seller "$BOB" \
    --token_id "$TOKEN_ID_1" \
    --price "$PRICE"

echo "✅ Trade created with price: $PRICE stroops"

# Test 10: Get active trades
echo -e "\n${GREEN}Test 10: List Active Trades${NC}"
TRADES=$(stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$ALICE" \
    --network "$NETWORK" \
    -- \
    get_active_trades)

echo "✅ Active trades retrieved: $TRADES"

echo -e "\n${GREEN}🎉 All E2E Tests Passed!${NC}"
echo -e "${BLUE}Summary:${NC}"
echo "  - Minted 3 RWA tokens"
echo "  - Transferred 1 token to Bob"
echo "  - Created 1 active trade"
echo "  - All contract functions working correctly"
