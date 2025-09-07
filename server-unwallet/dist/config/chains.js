"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVE_CURRENCIES = exports.RPC_URLS = exports.CHAIN_NAMES = exports.SUPPORTED_CHAINS = exports.DEFAULT_CHAIN_ID = exports.DEFAULT_CHAIN = exports.ARBITRUM_SEPOLIA = exports.BASE_SEPOLIA = exports.SEI_TESTNET = exports.DEFAULT_RPC_URL = exports.CHAIN_IDS = void 0;
const viem_1 = require("viem");
// Chain ID constants - Sei Testnet
exports.CHAIN_IDS = {
    SEI_TESTNET: 1328,
    BASE_SEPOLIA: 84532,
    ARBITRUM_SEPOLIA: 421614,
};
exports.DEFAULT_RPC_URL = "https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e";
// Define Sei Testnet chain
exports.SEI_TESTNET = (0, viem_1.defineChain)({
    id: exports.CHAIN_IDS.SEI_TESTNET,
    name: 'Sei Testnet',
    network: 'sei-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'SEI',
        symbol: 'SEI',
    },
    rpcUrls: {
        default: {
            http: [exports.DEFAULT_RPC_URL],
        },
        public: {
            http: [exports.DEFAULT_RPC_URL],
        },
    },
    blockExplorers: {
        default: {
            name: 'Sei Trace',
            url: exports.DEFAULT_RPC_URL
        },
    },
    testnet: true,
});
// Define Base Sepolia chain
exports.BASE_SEPOLIA = (0, viem_1.defineChain)({
    id: exports.CHAIN_IDS.BASE_SEPOLIA,
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
// Define Arbitrum Sepolia chain
exports.ARBITRUM_SEPOLIA = (0, viem_1.defineChain)({
    id: exports.CHAIN_IDS.ARBITRUM_SEPOLIA,
    name: 'Arbitrum Sepolia',
    network: 'arbitrum-sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://sepolia-rollup.arbitrum.io/rpc'],
        },
        public: {
            http: ['https://sepolia-rollup.arbitrum.io/rpc'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Arbiscan',
            url: 'https://sepolia.arbiscan.io',
        },
    },
    testnet: true,
});
// Default chain configuration
exports.DEFAULT_CHAIN = exports.SEI_TESTNET;
exports.DEFAULT_CHAIN_ID = exports.DEFAULT_CHAIN.id;
// Supported chains array - Sei Testnet + Base Sepolia + Arbitrum Sepolia
exports.SUPPORTED_CHAINS = [exports.CHAIN_IDS.SEI_TESTNET, exports.CHAIN_IDS.BASE_SEPOLIA, exports.CHAIN_IDS.ARBITRUM_SEPOLIA];
// Chain name mapping - Sei Testnet
exports.CHAIN_NAMES = {
    [exports.CHAIN_IDS.SEI_TESTNET]: 'Sei Testnet',
    [exports.CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
    [exports.CHAIN_IDS.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia',
};
// RPC URL mapping - Sei Testnet
exports.RPC_URLS = {
    [exports.CHAIN_IDS.SEI_TESTNET]: exports.DEFAULT_RPC_URL,
    [exports.CHAIN_IDS.BASE_SEPOLIA]: 'https://sepolia.base.org',
    [exports.CHAIN_IDS.ARBITRUM_SEPOLIA]: 'https://sepolia-rollup.arbitrum.io/rpc',
};
// Native currency mapping - Sei Testnet
exports.NATIVE_CURRENCIES = {
    [exports.CHAIN_IDS.SEI_TESTNET]: { name: 'SEI', symbol: 'SEI', decimals: 18 },
    [exports.CHAIN_IDS.BASE_SEPOLIA]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    [exports.CHAIN_IDS.ARBITRUM_SEPOLIA]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
};
//# sourceMappingURL=chains.js.map