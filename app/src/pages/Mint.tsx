import { MintForm } from '../components/MintForm';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const Mint = () => {
  const { isConnected } = useStore();

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <svg
          className="w-24 h-24 text-gray-400 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Wallet Not Connected
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please connect your Stellar wallet to mint RWA tokens.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Mint RWA Token
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Tokenize your real-world asset on the Stellar blockchain. Upload asset details,
          images, and metadata to create a tradable NFT.
        </p>
      </div>

      <MintForm />

      {/* Info Section */}
      <div className="max-w-2xl mx-auto mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ Important Information
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Asset metadata and images are stored on IPFS for decentralized access</li>
          <li>• Transaction fees are minimal (typically less than $0.01)</li>
          <li>• Once minted, your token will be visible in the marketplace</li>
          <li>• You can transfer or trade your token at any time</li>
        </ul>
      </div>
    </div>
  );
};
