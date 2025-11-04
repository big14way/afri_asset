import { useCallback, useState } from 'react';
import { PinataSDK } from 'pinata-web3';
import { uploadToIPFS, uploadMetadataToIPFS } from '../utils/ipfsHelpers';
import toast from 'react-hot-toast';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const USE_HELIA = import.meta.env.VITE_USE_HELIA === 'true';

export interface AssetAttributes {
  region: string;
  yield: number;
  assetType: string;
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  certification?: string;
  harvestDate?: string;
  expiryDate?: string;
  [key: string]: any;
}

export interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  yieldEstimate: number;
  region: string;
  assetType: string;
  createdAt: string;
  attributes: AssetAttributes;
}

export const useIPFS = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY,
  });

  // Upload file to IPFS (supports both Pinata and Helia)
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(10);

      let ipfsHash: string;

      if (USE_HELIA) {
        // Use Helia for decentralized upload
        toast.loading('Uploading to IPFS via Helia...', { id: 'ipfs-upload' });
        setUploadProgress(30);
        ipfsHash = await uploadToIPFS(file);
        setUploadProgress(100);
        toast.success('Uploaded via Helia!', { id: 'ipfs-upload' });
      } else {
        // Use Pinata for faster upload
        toast.loading('Uploading to IPFS via Pinata...', { id: 'ipfs-upload' });
        setUploadProgress(30);
        const upload = await pinata.upload.file(file);
        ipfsHash = upload.IpfsHash;
        setUploadProgress(100);
        toast.success('Uploaded via Pinata!', { id: 'ipfs-upload' });
      }

      return ipfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      toast.error('Failed to upload file to IPFS', { id: 'ipfs-upload' });
      return null;
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [pinata]);

  // Upload metadata JSON to IPFS
  const uploadMetadata = useCallback(async (
    metadata: AssetMetadata
  ): Promise<string | null> => {
    try {
      toast.loading('Uploading metadata...', { id: 'metadata-upload' });

      let ipfsHash: string;

      if (USE_HELIA) {
        // Use Helia
        ipfsHash = await uploadMetadataToIPFS(metadata);
      } else {
        // Use Pinata
        const upload = await pinata.upload.json(metadata);
        ipfsHash = upload.IpfsHash;
      }

      toast.success('Metadata uploaded!', { id: 'metadata-upload' });
      return ipfsHash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      toast.error('Failed to upload metadata to IPFS', { id: 'metadata-upload' });
      return null;
    }
  }, [pinata]);

  // Create enhanced metadata with attributes
  const createMetadata = useCallback((
    name: string,
    description: string,
    imageHash: string,
    yieldEstimate: number,
    region: string,
    assetType: string,
    additionalAttributes?: Partial<AssetAttributes>
  ): AssetMetadata => {
    return {
      name,
      description,
      image: `ipfs://${imageHash}`,
      yieldEstimate,
      region,
      assetType,
      createdAt: new Date().toISOString(),
      attributes: {
        region,
        yield: yieldEstimate,
        assetType,
        ...additionalAttributes,
      },
    };
  }, []);

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
    createMetadata,
    fetchMetadata,
    getIpfsUrl,
    uploadProgress,
  };
};
