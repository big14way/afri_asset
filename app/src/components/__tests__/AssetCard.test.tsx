import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetCard from '../AssetCard';
import type { RWAAsset } from '../../store/useStore';

describe('AssetCard', () => {
  const mockAsset: RWAAsset = {
    tokenId: 'token-123',
    metadata: {
      ipfsHash: 'QmTest123',
      name: 'Cocoa Farm in Lagos',
      description: 'Sustainable cocoa plantation',
      imageUrl: 'https://example.com/cocoa.jpg',
      yieldEstimate: 500,
      region: 'Lagos, Nigeria',
    },
    owner: 'GTEST...OWNER',
    isActive: true,
  };

  it('renders asset information correctly', () => {
    render(<AssetCard asset={mockAsset} />);

    expect(screen.getByText('Cocoa Farm in Lagos')).toBeInTheDocument();
    expect(screen.getByText('Sustainable cocoa plantation')).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Nigeria/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('displays asset image', () => {
    render(<AssetCard asset={mockAsset} />);

    const image = screen.getByAlt('Cocoa Farm in Lagos');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/cocoa.jpg');
  });

  it('calls onTrade when trade button is clicked', () => {
    const onTradeMock = vi.fn();
    render(<AssetCard asset={mockAsset} onTrade={onTradeMock} />);

    const tradeButton = screen.getByRole('button', { name: /trade/i });
    fireEvent.click(tradeButton);

    expect(onTradeMock).toHaveBeenCalledWith(mockAsset);
  });

  it('does not show trade button when onTrade is not provided', () => {
    render(<AssetCard asset={mockAsset} />);

    const tradeButton = screen.queryByRole('button', { name: /trade/i });
    expect(tradeButton).not.toBeInTheDocument();
  });

  it('displays inactive badge for inactive assets', () => {
    const inactiveAsset = { ...mockAsset, isActive: false };
    render(<AssetCard asset={inactiveAsset} />);

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });
});
