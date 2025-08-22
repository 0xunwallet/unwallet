"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVE_CURRENCIES = exports.RPC_URLS = exports.CHAIN_NAMES = exports.SUPPORTED_CHAINS = exports.DEFAULT_RPC_URL = exports.DEFAULT_CHAIN_ID = exports.DEFAULT_CHAIN = exports.SEI_TESTNET = exports.CHAIN_IDS = void 0;
const viem_1 = require("viem");
// Chain ID constants - Sei Testnet
exports.CHAIN_IDS = {
    SEI_TESTNET: 1328,
};
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
            http: ['https://sei-testnet.drpc.org'],
        },
        public: {
            http: ['https://sei-testnet.drpc.org'],
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
exports.DEFAULT_CHAIN = exports.SEI_TESTNET;
exports.DEFAULT_CHAIN_ID = exports.DEFAULT_CHAIN.id;
exports.DEFAULT_RPC_URL = exports.DEFAULT_CHAIN.rpcUrls.default.http[0];
// Supported chains array - Sei Testnet
exports.SUPPORTED_CHAINS = [exports.CHAIN_IDS.SEI_TESTNET];
// Chain name mapping - Sei Testnet
exports.CHAIN_NAMES = {
    [exports.CHAIN_IDS.SEI_TESTNET]: 'Sei Testnet',
};
// RPC URL mapping - Sei Testnet
exports.RPC_URLS = {
    [exports.CHAIN_IDS.SEI_TESTNET]: 'https://sei-testnet.drpc.org',
};
// Native currency mapping - Sei Testnet
exports.NATIVE_CURRENCIES = {
    [exports.CHAIN_IDS.SEI_TESTNET]: { name: 'SEI', symbol: 'SEI', decimals: 18 },
};
//# sourceMappingURL=chains.js.map