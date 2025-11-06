import { useState, useEffect } from 'react';
import { getAllGatewayUrls, extractCID } from '../utils/ipfsHelpers';

interface IPFSImageProps {
  cid: string; // Can be a CID or full IPFS URL
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Image component that tries multiple IPFS gateways with fallback
 * Automatically retries with different gateways if one fails
 */
export const IPFSImage = ({ cid, alt, className = '', fallbackSrc }: IPFSImageProps) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract CID from URL if needed
  const actualCID = extractCID(cid);
  const gatewayUrls = getAllGatewayUrls(actualCID);

  useEffect(() => {
    if (!actualCID || actualCID.trim() === '') {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    // Reset state when CID changes
    setGatewayIndex(0);
    setHasError(false);
    setIsLoading(true);
    if (gatewayUrls.length > 0) {
      setCurrentUrl(gatewayUrls[0]);
    }
  }, [cid, actualCID, gatewayUrls]);

  useEffect(() => {
    if (gatewayIndex < gatewayUrls.length) {
      setCurrentUrl(gatewayUrls[gatewayIndex]);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [gatewayIndex, gatewayUrls]);

  // If CID is empty, show error immediately
  if (!actualCID || actualCID.trim() === '') {
    return (
      <div className={`flex items-center justify-center bg-gray-700 ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400">No image</p>
        </div>
      </div>
    );
  }

  const handleError = () => {
    console.log(`⚠️ Failed to load image from gateway ${gatewayIndex + 1}/${gatewayUrls.length}`);

    // Try next gateway
    if (gatewayIndex < gatewayUrls.length - 1) {
      console.log(`🔄 Trying next gateway...`);
      setGatewayIndex(prev => prev + 1);
    } else {
      console.error('❌ All IPFS gateways failed for CID:', cid);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    console.log(`✅ Image loaded from gateway ${gatewayIndex + 1}:`, currentUrl);
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
        />
      );
    }

    return (
      <div className={`flex items-center justify-center bg-gray-700 ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400">Image unavailable</p>
          <p className="text-xs text-gray-500 mt-1 font-mono break-all">{actualCID.slice(0, 12)}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-gray-700 ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading from IPFS...</p>
          </div>
        </div>
      )}
      <img
        src={currentUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};
