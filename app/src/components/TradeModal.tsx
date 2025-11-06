import { useState, type FormEvent, useEffect } from 'react';
import type { RWAAsset } from '../store/useStore';
import { useRWAContract } from '../hooks/useRWAContract';
import { useStore } from '../store/useStore';
import { IPFSImage } from './IPFSImage';
import toast from 'react-hot-toast';

interface TradeModalProps {
  asset: RWAAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeModal = ({ asset, isOpen, onClose }: TradeModalProps) => {
  const { tradeWithEscrow } = useRWAContract();
  const { isConnected } = useStore();

  const [buyerAddress, setBuyerAddress] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);

  // Calculate minimum escrow from asset's yield estimate (in stroops)
  const minEscrowXLM = asset ? (asset.metadata.yieldEstimate / 10000000) : 0;

  useEffect(() => {
    // Set default escrow to minimum required + 10% buffer
    if (asset && !escrowAmount) {
      const defaultEscrow = minEscrowXLM * 1.1;
      setEscrowAmount(defaultEscrow.toFixed(2));
    }
  }, [asset, minEscrowXLM, escrowAmount]);

  useEffect(() => {
    if (escrowAmount) {
      // Calculate estimated fee (0.5%)
      const amount = Number(escrowAmount);
      setEstimatedFee(amount * 0.005);
    } else {
      setEstimatedFee(0);
    }
  }, [escrowAmount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!asset) {
      toast.error('No asset selected');
      return;
    }

    // Validate escrow amount
    const escrowXLM = Number(escrowAmount);
    if (escrowXLM < minEscrowXLM) {
      toast.error(`Escrow amount must be at least ${minEscrowXLM.toFixed(2)} XLM (asset's yield estimate)`);
      return;
    }

    setIsTrading(true);

    try {
      // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
      const escrowStroops = Math.floor(escrowXLM * 10000000);

      console.log('Trading with:', {
        tokenId: asset.tokenId,
        buyer: buyerAddress,
        escrowStroops,
        escrowXLM,
        minRequired: minEscrowXLM
      });

      await tradeWithEscrow(asset.tokenId, buyerAddress, escrowStroops);

      // Reset form and close modal
      setBuyerAddress('');
      setEscrowAmount('');
      onClose();
    } catch (error) {
      console.error('Error trading asset:', error);
    } finally {
      setIsTrading(false);
    }
  };

  const handleClose = () => {
    if (!isTrading) {
      setBuyerAddress('');
      setEscrowAmount('');
      onClose();
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="trade-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-gray-100"
          >
            Trade Asset
          </h2>
          <button
            onClick={handleClose}
            disabled={isTrading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Asset Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <IPFSImage
              cid={asset.metadata.imageUrl}
              alt={asset.metadata.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {asset.metadata.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {asset.metadata.region}
              </p>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">
                Yield: {asset.metadata.yieldEstimate.toLocaleString()} XLM
              </p>
            </div>
          </div>
        </div>

        {/* Trade Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Buyer Address */}
          <div className="mb-4">
            <label
              htmlFor="buyerAddress"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Buyer Address *
            </label>
            <input
              type="text"
              id="buyerAddress"
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              required
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-required="true"
            />
          </div>

          {/* Escrow Amount */}
          <div className="mb-4">
            <label
              htmlFor="escrowAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Escrow Amount (XLM) *
            </label>
            <input
              type="number"
              id="escrowAmount"
              value={escrowAmount}
              onChange={(e) => setEscrowAmount(e.target.value)}
              required
              min={minEscrowXLM}
              step="0.01"
              placeholder={`Minimum: ${minEscrowXLM.toFixed(2)} XLM`}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-required="true"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum required: <span className="font-semibold text-primary-600 dark:text-primary-400">{minEscrowXLM.toFixed(2)} XLM</span> (based on asset's yield estimate)
            </p>
            {escrowAmount && Number(escrowAmount) < minEscrowXLM && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>Escrow amount must be at least {minEscrowXLM.toFixed(2)} XLM</span>
              </p>
            )}
          </div>

          {/* Fee Preview */}
          {estimatedFee > 0 && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Escrow Amount:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Number(escrowAmount).toLocaleString()} XLM
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Estimated Fee (0.5%):</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {estimatedFee.toFixed(2)} XLM
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {(Number(escrowAmount) + estimatedFee).toFixed(2)} XLM
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isTrading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTrading || !isConnected}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Confirm trade"
            >
              {isTrading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Confirm Trade'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
