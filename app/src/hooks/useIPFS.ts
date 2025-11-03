import { useCallback } from 'react';
import { PinataSDK } from 'pinata-web3';
import toast from 'react-hot-toast';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

export interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  yieldEstimate: number;
  region: string;
  assetType: string;
  createdAt: string;
}

export const useIPFS = () => {
  const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY,
  });

  // Upload file to IPFS
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      const upload = await pinata.upload.file(file);
      return upload.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      toast.error('Failed to upload file to IPFS');
      return null;
    }
  }, [pinata]);

  // Upload metadata JSON to IPFS
  const uploadMetadata = useCallback(async (
    metadata: AssetMetadata
  ): Promise<string | null> => {
    try {
      const upload = await pinata.upload.json(metadata);
      return upload.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      toast.error('Failed to upload metadata to IPFS');
      return null;
    }
  }, [pinata]);

  // Fetch metadata from IPFS
  const fetchMetadata = useCallback(async (
    ipfsHash: string
  ): Promise<AssetMetadata | null> => {
    try {
      const response = await fetch(`${PINATA_GATEWAY}/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error);
      return null;
    }
  }, []);

  // Get IPFS URL for a hash
  const getIpfsUrl = useCallback((ipfsHash: string): string => {
    return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
  }, []);

  return {
    uploadFile,
    uploadMetadata,
    fetchMetadata,
    getIpfsUrl,
  };
};
