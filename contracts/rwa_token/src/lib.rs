#![no_std]

use admin_sep::{Administratable, Upgradable};
use soroban_sdk::{
    Address, Env, String, contract, contracterror, contractevent, contractimpl, contracttype,
};

// Token ID type
pub type TokenId = u64;

// Metadata structure for RWA tokens
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Metadata {
    pub ipfs_hash: String,
    pub owner: Address,
    pub yield_data: u128,
    pub is_active: bool,
}

// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenCounter,
    TokenData(TokenId),
    EscrowBalance(TokenId),
}

// Custom errors
#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    TokenNotFound = 4,
    TokenInactive = 5,
    InsufficientEscrow = 6,
    TransferFailed = 7,
}

// Contract events
#[contractevent]
pub struct RwaMinted {
    pub token_id: TokenId,
    pub owner: Address,
    pub metadata: String,
}

#[contractevent]
pub struct Transfer {
    pub token_id: TokenId,
    pub from: Address,
    pub to: Address,
}

#[contractevent]
pub struct Trade {
    pub token_id: TokenId,
    pub from: Address,
    pub to: Address,
    pub escrow: u128,
}

#[contractevent]
pub struct Burned {
    pub token_id: TokenId,
    pub owner: Address,
}

#[contractevent]
pub struct Initialized {
    pub admin: Address,
}

#[contract]
pub struct RwaToken;

#[contractimpl]
impl Administratable for RwaToken {}

#[contractimpl]
impl Upgradable for RwaToken {}

#[contractimpl]
impl RwaToken {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        // Set admin
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Initialize token counter
        env.storage().instance().set(&DataKey::TokenCounter, &0u64);

        // Emit initialization event
        Initialized {
            admin: admin.clone(),
        }
        .publish(&env);

        Ok(())
    }

    /// Mint a new RWA token
    pub fn mint_rwa(
        env: Env,
        metadata: String,
        owner: Address,
        yield_data: u128,
    ) -> Result<TokenId, Error> {
        // Check if initialized
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        // Require admin authorization
        admin.require_auth();

        // Get and increment token counter
        let token_id: TokenId = env
            .storage()
            .instance()
            .get(&DataKey::TokenCounter)
            .unwrap_or(0u64);

        let next_id = token_id + 1;
        env.storage()
            .instance()
            .set(&DataKey::TokenCounter, &next_id);

        // Create metadata
        let token_metadata = Metadata {
            ipfs_hash: metadata.clone(),
            owner: owner.clone(),
            yield_data,
            is_active: true,
        };

        // Store token data
        env.storage()
            .instance()
            .set(&DataKey::TokenData(token_id), &token_metadata);

        // Emit minting event
        RwaMinted {
            token_id,
            owner: owner.clone(),
            metadata: metadata.clone(),
        }
        .publish(&env);

        Ok(token_id)
    }

    /// Transfer token ownership
    pub fn transfer(env: Env, token_id: TokenId, to: Address) -> Result<(), Error> {
        // Get token data
        let mut token_data: Metadata = env
            .storage()
            .instance()
            .get(&DataKey::TokenData(token_id))
            .ok_or(Error::TokenNotFound)?;

        // Check if token is active
        if !token_data.is_active {
            return Err(Error::TokenInactive);
        }

        // Require current owner authorization
        token_data.owner.require_auth();

        // Update owner
        let old_owner = token_data.owner.clone();
        token_data.owner = to.clone();

        // Save updated data
        env.storage()
            .instance()
            .set(&DataKey::TokenData(token_id), &token_data);

        // Emit transfer event
        Transfer {
            token_id,
            from: old_owner,
            to: to.clone(),
        }
        .publish(&env);

        Ok(())
    }

    /// Trade token with escrow mechanism using native XLM
    pub fn trade_with_escrow(
        env: Env,
        token_id: TokenId,
        buyer: Address,
        escrow_xlm: u128,
    ) -> Result<(), Error> {
        // Get token data
        let mut token_data: Metadata = env
            .storage()
            .instance()
            .get(&DataKey::TokenData(token_id))
            .ok_or(Error::TokenNotFound)?;

        // Check if token is active
        if !token_data.is_active {
            return Err(Error::TokenInactive);
        }

        // Require buyer authorization
        buyer.require_auth();

        // Validate escrow amount (must be greater than yield_data)
        if escrow_xlm < token_data.yield_data {
            return Err(Error::InsufficientEscrow);
        }

        // Store escrow balance
        env.storage()
            .instance()
            .set(&DataKey::EscrowBalance(token_id), &escrow_xlm);

        // Transfer ownership
        let old_owner = token_data.owner.clone();
        token_data.owner = buyer.clone();
        env.storage()
            .instance()
            .set(&DataKey::TokenData(token_id), &token_data);

        // Emit trade event
        Trade {
            token_id,
            from: old_owner,
            to: buyer.clone(),
            escrow: escrow_xlm,
        }
        .publish(&env);

        Ok(())
    }

    /// Burn/deactivate a token (for expired assets)
    pub fn burn(env: Env, token_id: TokenId) -> Result<(), Error> {
        // Get token data
        let mut token_data: Metadata = env
            .storage()
            .instance()
            .get(&DataKey::TokenData(token_id))
            .ok_or(Error::TokenNotFound)?;

        // Require owner authorization
        token_data.owner.require_auth();

        // Deactivate token
        token_data.is_active = false;
        let owner = token_data.owner.clone();
        env.storage()
            .instance()
            .set(&DataKey::TokenData(token_id), &token_data);

        // Emit burn event
        Burned { token_id, owner }.publish(&env);

        Ok(())
    }

    /// Get token metadata
    pub fn get_token(env: Env, token_id: TokenId) -> Result<Metadata, Error> {
        env.storage()
            .instance()
            .get(&DataKey::TokenData(token_id))
            .ok_or(Error::TokenNotFound)
    }

    /// Get total number of tokens minted
    pub fn get_token_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TokenCounter)
            .unwrap_or(0u64)
    }

    /// Get admin address
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Get escrow balance for a token
    pub fn get_escrow(env: Env, token_id: TokenId) -> Option<u128> {
        env.storage()
            .instance()
            .get(&DataKey::EscrowBalance(token_id))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env, String};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);

        env.mock_all_auths();
        let _ = client.try_initialize(&admin).unwrap();

        // Verify admin is set
        let stored_admin = client.get_admin();
        assert_eq!(stored_admin, Some(admin));
    }

    #[test]
    fn test_mint_rwa() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let owner = Address::generate(&env);

        env.mock_all_auths();

        // Initialize
        let _ = client.try_initialize(&admin).unwrap();

        // Mint token
        let metadata = String::from_str(&env, "QmTestIPFSHash123");
        let yield_data = 1000u128;
        let token_id = client
            .try_mint_rwa(&metadata, &owner, &yield_data)
            .unwrap()
            .unwrap();

        assert_eq!(token_id, 0u64);

        // Verify token data
        let token = client.try_get_token(&token_id).unwrap().unwrap();
        assert_eq!(token.owner, owner);
        assert_eq!(token.ipfs_hash, metadata);
        assert_eq!(token.yield_data, yield_data);
        assert!(token.is_active);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let new_owner = Address::generate(&env);

        env.mock_all_auths();

        // Initialize and mint
        let _ = client.try_initialize(&admin).unwrap();
        let metadata = String::from_str(&env, "QmTestIPFSHash123");
        let token_id = client
            .try_mint_rwa(&metadata, &owner, &1000u128)
            .unwrap()
            .unwrap();

        // Transfer
        let _ = client.try_transfer(&token_id, &new_owner).unwrap();

        // Verify new owner
        let token = client.try_get_token(&token_id).unwrap().unwrap();
        assert_eq!(token.owner, new_owner);
    }

    #[test]
    fn test_trade_with_escrow() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        env.mock_all_auths();

        // Initialize and mint
        let _ = client.try_initialize(&admin).unwrap();
        let metadata = String::from_str(&env, "QmTestIPFSHash123");
        let yield_data = 1000u128;
        let token_id = client
            .try_mint_rwa(&metadata, &seller, &yield_data)
            .unwrap()
            .unwrap();

        // Trade with sufficient escrow
        let escrow_amount = 2000u128;
        let _ = client
            .try_trade_with_escrow(&token_id, &buyer, &escrow_amount)
            .unwrap();

        // Verify new owner
        let token = client.try_get_token(&token_id).unwrap().unwrap();
        assert_eq!(token.owner, buyer);

        // Verify escrow
        let escrow = client.get_escrow(&token_id).unwrap();
        assert_eq!(escrow, escrow_amount);
    }

    #[test]
    fn test_burn() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let owner = Address::generate(&env);

        env.mock_all_auths();

        // Initialize and mint
        let _ = client.try_initialize(&admin).unwrap();
        let metadata = String::from_str(&env, "QmTestIPFSHash123");
        let token_id = client
            .try_mint_rwa(&metadata, &owner, &1000u128)
            .unwrap()
            .unwrap();

        // Burn
        let _ = client.try_burn(&token_id).unwrap();

        // Verify token is inactive
        let token = client.try_get_token(&token_id).unwrap().unwrap();
        assert!(!token.is_active);
    }

    #[test]
    #[should_panic(expected = "InsufficientEscrow")]
    fn test_trade_insufficient_escrow() {
        let env = Env::default();
        let contract_id = env.register(RwaToken, ());
        let client = RwaTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        env.mock_all_auths();

        // Initialize and mint
        let _ = client.try_initialize(&admin).unwrap();
        let metadata = String::from_str(&env, "QmTestIPFSHash123");
        let yield_data = 1000u128;
        let token_id = client
            .try_mint_rwa(&metadata, &seller, &yield_data)
            .unwrap()
            .unwrap();

        // Try to trade with insufficient escrow
        let escrow_amount = 500u128; // Less than yield_data
        let _ = client
            .try_trade_with_escrow(&token_id, &buyer, &escrow_amount)
            .unwrap();
    }
}
