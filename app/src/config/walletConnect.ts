import { createAppKit } from '@reown/appkit';
import { mainnet } from 'viem/chains';

// WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Metadata for the dApp
const metadata = {
  name: 'AfriAsset Token Hub',
  description: 'RWA Tokenization Platform for African Assets on Stellar',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://afriasset.app',
  icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/vite.svg`],
};

// Custom Stellar Futurenet configuration
// Note: Since Stellar adapter is not available yet, we're setting up the infrastructure
// that can be easily integrated when the adapter becomes available

export interface StellarNetwork {
  id: string;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: string;
}

export const stellarFuturenet: StellarNetwork = {
  id: 'stellar-futurenet',
  name: 'Stellar Futurenet',
  rpcUrl: 'https://rpc-futurenet.stellar.org:443',
  nativeCurrency: {
    name: 'Stellar Lumens',
    symbol: 'XLM',
    decimals: 7,
  },
  blockExplorer: 'https://stellar.expert/explorer/futurenet',
};

export const stellarTestnet: StellarNetwork = {
  id: 'stellar-testnet',
  name: 'Stellar Testnet',
  rpcUrl: 'https://soroban-testnet.stellar.org:443',
  nativeCurrency: {
    name: 'Stellar Lumens',
    symbol: 'XLM',
    decimals: 7,
  },
  blockExplorer: 'https://stellar.expert/explorer/testnet',
};

// Initialize AppKit
// Note: When Stellar adapter becomes available, this will be updated to use it
let appKit: ReturnType<typeof createAppKit> | null = null;

export const initializeAppKit = () => {
  if (!projectId) {
    console.warn('WalletConnect Project ID not set. WalletConnect features will be disabled.');
    return null;
  }

  try {
    // Using EVM chains as fallback until Stellar adapter is available
    // This provides the infrastructure for multi-wallet support
    appKit = createAppKit({
      adapters: [], // Will add Stellar adapter when available
      networks: [mainnet], // Using mainnet as placeholder
      metadata,
      projectId,
      features: {
        analytics: true,
        email: false,
        socials: false,
      },
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#22c55e', // Primary green color
      },
    });

    return appKit;
  } catch (error) {
    console.error('Error initializing AppKit:', error);
    return null;
  }
};

// Export for use in components
export const getAppKit = () => appKit;

// Utility to check if WalletConnect is configured
export const isWalletConnectEnabled = () => {
  return Boolean(projectId && appKit);
};
