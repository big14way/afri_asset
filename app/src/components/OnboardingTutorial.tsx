import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  action?: string;
  icon: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to AfriAssets!',
    description: 'The first platform for tokenizing real-world African assets on the Stellar blockchain. Own fractions of real estate, agriculture, and renewable energy projects.',
    icon: '🌍',
  },
  {
    id: 2,
    title: 'Connect Your Wallet',
    description: 'Connect your Stellar wallet (Freighter, xBull, Albedo, or Rabet) to start minting and trading assets. We support multiple wallets for your convenience.',
    action: 'Connect Wallet',
    icon: '🔐',
  },
  {
    id: 3,
    title: 'Mint Real-World Assets',
    description: 'Upload images, add details about your asset (real estate, farmland, solar panels, etc.), and create tokenized ownership. Each token represents fractional ownership.',
    action: 'Go to Mint',
    icon: '🏗️',
  },
  {
    id: 4,
    title: 'Trade on Marketplace',
    description: 'Browse tokenized assets, filter by region or yield, and trade with other investors. All transactions are secured by Stellar smart contracts with escrow protection.',
    action: 'Explore Marketplace',
    icon: '🛒',
  },
  {
    id: 5,
    title: 'Track Your Portfolio',
    description: 'Monitor your investments, track yields, and manage your tokenized assets. View transaction history and asset performance over time.',
    action: 'View Portfolio',
    icon: '📊',
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { connect, isConnected } = useWallet();

  const step = TUTORIAL_STEPS[currentStep];

  // Auto-advance from step 2 when wallet is connected
  useEffect(() => {
    if (isConnected && currentStep === 1) {
      setTimeout(() => {
        setCurrentStep(2);
      }, 1000);
    }
  }, [isConnected, currentStep]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleAction = async () => {
    switch (currentStep) {
      case 1: // Connect Wallet
        await connect();
        break;
      case 2: // Mint
        window.location.href = '/mint';
        handleComplete();
        break;
      case 3: // Marketplace
        window.location.href = '/marketplace';
        handleComplete();
        break;
      case 4: // Portfolio
        window.location.href = '/portfolio';
        handleComplete();
        break;
      default:
        handleNext();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">{step.icon}</div>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <div className="flex items-center gap-2">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 transition-all ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Key Features (show on first step) */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Secure & Transparent</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All transactions on-chain</p>
              </div>
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Fractional Ownership</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Invest from $10</p>
              </div>
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Instant Trading</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">24/7 liquidity</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Previous
              </button>
            )}

            {step.action ? (
              <button
                onClick={handleAction}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                {step.action}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
              </button>
            )}
          </div>

          {/* Step Counter */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
};
