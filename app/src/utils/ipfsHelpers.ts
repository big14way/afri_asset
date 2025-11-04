import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import type { Helia } from 'helia';
import type { UnixFS } from '@helia/unixfs';

let heliaInstance: Helia | null = null;
let fsInstance: UnixFS | null = null;

/**
 * Initialize Helia IPFS client
 * @returns UnixFS instance for file operations
 */
export async function getHeliaInstance(): Promise<UnixFS> {
  if (fsInstance) {
    return fsInstance;
  }

  try {
    heliaInstance = await createHelia();
    fsInstance = unixfs(heliaInstance);
    return fsInstance;
  } catch (error) {
    console.error('Error initializing Helia:', error);
    throw new Error('Failed to initialize IPFS client');
  }
}

/**
 * Upload a file to IPFS using Helia
 * @param file - File to upload
 * @returns CID string
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const fs = await getHeliaInstance();

    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Add file to IPFS
    const cid = await fs.addBytes(uint8Array);

    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata - Metadata object
 * @returns CID string
 */
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  try {
    const fs = await getHeliaInstance();

    // Convert JSON to Uint8Array
    const jsonString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);

    // Add metadata to IPFS
    const cid = await fs.addBytes(uint8Array);

    return cid.toString();
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Fetch data from IPFS
 * @param cid - Content identifier
 * @returns Uint8Array of the content
 */
export async function fetchFromIPFS(cid: string): Promise<Uint8Array> {
  try {
    const fs = await getHeliaInstance();

    // Import CID
    const { CID } = await import('multiformats/cid');
    const cidObj = CID.parse(cid);

    // Collect chunks
    const chunks: Uint8Array[] = [];
    for await (const chunk of fs.cat(cidObj)) {
      chunks.push(chunk);
    }

    // Concatenate chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch from IPFS');
  }
}

/**
 * Fetch JSON metadata from IPFS
 * @param cid - Content identifier
 * @returns Parsed JSON object
 */
export async function fetchMetadataFromIPFS<T = any>(cid: string): Promise<T> {
  try {
    const data = await fetchFromIPFS(cid);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(data);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}

/**
 * Cleanup Helia instance
 */
export async function cleanupHelia(): Promise<void> {
  if (heliaInstance) {
    await heliaInstance.stop();
    heliaInstance = null;
    fsInstance = null;
  }
}
