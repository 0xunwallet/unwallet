import { defineChain } from "viem";

// Chain ID constants - Sei Testnet
export const CHAIN_IDS = {
  SEI_TESTNET: 1328,
  BASE_SEPOLIA: 84532,
} as const;

export const DEFAULT_RPC_URL = "https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e";


// Define Sei Testnet chain
export const SEI_TESTNET = defineChain({
  id: CHAIN_IDS.SEI_TESTNET,
  name: 'Sei Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SEI',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: [DEFAULT_RPC_URL],
    },
    public: {
      http: [DEFAULT_RPC_URL],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Sei Trace', 
      url: DEFAULT_RPC_URL 
    },
  },
  testnet: true,
});

// Define Base Sepolia chain
export const BASE_SEPOLIA = defineChain({
  id: CHAIN_IDS.BASE_SEPOLIA,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
});

// Default chain configuration
export const DEFAULT_CHAIN = SEI_TESTNET;
export const DEFAULT_CHAIN_ID = DEFAULT_CHAIN.id;
// Supported chains array - Sei Testnet + Base Sepolia
export const SUPPORTED_CHAINS = [CHAIN_IDS.SEI_TESTNET, CHAIN_IDS.BASE_SEPOLIA];

// Chain name mapping - Sei Testnet
export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: 'Sei Testnet',
  [CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
};

// RPC URL mapping - Sei Testnet
export const RPC_URLS: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: DEFAULT_RPC_URL,
  [CHAIN_IDS.BASE_SEPOLIA]: 'https://sepolia.base.org',
};

// Native currency mapping - Sei Testnet
export const NATIVE_CURRENCIES: Record<number, { name: string; symbol: string; decimals: number }> = {
  [CHAIN_IDS.SEI_TESTNET]: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  [CHAIN_IDS.BASE_SEPOLIA]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
};
