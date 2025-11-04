import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_CONTRACT_ID = 'CDUMMYCONTRACTIDFORTESTING1234567890';
process.env.VITE_PINATA_JWT = 'test-pinata-jwt';
process.env.VITE_PINATA_GATEWAY = 'https://gateway.pinata.cloud';
process.env.VITE_USE_HELIA = 'false';
process.env.VITE_WALLETCONNECT_PROJECT_ID = 'test-project-id';
