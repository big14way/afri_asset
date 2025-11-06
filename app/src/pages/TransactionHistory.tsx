import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSoroban } from '../hooks/useSoroban';

interface Transaction {
  hash: string;
  type: 'mint' | 'trade' | 'transfer';
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  tokenId?: string;
  from?: string;
  to?: string;
  amount?: string;
}

export const TransactionHistory = () => {
  const { walletAddress, isConnected } = useStore();
  const { CONTRACT_ID } = useSoroban();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadTransactionHistory();
    }
  }, [isConnected, walletAddress]);

  const loadTransactionHistory = async () => {
    setIsLoading(true);
    try {
      // For now, show transactions from localStorage or contract events
      // In a real app, you'd query Stellar Horizon or contract events
      const storedTxs = localStorage.getItem(`txHistory_${walletAddress}`);
      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs));
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash: string) => {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trade':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-24 h-24 text-gray-400 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Transaction History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all your blockchain transactions and activity
        </p>
      </div>

      {/* Contract Info */}
      {CONTRACT_ID && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contract ID</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
                {CONTRACT_ID}
              </p>
            </div>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View on Explorer →
            </a>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div
              key={tx.hash || index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        tx.type
                      )}`}
                    >
                      {tx.type.toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status === 'success' && '✓ Success'}
                      {tx.status === 'pending' && '⏳ Pending'}
                      {tx.status === 'failed' && '✗ Failed'}
                    </span>
                  </div>

                  {tx.tokenId && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Token ID: <span className="font-mono">#{tx.tokenId}</span>
                    </p>
                  )}

                  {(tx.from || tx.to) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {tx.from && (
                        <p>
                          From: <span className="font-mono text-xs">{tx.from.slice(0, 12)}...</span>
                        </p>
                      )}
                      {tx.to && (
                        <p>
                          To: <span className="font-mono text-xs">{tx.to.slice(0, 12)}...</span>
                        </p>
                      )}
                    </div>
                  )}

                  {tx.amount && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      Amount: <span className="font-semibold">{tx.amount} XLM</span>
                    </p>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="ml-4">
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-md transition-colors"
                  >
                    <span>View</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Transactions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your transaction history will appear here once you start minting and trading assets
          </p>
          <a
            href="/mint"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
          >
            Mint Your First Asset
          </a>
        </div>
      )}
    </div>
  );
};
