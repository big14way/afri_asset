/**
 * NFT.Storage IPFS Upload Helper
 * Free, reliable IPFS pinning service for Web3
 * Get your free API key at: https://nft.storage
 */

const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY || '';
const NFT_STORAGE_ENDPOINT = 'https://api.nft.storage/upload';

/**
 * Upload file to IPFS via NFT.Storage
 * @param file - File to upload
 * @returns IPFS CID
 */
export async function uploadToNFTStorage(file: File): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT.Storage API key not configured. Get one at https://nft.storage');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(NFT_STORAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NFT.Storage upload failed: ${error}`);
  }

  const data = await response.json();
  return data.value.cid;
}

/**
 * Upload JSON metadata to IPFS via NFT.Storage
 * @param metadata - Metadata object
 * @returns IPFS CID
 */
export async function uploadMetadataToNFTStorage(metadata: object): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT.Storage API key not configured. Get one at https://nft.storage');
  }

  const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([jsonBlob], 'metadata.json', { type: 'application/json' });

  return uploadToNFTStorage(file);
}

/**
 * Get public gateway URL for NFT.Storage content
 * @param cid - IPFS CID
 * @returns Gateway URL
 */
export function getNFTStorageGatewayUrl(cid: string): string {
  return `https://nftstorage.link/ipfs/${cid}`;
}
