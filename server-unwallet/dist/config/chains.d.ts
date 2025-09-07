export declare const CHAIN_IDS: {
    readonly SEI_TESTNET: 1328;
    readonly BASE_SEPOLIA: 84532;
    readonly ARBITRUM_SEPOLIA: 421614;
};
export declare const DEFAULT_RPC_URL = "https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e";
export declare const SEI_TESTNET: {
    blockExplorers: {
        readonly default: {
            readonly name: "Sei Trace";
            readonly url: "https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 1328;
    name: "Sei Testnet";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "SEI";
        readonly symbol: "SEI";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e"];
        };
        readonly public: {
            readonly http: readonly ["https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    readonly network: "sei-testnet";
};
export declare const BASE_SEPOLIA: {
    blockExplorers: {
        readonly default: {
            readonly name: "Basescan";
            readonly url: "https://sepolia.basescan.org";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 84532;
    name: "Base Sepolia";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Ether";
        readonly symbol: "ETH";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://sepolia.base.org"];
        };
        readonly public: {
            readonly http: readonly ["https://sepolia.base.org"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    readonly network: "base-sepolia";
};
export declare const ARBITRUM_SEPOLIA: {
    blockExplorers: {
        readonly default: {
            readonly name: "Arbiscan";
            readonly url: "https://sepolia.arbiscan.io";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 421614;
    name: "Arbitrum Sepolia";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Ether";
        readonly symbol: "ETH";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://sepolia-rollup.arbitrum.io/rpc"];
        };
        readonly public: {
            readonly http: readonly ["https://sepolia-rollup.arbitrum.io/rpc"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    readonly network: "arbitrum-sepolia";
};
export declare const DEFAULT_CHAIN: {
    blockExplorers: {
        readonly default: {
            readonly name: "Sei Trace";
            readonly url: "https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 1328;
    name: "Sei Testnet";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "SEI";
        readonly symbol: "SEI";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e"];
        };
        readonly public: {
            readonly http: readonly ["https://quiet-crimson-ensemble.sei-atlantic.quiknode.pro/69718db72dcf9d1828053e82dbeeeb283319782e"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    readonly network: "sei-testnet";
};
export declare const DEFAULT_CHAIN_ID: 1328;
export declare const SUPPORTED_CHAINS: (1328 | 84532 | 421614)[];
export declare const CHAIN_NAMES: Record<number, string>;
export declare const RPC_URLS: Record<number, string>;
export declare const NATIVE_CURRENCIES: Record<number, {
    name: string;
    symbol: string;
    decimals: number;
}>;
//# sourceMappingURL=chains.d.ts.map