import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  const rpcUrl = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  let privateKey = process.env.PRIVATE_KEY;

  if (!privateKey || privateKey.trim() === "") {
    // Generate a fresh deployer wallet and save it to .env
    const randomWallet = ethers.Wallet.createRandom();
    privateKey = randomWallet.privateKey;
    console.log("🔑 Generated fresh deployer wallet:");
    console.log(`Address: ${randomWallet.address}`);
    console.log(`Private Key: ${privateKey}`);

    const envContent = `# Monad Testnet Configuration
NEXT_PUBLIC_MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x892A23381a17f223A4D9693B980c6563F82C1014"
NEXT_PUBLIC_CHAIN_ID=10143

# Reown / WalletConnect ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="3a8170812b534d0ff9d794f19a901d64"

# Deployer Private Key
PRIVATE_KEY="${privateKey}"
DEPLOYER_ADDRESS="${randomWallet.address}"
MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
`;
    fs.writeFileSync(path.join(__dirname, "../.env"), envContent);
    fs.writeFileSync(path.join(__dirname, "../.env.local"), envContent);
    console.log("💾 Saved deployer credentials to .env and .env.local");
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`\nChecking deployer account: ${wallet.address}`);

  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`Monad Testnet Balance: ${ethers.formatEther(balance)} MON`);

    if (balance === 0n) {
      console.log("\n⚠️ Balance is 0 MON. Faucet needed:");
      console.log(`👉 Please request testnet MON for: ${wallet.address}`);
      console.log("Faucet URL: https://faucet.monad.xyz");
    } else {
      console.log("\n✅ Account has testnet MON! Ready to deploy.");
    }
  } catch (err: any) {
    console.error("RPC Error:", err.message);
  }
}

main().catch(console.error);
