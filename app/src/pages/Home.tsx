import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { OnboardingTutorial } from '../components/OnboardingTutorial';

export const Home = () => {
  const { isConnected } = useStore();
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen the tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Tokenize African Assets
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          AfriAsset Token Hub enables micro-RWA tokenization on Stellar's Soroban blockchain.
          Convert real-world assets into tradable digital tokens with low fees and mobile-first UX.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isConnected ? (
            <>
              <Link
                to="/mint"
                className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Mint Your Asset
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors font-medium text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Browse Marketplace
              </Link>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect your wallet to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Low Fees
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Built on Stellar's efficient blockchain for minimal transaction costs, perfect for emerging markets.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Secure Trading
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Atomic swaps with escrow ensure safe and trustless asset exchanges on the blockchain.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            IPFS Storage
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Decentralized storage for asset metadata and proofs, ensuring permanence and accessibility.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connect Wallet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Stellar wallet using Freighter
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Mint Assets
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload asset details and create NFT tokens
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Browse Market
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover tokenized assets in the marketplace
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Trade Securely
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Execute trades with escrow protection
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              $0.01
            </p>
            <p className="text-gray-600 dark:text-gray-400">Average Transaction Fee</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              3-5s
            </p>
            <p className="text-gray-600 dark:text-gray-400">Transaction Confirmation</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              24/7
            </p>
            <p className="text-gray-600 dark:text-gray-400">Marketplace Availability</p>
          </div>
        </div>
      </div>

      {/* Tutorial Button - Show for returning users */}
      {!showTutorial && (
        <div className="py-8 text-center">
          <button
            onClick={handleShowTutorial}
            className="px-6 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            📚 Show Tutorial Again
          </button>
        </div>
      )}

      {/* Onboarding Tutorial */}
      {showTutorial && <OnboardingTutorial onComplete={handleTutorialComplete} />}
    </div>
  );
};
