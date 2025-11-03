import { create } from 'zustand';

export interface RWAAsset {
  tokenId: string;
  metadata: {
    ipfsHash: string;
    name: string;
    description: string;
    imageUrl: string;
    yieldEstimate: number;
    region: string;
  };
  owner: string;
  isActive: boolean;
}

interface AppState {
  // Wallet state
  walletAddress: string | null;
  isConnected: boolean;

  // Assets state
  assets: RWAAsset[];

  // Theme state
  isDarkMode: boolean;

  // Loading states
  isLoading: boolean;

  // Actions
  setWalletAddress: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setAssets: (assets: RWAAsset[]) => void;
  addAsset: (asset: RWAAsset) => void;
  updateAsset: (tokenId: string, updates: Partial<RWAAsset>) => void;
  toggleTheme: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  walletAddress: null,
  isConnected: false,
  assets: [],
  isDarkMode: typeof window !== 'undefined'
    ? localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : false,
  isLoading: false,

  // Actions
  setWalletAddress: (address) => set({ walletAddress: address }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset]
  })),

  updateAsset: (tokenId, updates) => set((state) => ({
    assets: state.assets.map((asset) =>
      asset.tokenId === tokenId ? { ...asset, ...updates } : asset
    ),
  })),

  toggleTheme: () => set((state) => {
    const newTheme = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { isDarkMode: newTheme };
  }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
