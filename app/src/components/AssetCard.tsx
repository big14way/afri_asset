import { useState } from 'react';
import type { RWAAsset } from '../store/useStore';
import { VerificationBadge } from './VerificationBadge';
import { IPFSImage } from './IPFSImage';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface AssetCardProps {
  asset: RWAAsset;
  onTrade?: (asset: RWAAsset) => void;
  showVerifyButton?: boolean;
}

export const AssetCard = ({ asset, onTrade, showVerifyButton = false }: AssetCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { verifyAsset, walletAddress } = useStore();

  const handleVerify = () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    verifyAsset(asset.tokenId, 'AfriAssets Team');
    toast.success(`${asset.metadata.name} has been verified!`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Asset: ${asset.metadata.name}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <IPFSImage
          cid={asset.metadata.imageUrl}
          alt={asset.metadata.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              asset.isActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
            role="status"
            aria-label={asset.isActive ? 'Active' : 'Inactive'}
          >
            {asset.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
            {asset.metadata.name}
          </h3>
          <VerificationBadge
            status={asset.verificationStatus || 'unverified'}
            verifier={asset.verifiedBy}
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {asset.metadata.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Region</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {asset.metadata.region}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Yield Est.</p>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {asset.metadata.yieldEstimate.toLocaleString()} XLM
            </p>
          </div>
        </div>

        {/* Owner */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
          <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
            {asset.owner}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {onTrade && asset.isActive && (
            <button
              onClick={() => onTrade(asset)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={`Trade ${asset.metadata.name}`}
            >
              Trade
            </button>
          )}

          {showVerifyButton && asset.verificationStatus !== 'verified' && (
            <button
              onClick={handleVerify}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
              aria-label={`Verify ${asset.metadata.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verify Asset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
