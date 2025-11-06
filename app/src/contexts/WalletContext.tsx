import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  type ISupportedWallet,
  FreighterModule,
  xBullModule,
  AlbedoModule,
  RabetModule,
  LobstrModule,
  HanaModule
} from '@creit.tech/stellar-wallets-kit';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export interface WalletContextType {
  // Connection state
  isConnected: boolean;
  address: string | null;
  walletType: string | null;

  // Connection methods
  connect: () => Promise<string | null>;
  disconnect: () => void;

  // Transaction methods
  signTransaction: (xdr: string) => Promise<string>;

  // Network info
  networkPassphrase: string;
  isCorrectNetwork: boolean;

  // Wallet kit instance
  kit: StellarWalletsKit | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

// Initialize Stellar Wallets Kit - Initialize lazily to avoid SSR issues
let kit: StellarWalletsKit | null = null;

const getKit = () => {
  if (!kit && typeof window !== 'undefined') {
    try {
      kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FreighterModule.moduleId,
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new AlbedoModule(),
          new RabetModule(),
          new LobstrModule(),
          new HanaModule(),
        ],
      });
    } catch (error) {
      console.error('Failed to initialize Stellar Wallets Kit:', error);
      throw error;
    }
  }
  return kit;
};

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isCorrectNetwork] = useState(true);

  // Get Zustand store actions
  const { setWalletAddress, setIsConnected: setStoreConnected } = useStore();

  // Sync wallet state with Zustand store whenever it changes
  useEffect(() => {
    console.log('🔄 Syncing wallet state to store:', { address, isConnected });
    setWalletAddress(address);
    setStoreConnected(isConnected);
  }, [address, isConnected, setWalletAddress, setStoreConnected]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const walletKit = getKit();
        if (!walletKit) return;

        const { address: publicKey } = await walletKit.getAddress();
        if (publicKey) {
          console.log('✓ Found existing wallet connection:', publicKey);
          setAddress(publicKey);
          setIsConnected(true);
          setWalletType(walletKit.selectedWallet?.name || null);
        }
      } catch {
        console.log('No existing wallet connection');
      }
    };

    checkExistingConnection();
  }, []);

  // Connect wallet
  const connect = useCallback(async (): Promise<string | null> => {
    try {
      const walletKit = getKit();
      if (!walletKit) {
        toast.error('Wallet kit not initialized');
        return null;
      }

      console.log('🔐 Opening wallet selector...');

      // Open wallet modal for user to select wallet
      await walletKit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          console.log(`Selected wallet: ${option.name}`);
          setWalletType(option.name);

          try {
            // Set the selected wallet
            walletKit.setWallet(option.id);

            // Get address from the wallet
            const { address: publicKey } = await walletKit.getAddress();

            console.log('✓ Wallet connected:', publicKey);
            setAddress(publicKey);
            setIsConnected(true);

            toast.success(`${option.name} wallet connected!`);
          } catch (err: unknown) {
            console.error('Error connecting wallet:', err);
            toast.error(`Failed to connect ${option.name}`);
            throw err;
          }
        },
      });

      return address;
    } catch (error: unknown) {
      console.error('❌ Error in wallet connection:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage && !errorMessage.includes('User cancelled')) {
        toast.error('Failed to connect wallet');
      }
      return null;
    }
  }, [address]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    console.log('🔓 Disconnecting wallet...');
    setIsConnected(false);
    setAddress(null);
    setWalletType(null);
    toast.success('Wallet disconnected');
  }, []);

  // Sign transaction
  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const walletKit = getKit();
    if (!walletKit) {
      throw new Error('Wallet kit not initialized');
    }

    try {
      console.log('📝 Requesting transaction signature...');

      const { signedTxXdr } = await walletKit.signTransaction(xdr, {
        address,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      console.log('✓ Transaction signed');
      return signedTxXdr;
    } catch (error: unknown) {
      console.error('❌ Error signing transaction:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('User declined')) {
        toast.error('Transaction declined by user');
      } else {
        toast.error('Failed to sign transaction');
      }
      throw error;
    }
  }, [isConnected, address]);

  const value: WalletContextType = {
    isConnected,
    address,
    walletType,
    connect,
    disconnect,
    signTransaction,
    networkPassphrase: NETWORK_PASSPHRASE,
    isCorrectNetwork,
    kit: getKit(),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
