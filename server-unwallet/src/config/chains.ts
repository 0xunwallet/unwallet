import { defineChain } from "viem";

// Chain ID constants - Sei Testnet
export const CHAIN_IDS = {
  SEI_TESTNET: 1328,
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

// Default chain configuration
export const DEFAULT_CHAIN = SEI_TESTNET;
export const DEFAULT_CHAIN_ID = DEFAULT_CHAIN.id;
// Supported chains array - Sei Testnet
export const SUPPORTED_CHAINS = [CHAIN_IDS.SEI_TESTNET];

// Chain name mapping - Sei Testnet
export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: 'Sei Testnet',
};

// RPC URL mapping - Sei Testnet
export const RPC_URLS: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: DEFAULT_RPC_URL,
};

// Native currency mapping - Sei Testnet
export const NATIVE_CURRENCIES: Record<number, { name: string; symbol: string; decimals: number }> = {
  [CHAIN_IDS.SEI_TESTNET]: { name: 'SEI', symbol: 'SEI', decimals: 18 },
};
