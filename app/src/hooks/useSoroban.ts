import { useState, useCallback } from 'react';
import { isAllowed, setAllowed } from '@stellar/freighter-api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

// Contract configuration
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';
const NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022';

export const useSoroban = () => {
  const { setWalletAddress, setIsConnected } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const allowed = await isAllowed();
      if (!allowed) {
        await setAllowed();
      }

      // Get network details from Freighter
      const { networkPassphrase } = await (window as any).freighterApi.getNetworkDetails();

      if (networkPassphrase !== NETWORK_PASSPHRASE) {
        throw new Error('Please switch to Stellar Futurenet in Freighter');
      }

      const publicKey = await (window as any).freighterApi.getPublicKey();
      setWalletAddress(publicKey);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
      return publicKey;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [setWalletAddress, setIsConnected]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  }, [setWalletAddress, setIsConnected]);

  // Submit transaction placeholder
  // Note: This is a simplified version. In production, use Stellar SDK v14 API
  const submitTransaction = useCallback(async (_operation: any) => {
    try {
      // This is a placeholder for transaction submission
      // In a real implementation, you would:
      // 1. Build the transaction with Stellar SDK
      // 2. Simulate it
      // 3. Sign with Freighter
      // 4. Submit to the network
      toast('Transaction submission is a placeholder. Implement with Stellar SDK v14 API.');
      return null;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }, []);

  return {
    connectWallet,
    disconnectWallet,
    submitTransaction,
    isConnecting,
    CONTRACT_ID,
  };
};
