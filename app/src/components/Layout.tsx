import { Link, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useWallet } from '../contexts/WalletContext';
import { useEffect } from 'react';

export const Layout = () => {
  const { isDarkMode, toggleTheme } = useStore();
  const { isConnected, address, connect, disconnect, walletType } = useWallet();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Nav Links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-2"
                aria-label="Home"
              >
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  AfriAsset
                </span>
              </Link>

              <div className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  Home
                </Link>
                <Link
                  to="/mint"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/mint')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive('/mint') ? 'page' : undefined}
                >
                  Mint
                </Link>
                <Link
                  to="/marketplace"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive('/marketplace') ? 'page' : undefined}
                >
                  Marketplace
                </Link>
              </div>
            </div>

            {/* Theme Toggle and Wallet Button */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* Wallet Button */}
              {isConnected && address ? (
                <div className="flex items-center space-x-2">
                  {walletType && (
                    <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {walletType === 'freighter' ? 'Freighter' : 'WalletConnect'}
                    </span>
                  )}
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                    aria-label="Disconnect wallet"
                  >
                    {formatAddress(address)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connect('freighter')}
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
                  aria-label="Connect wallet"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 AfriAsset Token Hub. Built on Stellar Soroban.
          </p>
        </div>
      </footer>
    </div>
  );
};
