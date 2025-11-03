import { useState } from 'react';
import type { RWAAsset } from '../store/useStore';

interface AssetCardProps {
  asset: RWAAsset;
  onTrade?: (asset: RWAAsset) => void;
}

export const AssetCard = ({ asset, onTrade }: AssetCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = () => {
    setImageError(true);
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
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <img
            src={asset.metadata.imageUrl}
            alt={asset.metadata.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={handleImageError}
            loading="lazy"
          />
        )}

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
          {asset.metadata.name}
        </h3>

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

        {/* Trade Button */}
        {onTrade && asset.isActive && (
          <button
            onClick={() => onTrade(asset)}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={`Trade ${asset.metadata.name}`}
          >
            Trade
          </button>
        )}
      </div>
    </div>
  );
};
