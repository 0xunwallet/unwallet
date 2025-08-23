export declare const CHAIN_IDS: {
    readonly SEI_TESTNET: 1328;
};
export declare const SEI_TESTNET: {
    blockExplorers: {
        readonly default: {
            readonly name: "Sei Trace";
            readonly url: "https://seitrace.com/?chain=atlantic-2";
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
            readonly http: readonly ["https://evm-rpc-testnet.sei-apis.com"];
        };
        readonly public: {
            readonly http: readonly ["https://evm-rpc-testnet.sei-apis.com"];
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
export declare const DEFAULT_CHAIN: {
    blockExplorers: {
        readonly default: {
            readonly name: "Sei Trace";
            readonly url: "https://seitrace.com/?chain=atlantic-2";
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
            readonly http: readonly ["https://evm-rpc-testnet.sei-apis.com"];
        };
        readonly public: {
            readonly http: readonly ["https://evm-rpc-testnet.sei-apis.com"];
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
export declare const DEFAULT_RPC_URL: "https://evm-rpc-testnet.sei-apis.com";
export declare const SUPPORTED_CHAINS: 1328[];
export declare const CHAIN_NAMES: Record<number, string>;
export declare const RPC_URLS: Record<number, string>;
export declare const NATIVE_CURRENCIES: Record<number, {
    name: string;
    symbol: string;
    decimals: number;
}>;
//# sourceMappingURL=chains.d.ts.map