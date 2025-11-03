import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useIPFS } from './useIPFS';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';
// const RPC_URL = 'https://rpc-futurenet.stellar.org:443'; // For future event subscription implementation

interface RwaMintedEvent {
  tokenId: string;
  metadata: string;
  owner: string;
  yieldData: number;
}

export const useSorobanEvents = () => {
  const { addAsset, assets } = useStore();
  const { fetchMetadata, getIpfsUrl } = useIPFS();

  const handleRwaMintedEvent = useCallback(async (event: RwaMintedEvent) => {
    try {
      // Fetch metadata from IPFS
      const metadata = await fetchMetadata(event.metadata);

      if (metadata) {
        // Check if asset already exists
        const exists = assets.some(asset => asset.tokenId === event.tokenId);
        if (!exists) {
          // Add new asset to store
          addAsset({
            tokenId: event.tokenId,
            metadata: {
              ipfsHash: event.metadata,
              name: metadata.name,
              description: metadata.description,
              imageUrl: getIpfsUrl(metadata.image.replace('ipfs://', '')),
              yieldEstimate: metadata.yieldEstimate,
              region: metadata.region,
            },
            owner: event.owner,
            isActive: true,
          });
        }
      }
    } catch (error) {
      console.error('Error handling RwaMinted event:', error);
    }
  }, [addAsset, assets, fetchMetadata, getIpfsUrl]);

  // Subscribe to contract events
  useEffect(() => {
    if (!CONTRACT_ID) {
      console.warn('Contract ID not set. Event listening disabled.');
      return;
    }

    // This is a placeholder for the actual event subscription
    // In a production implementation, you would use Stellar SDK to subscribe to events
    // Example pattern:
    // const subscription = await server.getEvents({
    //   startLedger: currentLedger,
    //   filters: [{
    //     type: 'contract',
    //     contractIds: [CONTRACT_ID],
    //     topics: [['RwaMinted']]
    //   }]
    // });

    console.log('Event listening initialized for contract:', CONTRACT_ID);

    // Cleanup function
    return () => {
      console.log('Event listening cleaned up');
    };
  }, [CONTRACT_ID, handleRwaMintedEvent]);

  return {
    handleRwaMintedEvent,
  };
};
