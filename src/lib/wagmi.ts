import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export function createWagmiConfig(projectId: string) {
  return getDefaultConfig({
    appName: "Wen-Ox",
    appDescription: "Find the best yield route across DeFi",
    projectId,
    chains: [arbitrumSepolia, arbitrum],
    ssr: true,
  });
}
