import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./monadChain";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "TraceDonate",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});
