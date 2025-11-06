import { useCallback } from 'react';
import { useSoroban } from './useSoroban';
import { useStore } from '../store/useStore';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';
import {
  rpc,
  TransactionBuilder,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
} from '@stellar/stellar-sdk';

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const RPC_URL = 'https://soroban-testnet.stellar.org';

export const useRWAContract = () => {
  const { CONTRACT_ID } = useSoroban();
  const { addAsset, setAssets, setIsLoading, walletAddress } = useStore();
  const { signTransaction, address } = useWallet();

  // Mint RWA token
  const mintRwa = useCallback(async (
    ipfsHash: string,
    yieldData: number,
    metadata?: {
      name: string;
      description: string;
      region: string;
      imageUrl: string;
      yieldEstimate: number;
    }
  ) => {
    if (!walletAddress || !address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    if (!CONTRACT_ID) {
      toast.error('Contract ID not configured');
      return null;
    }

    setIsLoading(true);
    try {
      console.log('🔨 Starting mint transaction...');
      console.log('Contract ID:', CONTRACT_ID);
      console.log('IPFS Hash:', ipfsHash);
      console.log('Yield Data:', yieldData);
      console.log('Wallet Address:', address);

      // Initialize Stellar SDK
      const server = new rpc.Server(RPC_URL);

      // Load the source account (try to fund if it doesn't exist)
      let sourceAccount;
      try {
        sourceAccount = await server.getAccount(address);
        console.log('✓ Loaded source account');
      } catch (error: any) {
        if (error?.message?.includes('Account not found')) {
          console.log('⚠️ Account not found on Testnet. Funding account...');
          toast('Funding your account on Stellar Testnet...', { icon: '💰' });

          try {
            // Fund account using Friendbot
            const friendbotUrl = `https://friendbot.stellar.org/?addr=${address}`;
            const response = await fetch(friendbotUrl);

            if (!response.ok) {
              throw new Error('Failed to fund account');
            }

            console.log('✓ Account funded successfully');
            toast.success('Account funded! Continuing with mint...');

            // Wait a moment for the account to be available
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Try loading account again
            sourceAccount = await server.getAccount(address);
            console.log('✓ Loaded source account after funding');
          } catch (fundError: any) {
            console.error('❌ Failed to fund account:', fundError);
            toast.error('Failed to fund account on Testnet. Please try again.');
            return null;
          }
        } else {
          throw error;
        }
      }

      // Convert parameters to ScVals
      const metadataScVal = nativeToScVal(ipfsHash);
      const ownerScVal = Address.fromString(address).toScVal();
      const yieldDataScVal = nativeToScVal(yieldData, { type: 'u128' });

      console.log('✓ Converted parameters to ScVals');

      // Build contract invocation operation
      const contract = new Contract(CONTRACT_ID);
      const operation = contract.call(
        'mint_rwa',
        metadataScVal,
        ownerScVal,
        yieldDataScVal
      );

      console.log('✓ Built contract operation');

      // Build transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      console.log('✓ Built transaction');

      // Simulate transaction
      console.log('📡 Simulating transaction...');
      const simulationResponse = await server.simulateTransaction(transaction);

      if (rpc.Api.isSimulationError(simulationResponse)) {
        console.error('❌ Simulation error:', simulationResponse.error);
        toast.error(`Simulation failed: ${simulationResponse.error}`);
        return null;
      }

      console.log('✓ Simulation successful');

      // Prepare transaction with simulation results
      const preparedTransaction = rpc.assembleTransaction(
        transaction,
        simulationResponse
      ).build();

      console.log('✓ Prepared transaction with auth');

      // Get transaction XDR
      const txXdr = preparedTransaction.toXDR();
      console.log('📝 Transaction XDR ready');

      // Sign transaction with wallet
      console.log('🔐 Requesting signature from wallet...');
      const signedXdr = await signTransaction(txXdr);
      console.log('✓ Transaction signed');

      // Parse signed transaction
      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        NETWORK_PASSPHRASE
      );

      // Submit transaction
      console.log('📤 Submitting transaction to network...');
      const sendResponse = await server.sendTransaction(signedTransaction as any);

      if (sendResponse.status === 'PENDING' || sendResponse.status === 'TRY_AGAIN_LATER') {
        console.log('⏳ Waiting for transaction confirmation...');

        // Poll for transaction result
        let getResponse = await server.getTransaction(sendResponse.hash);
        let attempts = 0;
        const maxAttempts = 10;

        while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts) {
          console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          getResponse = await server.getTransaction(sendResponse.hash);
          attempts++;
        }

        if (getResponse.status === 'SUCCESS') {
          console.log('✅ Transaction successful!');
          console.log('Transaction hash:', sendResponse.hash);

          // Parse result to get token ID
          const result = getResponse.returnValue;
          console.log('Return value:', result);

          const tokenId = result ? scValToNative(result) : null;

          // Add asset to store with proper structure
          if (metadata) {
            addAsset({
              tokenId: tokenId?.toString() || sendResponse.hash.slice(0, 8),
              metadata: {
                ipfsHash,
                name: metadata.name,
                description: metadata.description,
                imageUrl: metadata.imageUrl,
                yieldEstimate: metadata.yieldEstimate,
                region: metadata.region,
              },
              owner: address,
              isActive: true,
            });
          }

          const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${sendResponse.hash}`;

          toast.success(
            <div className="flex flex-col space-y-2">
              <span className="font-semibold">✨ RWA Token Minted Successfully!</span>
              <span className="text-sm">Token ID: {tokenId?.toString()}</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
              >
                <span>View on Explorer</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>,
            { duration: 8000 }
          );

          return {
            success: true,
            tokenId,
            txHash: sendResponse.hash
          };
        } else {
          console.error('❌ Transaction failed:', getResponse);
          toast.error('Transaction failed');
          return null;
        }
      } else if (sendResponse.status === 'ERROR') {
        console.error('❌ Send error:', sendResponse);
        toast.error('Failed to submit transaction');
        return null;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error minting RWA:', error);
      const errorMessage = error?.message || 'Failed to mint RWA token';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ID, signTransaction, walletAddress, address, addAsset, setIsLoading]);

  // Transfer token
  const transferToken = useCallback(async (
    tokenId: string,
    toAddress: string
  ) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    try {
      // TODO: Implement transfer with Stellar SDK
      console.log('Transferring token:', { tokenId, toAddress, CONTRACT_ID });
      toast('Transfer not yet implemented', { icon: 'ℹ️' });
      return null;
    } catch (error) {
      console.error('Error transferring token:', error);
      toast.error('Failed to transfer token');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ID, walletAddress, setIsLoading]);

  // Trade with escrow
  const tradeWithEscrow = useCallback(async (
    tokenId: string,
    buyerAddress: string,
    escrowAmount: number
  ) => {
    if (!walletAddress || !address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    if (!CONTRACT_ID) {
      toast.error('Contract ID not configured');
      return null;
    }

    setIsLoading(true);
    try {
      console.log('🔨 Starting trade transaction...');
      console.log('Token ID:', tokenId);
      console.log('Buyer:', buyerAddress);
      console.log('Escrow Amount:', escrowAmount);

      const server = new rpc.Server(RPC_URL);

      // Load buyer's account
      let sourceAccount;
      try {
        sourceAccount = await server.getAccount(buyerAddress);
        console.log('✓ Loaded buyer account');
      } catch (error: any) {
        if (error?.message?.includes('Account not found')) {
          toast.error('Buyer account not found on Testnet');
          return null;
        }
        throw error;
      }

      // Convert parameters to ScVals
      const tokenIdScVal = nativeToScVal(parseInt(tokenId), { type: 'u64' });
      const buyerScVal = Address.fromString(buyerAddress).toScVal();
      const escrowScVal = nativeToScVal(escrowAmount, { type: 'u128' });

      console.log('✓ Converted parameters to ScVals');

      // Build contract invocation
      const contract = new Contract(CONTRACT_ID);
      const operation = contract.call(
        'trade_with_escrow',
        tokenIdScVal,
        buyerScVal,
        escrowScVal
      );

      console.log('✓ Built contract operation');

      // Build transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      console.log('✓ Built transaction');

      // Simulate
      console.log('📡 Simulating transaction...');
      const simulationResponse = await server.simulateTransaction(transaction);

      if (rpc.Api.isSimulationError(simulationResponse)) {
        console.error('❌ Simulation error:', simulationResponse.error);
        toast.error(`Simulation failed: ${simulationResponse.error}`);
        return null;
      }

      console.log('✓ Simulation successful');

      // Prepare transaction
      const preparedTransaction = rpc.assembleTransaction(
        transaction,
        simulationResponse
      ).build();

      // Get XDR
      const txXdr = preparedTransaction.toXDR();

      // Sign
      console.log('🔐 Requesting signature from wallet...');
      const signedXdr = await signTransaction(txXdr);
      console.log('✓ Transaction signed');

      // Parse signed transaction
      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        NETWORK_PASSPHRASE
      );

      // Submit
      console.log('📤 Submitting transaction to network...');
      const sendResponse = await server.sendTransaction(signedTransaction as any);

      if (sendResponse.status === 'PENDING' || sendResponse.status === 'TRY_AGAIN_LATER') {
        console.log('⏳ Waiting for transaction confirmation...');

        let getResponse = await server.getTransaction(sendResponse.hash);
        let attempts = 0;
        const maxAttempts = 10;

        while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts) {
          console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          getResponse = await server.getTransaction(sendResponse.hash);
          attempts++;
        }

        if (getResponse.status === 'SUCCESS') {
          console.log('✅ Transaction successful!');
          console.log('Transaction hash:', sendResponse.hash);

          const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${sendResponse.hash}`;

          toast.success(
            <div className="flex flex-col space-y-2">
              <span className="font-semibold">Trade completed successfully!</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
              >
                <span>View on Explorer</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>,
            { duration: 8000 }
          );

          return {
            success: true,
            txHash: sendResponse.hash
          };
        } else {
          console.error('❌ Transaction failed:', getResponse);
          toast.error('Trade transaction failed');
          return null;
        }
      } else if (sendResponse.status === 'ERROR') {
        console.error('❌ Send error:', sendResponse);
        toast.error('Failed to submit trade transaction');
        return null;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error trading token:', error);
      const errorMessage = error?.message || 'Failed to complete trade';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ID, signTransaction, walletAddress, address, setIsLoading]);

  // Get token count from contract
  const getTokenCount = useCallback(async (): Promise<number> => {
    if (!CONTRACT_ID) return 0;

    try {
      console.log('📊 Getting token count from contract:', CONTRACT_ID);
      const server = new rpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ID);

      // Build get_token_count operation
      const operation = contract.call('get_token_count');

      // Create transaction
      const sourceAccount = await server.getAccount(walletAddress || address || '');
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      // Simulate to get result
      const simulateResponse = await server.simulateTransaction(transaction);

      if (simulateResponse.result) {
        const count = scValToNative(simulateResponse.result.retval);
        console.log('✅ Token count:', count);
        return count;
      }

      return 0;
    } catch (error) {
      console.error('Error getting token count:', error);
      return 0;
    }
  }, [CONTRACT_ID, walletAddress, address]);

  // Get single token data from contract
  const getToken = useCallback(async (tokenId: number) => {
    if (!CONTRACT_ID) return null;

    try {
      console.log(`📖 Getting token ${tokenId} from contract`);
      const server = new rpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ID);

      // Build get_token operation
      const operation = contract.call('get_token', nativeToScVal(tokenId, { type: 'u64' }));

      // Create transaction
      const sourceAccount = await server.getAccount(walletAddress || address || '');
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      // Simulate to get result
      const simulateResponse = await server.simulateTransaction(transaction);

      if (simulateResponse.result) {
        const tokenData = scValToNative(simulateResponse.result.retval);
        console.log(`✅ Token ${tokenId} data:`, tokenData);
        return tokenData;
      }

      return null;
    } catch (error) {
      console.error(`Error getting token ${tokenId}:`, error);
      return null;
    }
  }, [CONTRACT_ID, walletAddress, address]);

  // Load all tokens from contract and their metadata from IPFS
  const loadAllTokens = useCallback(async () => {
    if (!CONTRACT_ID || !walletAddress) {
      console.log('⚠️ Cannot load tokens: missing contract ID or wallet');
      return;
    }

    try {
      console.log('🔄 Loading all tokens from contract...');
      setIsLoading(true);

      // Get total token count
      const count = await getTokenCount();
      console.log(`Found ${count} total tokens`);

      if (count === 0) {
        setAssets([]);
        return;
      }

      // Fetch all tokens
      const tokens = [];
      for (let i = 0; i < count; i++) {
        const tokenData = await getToken(i);
        if (tokenData) {
          tokens.push({
            tokenId: i,
            ...tokenData,
          });
        }
      }

      console.log(`✅ Loaded ${tokens.length} tokens from contract`);

      // Import IPFS helpers
      const { getIPFSGatewayUrl, extractCID } = await import('../utils/ipfsHelpers');

      // Fetch metadata from IPFS for each token using HTTP gateway
      const assetsWithMetadata = await Promise.all(
        tokens.map(async (token) => {
          try {
            // Try to fetch metadata from public IPFS gateway
            const metadataUrl = getIPFSGatewayUrl(token.ipfs_hash);
            console.log(`Fetching metadata from: ${metadataUrl}`);

            const response = await fetch(metadataUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              // Add timeout
              signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const metadata = await response.json();
            console.log(`✅ Loaded metadata for token ${token.tokenId}:`, metadata);

            // Extract image CID from metadata (handles ipfs:// protocol)
            const imageCID = extractCID(metadata.image || metadata.imageCID || '');
            const imageUrl = imageCID ? getIPFSGatewayUrl(imageCID) : '';

            // Convert yield_data from BigInt to number (stroops to XLM)
            const yieldValue = typeof token.yield_data === 'bigint'
              ? Number(token.yield_data) / 10000000
              : (token.yield_data || 0) / 10000000;

            return {
              tokenId: token.tokenId.toString(),
              metadata: {
                ipfsHash: token.ipfs_hash,
                name: metadata.name || 'Unknown Asset',
                description: metadata.description || '',
                imageUrl,
                yieldEstimate: yieldValue,
                region: metadata.region || 'Unknown',
              },
              owner: token.owner,
              isActive: token.is_active,
            };
          } catch (error) {
            console.error(`⚠️ Failed to load metadata for token ${token.tokenId}:`, error);

            // Convert yield_data from BigInt to number (stroops to XLM)
            const yieldValue = typeof token.yield_data === 'bigint'
              ? Number(token.yield_data) / 10000000
              : (token.yield_data || 0) / 10000000;

            // Return token with minimal data if IPFS fetch fails
            return {
              tokenId: token.tokenId.toString(),
              metadata: {
                ipfsHash: token.ipfs_hash,
                name: `Token #${token.tokenId}`,
                description: 'Metadata unavailable - Check IPFS',
                imageUrl: '',
                yieldEstimate: yieldValue,
                region: 'Unknown',
              },
              owner: token.owner,
              isActive: token.is_active,
            };
          }
        })
      );

      console.log(`✅ Loaded ${assetsWithMetadata.length} assets with metadata`);
      setAssets(assetsWithMetadata);

      toast.success(`Loaded ${assetsWithMetadata.length} assets from blockchain`);
    } catch (error) {
      console.error('❌ Error loading all tokens:', error);
      toast.error('Failed to load assets from blockchain');
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ID, walletAddress, getTokenCount, getToken, setAssets, setIsLoading]);

  return {
    mintRwa,
    transferToken,
    tradeWithEscrow,
    getTokenCount,
    getToken,
    loadAllTokens,
  };
};
