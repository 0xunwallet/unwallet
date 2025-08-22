"use client";

import React, { useEffect } from "react";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { PrivyProvider as PrivyProviderComponent } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import type { Chain } from "viem";
import { getViemTransports, getViemChains } from "@/lib/constants";
import { useNetworks } from "@/hooks/useNetworks";



export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: networks } = useNetworks();

  // Enhanced warning suppression
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterMessage = (...args: any[]) => {
      const message = args.join(" ");
      return (
        message.includes("isActive") ||
        message.includes("React does not recognize") ||
        message.includes("DOM element") ||
        message.includes("custom attribute")
      );
    };

    console.error = (...args) => {
      if (filterMessage(...args)) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (filterMessage(...args)) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!networks?.data || networks.data.length === 0) {
    return null;
  }

  const viemTransports = getViemTransports(networks.data);
  const viemChains = getViemChains(networks.data);

  const wagmiConfig = createConfig({
    chains: viemChains as [Chain, ...Chain[]],
    transports: viemTransports,
  });

  const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
    },
    loginMethods: ["google"],
    supportedChains: viemChains,
    defaultChain: viemChains[0], // Use the first network (Morph Holesky) as default
    appearance: {
      showWalletLoginFirst: true,
    },
  };

  return (
    <PrivyProviderComponent
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={privyConfig}
    >
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        {children}
      </WagmiProvider>
    </PrivyProviderComponent>
  );
}
