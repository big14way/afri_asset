import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useStore from '../useStore';
import type { RWAAsset } from '../useStore';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setWalletAddress(null);
      result.current.setIsConnected(false);
      result.current.setAssets([]);
      result.current.setIsDarkMode(false);
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useStore());

    expect(result.current.walletAddress).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.assets).toEqual([]);
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets wallet address and connection status', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.setWalletAddress('GTEST123');
      result.current.setIsConnected(true);
    });

    expect(result.current.walletAddress).toBe('GTEST123');
    expect(result.current.isConnected).toBe(true);
  });

  it('adds asset to the store', () => {
    const { result } = renderHook(() => useStore());

    const mockAsset: RWAAsset = {
      tokenId: 'token-1',
      metadata: {
        ipfsHash: 'QmTest1',
        name: 'Test Asset',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.jpg',
        yieldEstimate: 100,
        region: 'Test Region',
      },
      owner: 'GTEST123',
      isActive: true,
    };

    act(() => {
      result.current.addAsset(mockAsset);
    });

    expect(result.current.assets).toHaveLength(1);
    expect(result.current.assets[0]).toEqual(mockAsset);
  });

  it('updates existing asset', () => {
    const { result } = renderHook(() => useStore());

    const mockAsset: RWAAsset = {
      tokenId: 'token-1',
      metadata: {
        ipfsHash: 'QmTest1',
        name: 'Original Name',
        description: 'Original Description',
        imageUrl: 'https://test.com/image.jpg',
        yieldEstimate: 100,
        region: 'Test Region',
      },
      owner: 'GTEST123',
      isActive: true,
    };

    act(() => {
      result.current.addAsset(mockAsset);
    });

    const updatedAsset = { ...mockAsset, owner: 'GNEWOWNER' };

    act(() => {
      result.current.updateAsset('token-1', { owner: 'GNEWOWNER' });
    });

    expect(result.current.assets[0].owner).toBe('GNEWOWNER');
  });

  it('removes asset from store', () => {
    const { result } = renderHook(() => useStore());

    const mockAsset: RWAAsset = {
      tokenId: 'token-1',
      metadata: {
        ipfsHash: 'QmTest1',
        name: 'Test Asset',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.jpg',
        yieldEstimate: 100,
        region: 'Test Region',
      },
      owner: 'GTEST123',
      isActive: true,
    };

    act(() => {
      result.current.addAsset(mockAsset);
    });

    expect(result.current.assets).toHaveLength(1);

    act(() => {
      result.current.removeAsset('token-1');
    });

    expect(result.current.assets).toHaveLength(0);
  });

  it('toggles dark mode', () => {
    const { result } = renderHook(() => useStore());

    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(false);
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
