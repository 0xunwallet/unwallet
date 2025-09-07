import { Chain, http } from 'viem';
import { Network } from '@/types/network';

export const NETWORK_CONFIG = {
  DEFAULT_NETWORK_NAME: 'Arbitrum Sepolia',
} as const;

export const CHAIN_IDS = {
  // SEI_TESTNET: 1328,
  // BASE_SEPOLIA: 84532,
  ARB_SEPOLIA: 421614,
} as const;

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const STEALTH_ADDRESS_GENERATION_MESSAGE =
  'STEALTH_ADDRESS_GENERATION_ZZZZZ_ARB_SEPOLIA';
// 'STEALTH_ADDRESS_GENERATION_ZZZZZ_BASE_SEPOLIA';
// 'STEALTH_ADDRESS_GENERATION_ZZZZZ_SEI_TESTNET';

// Centralized RPC configuration
export const RPC_CONFIG = {
  ARB_SEPOLIA: {
    primary: 'https://arbitrum-sepolia.drpc.org',
    fallbacks: [
      'https://arbitrum-sepolia.therpc.io',
      'https://arbitrum-sepolia-rpc.publicnode.com',
    ],
  },
  // SEI_TESTNET: {
  //   primary:
  //     'https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e/',
  //   fallbacks: [
  //     'https://sei-testnet.drpc.org',
  //     'https://rpc.sei-testnet.seinetwork.io',
  //     'https://testnet-rpc.sei.io',
  //   ],
  // },
  // BASE_SEPOLIA: {
  //   primary: 'https://sepolia.base.org',
  //   fallbacks: [
  //     'https://base-sepolia.api.onfinality.io/public',
  //     'https://base-sepolia-public.nodies.app',
  //   ],
  // },
} as const;

export const WHITELISTED_NETWORKS = [
  {
    name: 'Arbitrum Sepolia',
    chainId: CHAIN_IDS.ARB_SEPOLIA,
    network: 'arbitrum-sepolia',
    explorerUrl: 'https://sepolia.arbiscan.io',
    logo: '/chains/base-logo.png',
    rpcUrl: RPC_CONFIG.ARB_SEPOLIA.primary,
    // Fallback RPC URLs in case the primary one fails
    fallbackRpcUrls: RPC_CONFIG.ARB_SEPOLIA.fallbacks,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Arbitrum Sepolia Explorer',
      url: 'https://sepolia.arbiscan.io/',
    },
    tokens: [
      {
        enabled: true,
        symbol: 'USDC',
        name: 'USDC',
        address: '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
        iconUri: '/tokens/usdc.png',
      },
    ],
    testnet: true,
  },
  // {
  //   name: 'Sei Testnet',
  //   chainId: CHAIN_IDS.SEI_TESTNET,
  //   network: 'sei-testnet',
  //   explorerUrl: 'https://seitrace.com',
  //   logo: '/chains/sei-logo.svg',
  //   rpcUrl: RPC_CONFIG.SEI_TESTNET.primary,
  //   // Fallback RPC URLs in case the primary one fails
  //   fallbackRpcUrls: RPC_CONFIG.SEI_TESTNET.fallbacks,
  //   nativeCurrency: {
  //     name: 'SEI',
  //     symbol: 'SEI',
  //     decimals: 18,
  //   },
  //   blockExplorer: {
  //     name: 'Sei Explorer',
  //     url: 'https://seitrace.com/',
  //   },
  //   tokens: [
  //     {
  //       enabled: true,
  //       symbol: 'USDC',
  //       name: 'USDC',
  //       address: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
  //       iconUri: '/tokens/usdc.png',
  //     },
  //     {
  //       enabled: false,
  //       symbol: 'USDT',
  //       name: 'USDT',
  //       address: '0x4fCF1784B31630811181f672Aea7A7bEF803eaED',
  //       iconUri: '/tokens/usdt.png',
  //     },
  //   ],
  //   testnet: true,
  // },
  // {
  //   name: 'Base Sepolia',
  //   chainId: CHAIN_IDS.BASE_SEPOLIA,
  //   network: 'base-sepolia',
  //   explorerUrl: 'https://sepolia.basescan.org',
  //   logo: '/chains/base-logo.png',
  //   rpcUrl: RPC_CONFIG.BASE_SEPOLIA.primary,
  //   // Fallback RPC URLs in case the primary one fails
  //   fallbackRpcUrls: RPC_CONFIG.BASE_SEPOLIA.fallbacks,
  //   nativeCurrency: {
  //     name: 'Ether',
  //     symbol: 'ETH',
  //     decimals: 18,
  //   },
  //   blockExplorer: {
  //     name: 'Base Sepolia Explorer',
  //     url: 'https://sepolia.basescan.org/',
  //   },
  //   tokens: [
  //     {
  //       enabled: true,
  //       symbol: 'USDC',
  //       name: 'USDC',
  //       address: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
  //       iconUri: '/tokens/usdc.png',
  //     },
  //   ],
  //   testnet: true,
  // },
];

// Transform function to convert WHITELISTED_NETWORKS to Privy Chain format
export const getPrivyChains = (networks: Network[]) => {
  return networks.map(network => ({
    name: network.name,
    id: network.chainId,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: {
      default: {
        http: [network.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: network.blockExplorer.name,
        url: network.blockExplorer.url,
      },
    },
  }));
};

// Transform function to convert WHITELISTED_NETWORKS to Viem Chain format
export const getViemChains = (networks: Network[]): Chain[] => {
  return networks.map(network => ({
    id: network.chainId,
    name: network.name,
    network: network.network,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: {
      default: {
        http: [network.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'Block Explorer',
        url: network.blockExplorer.url,
      },
    },
    testnet: network.testnet,
  }));
};

// Create dynamic RPC transports for all whitelisted networks with retry logic
export const getViemTransports = (networks: Network[]) => {
  const transports: Record<number, ReturnType<typeof http>> = {};

  networks.forEach(network => {
    // Use centralized RPC configuration with retry configuration
    const rpcUrl =
      network.chainId === CHAIN_IDS.ARB_SEPOLIA
        ? RPC_CONFIG.ARB_SEPOLIA.primary
        : network.rpcUrl;

    transports[network.chainId] = http(rpcUrl, {
      retryCount: 3,
      retryDelay: 2500,
      timeout: 10000,
    });
  });

  return transports;
};

export const SITE = {
  name: 'Unwallet',
  description: 'One wallet for payments on any chain.',
  logo: '/logo.svg',
};

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' },
        ],
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
];

// Utility function to get the current network from a list of networks
export const getCurrentNetwork = (
  networks: Network[] | undefined
): Network | undefined => {
  if (!networks) return undefined;
  return networks.find(
    network => network.name === NETWORK_CONFIG.DEFAULT_NETWORK_NAME
  );
};

// Utility function to get network by name
export const getNetworkByName = (networkName: string): Network | undefined => {
  return WHITELISTED_NETWORKS.find(network => network.name === networkName);
};

// Utility function to get network by chain ID
export const getNetworkByChainId = (chainId: number): Network | undefined => {
  return WHITELISTED_NETWORKS.find(network => network.chainId === chainId);
};

// Utility function to get transaction explorer URL
export const getTransactionExplorerUrl = (
  txHash: string,
  networkName?: string,
  chainId?: number
): string => {
  let network: Network | undefined;

  if (chainId) {
    network = getNetworkByChainId(chainId);
  } else if (networkName) {
    network = getNetworkByName(networkName);
  }

  if (!network) {
    // Fallback to default network
    network = getCurrentNetwork(WHITELISTED_NETWORKS);
  }

  // Ensure we have a network, fallback to default network if still undefined
  const fallbackNetwork = network || WHITELISTED_NETWORKS[0];
  return `${fallbackNetwork.explorerUrl}/tx/${txHash}`;
};

// Utility function to get address explorer URL
export const getAddressExplorerUrl = (
  address: string,
  networkName?: string,
  chainId?: number
): string => {
  let network: Network | undefined;

  if (chainId) {
    network = getNetworkByChainId(chainId);
  } else if (networkName) {
    network = getNetworkByName(networkName);
  }

  if (!network) {
    // Fallback to default network
    network = getCurrentNetwork(WHITELISTED_NETWORKS);
  }

  // Ensure we have a network, fallback to default network if still undefined
  const fallbackNetwork = network || WHITELISTED_NETWORKS[0];
  return `${fallbackNetwork.explorerUrl}/address/${address}`;
};

export const SAFE_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' },
      { name: 'safeTxGas', type: 'uint256' },
      { name: 'baseGas', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'refundReceiver', type: 'address' },
      { name: 'signatures', type: 'bytes' },
    ],
    name: 'execTransaction',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
