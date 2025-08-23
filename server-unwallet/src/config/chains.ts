import { defineChain } from "viem";

// Chain ID constants - Sei Testnet
export const CHAIN_IDS = {
  SEI_TESTNET: 1328,
} as const;

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
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
    public: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Sei Trace', 
      url: 'https://seitrace.com/?chain=atlantic-2' 
    },
  },
  testnet: true,
});

// Default chain configuration
export const DEFAULT_CHAIN = SEI_TESTNET;
export const DEFAULT_CHAIN_ID = DEFAULT_CHAIN.id;
export const DEFAULT_RPC_URL = DEFAULT_CHAIN.rpcUrls.default.http[0];

// Supported chains array - Sei Testnet
export const SUPPORTED_CHAINS = [CHAIN_IDS.SEI_TESTNET];

// Chain name mapping - Sei Testnet
export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: 'Sei Testnet',
};

// RPC URL mapping - Sei Testnet
export const RPC_URLS: Record<number, string> = {
  [CHAIN_IDS.SEI_TESTNET]: 'https://evm-rpc-testnet.sei-apis.com',
};

// Native currency mapping - Sei Testnet
export const NATIVE_CURRENCIES: Record<number, { name: string; symbol: string; decimals: number }> = {
  [CHAIN_IDS.SEI_TESTNET]: { name: 'SEI', symbol: 'SEI', decimals: 18 },
};
