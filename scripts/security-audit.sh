#!/bin/bash
set -e

# Security Audit Script for RWA Token Contract

echo "🔒 Running Security Audit..."

AUDIT_PASSED=true

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Checking contract code for common vulnerabilities...${NC}\n"

# Check 1: Reentrancy Protection (Checks-Effects-Interactions pattern)
echo -e "${BLUE}[1/6] Checking for reentrancy vulnerabilities...${NC}"
if grep -r "transfer\|invoke" contracts/rwa_token/src/lib.rs | grep -v "// CEI:" > /dev/null; then
    echo -e "${YELLOW}⚠️  Review external calls to ensure Checks-Effects-Interactions pattern${NC}"
else
    echo -e "${GREEN}✅ No obvious reentrancy issues detected${NC}"
fi

# Check 2: Authorization checks
echo -e "\n${BLUE}[2/6] Verifying authorization checks...${NC}"
if grep -A 5 "pub fn" contracts/rwa_token/src/lib.rs | grep "require_auth\|has_administrator" > /dev/null; then
    echo -e "${GREEN}✅ Authorization checks present${NC}"
else
    echo -e "${RED}❌ Missing authorization checks${NC}"
    AUDIT_PASSED=false
fi

# Check 3: Integer overflow/underflow
echo -e "\n${BLUE}[3/6] Checking for arithmetic safety...${NC}"
if grep -E "checked_add|checked_sub|checked_mul|checked_div" contracts/rwa_token/src/lib.rs > /dev/null; then
    echo -e "${GREEN}✅ Using checked arithmetic operations${NC}"
else
    echo -e "${YELLOW}⚠️  Consider using checked arithmetic for safety${NC}"
fi

# Check 4: Input validation
echo -e "\n${BLUE}[4/6] Checking input validation...${NC}"
if grep -E "require!|panic_with_error|Error::" contracts/rwa_token/src/lib.rs > /dev/null; then
    echo -e "${GREEN}✅ Input validation implemented${NC}"
else
    echo -e "${RED}❌ Missing input validation${NC}"
    AUDIT_PASSED=false
fi

# Check 5: Storage access patterns
echo -e "\n${BLUE}[5/6] Analyzing storage access patterns...${NC}"
if grep -E "env\.storage\(\)\.(instance|persistent|temporary)" contracts/rwa_token/src/lib.rs > /dev/null; then
    echo -e "${GREEN}✅ Using Soroban storage API${NC}"
else
    echo -e "${YELLOW}⚠️  Review storage access patterns${NC}"
fi

# Check 6: Rate limiting considerations
echo -e "\n${BLUE}[6/6] Checking for rate limiting...${NC}"
if grep -i "rate.limit\|cooldown\|last_mint_time" contracts/rwa_token/src/lib.rs > /dev/null; then
    echo -e "${GREEN}✅ Rate limiting implemented${NC}"
else
    echo -e "${YELLOW}⚠️  Consider implementing rate limiting for mint operations${NC}"
fi

# Additional checks
echo -e "\n${BLUE}Additional Security Recommendations:${NC}"
echo "  1. ✓ Use require_auth() for all privileged operations"
echo "  2. ✓ Validate all input parameters (addresses, amounts, metadata)"
echo "  3. ✓ Follow Checks-Effects-Interactions pattern for external calls"
echo "  4. ✓ Implement rate limiting for mint operations (e.g., max 10/day per user)"
echo "  5. ✓ Use events for all state changes for transparency"
echo "  6. ✓ Test edge cases (zero amounts, invalid addresses, duplicate tokens)"
echo "  7. ✓ Consider maximum token supply limits"
echo "  8. ✓ Implement emergency pause functionality for admin"

# Security best practices checklist
echo -e "\n${BLUE}Security Best Practices Checklist:${NC}"
echo "  [ ] All functions with state changes have authorization checks"
echo "  [ ] No unsafe arithmetic operations"
echo "  [ ] External calls follow CEI pattern"
echo "  [ ] Input validation on all public functions"
echo "  [ ] Events emitted for all state changes"
echo "  [ ] Rate limiting on critical operations"
echo "  [ ] Emergency pause mechanism"
echo "  [ ] Comprehensive test coverage (>80%)"
echo "  [ ] Fuzz testing implemented"
echo "  [ ] External audit completed (if production)"

if [ "$AUDIT_PASSED" = true ]; then
    echo -e "\n${GREEN}✅ Security audit completed - No critical issues found${NC}"
    echo -e "${YELLOW}Note: This is an automated check. Manual review recommended for production.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Security audit found critical issues - Please review${NC}"
    exit 1
fi
