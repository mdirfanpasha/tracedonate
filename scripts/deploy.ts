import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("==================================================");
  console.log("🚀 Deploying TraceDonate to Monad Testnet...");
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} MON`);

  const TraceDonateFactory = await ethers.getContractFactory("TraceDonate");
  const traceDonate = await TraceDonateFactory.deploy();
  await traceDonate.waitForDeployment();

  const contractAddress = await traceDonate.getAddress();
  console.log(`\n🎉 TraceDonate deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Monad Explorer: https://testnet.monadvision.com/address/${contractAddress}`);

  // Create initial demo campaigns for judges to interact with
  console.log("\n📦 Initializing hackathon demo campaigns on-chain...");

  try {
    const tx1 = await traceDonate.createCampaign(
      "Flood Relief 2026",
      "Emergency food rations, clean water, and medical aid for 10,000 displaced families in monsoon disaster zones.",
      ethers.parseEther("100"),
      "Disaster Relief",
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"
    );
    await tx1.wait();
    console.log(" ✓ Demo Campaign 1 created: Flood Relief 2026 (100 MON goal)");

    const tx2 = await traceDonate.createCampaign(
      "Solar Water Wells for Rural Communities",
      "Deploying high-capacity solar-powered water filtration pumps providing permanent clean water access to 4 villages.",
      ethers.parseEther("50"),
      "Clean Water",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
    );
    await tx2.wait();
    console.log(" ✓ Demo Campaign 2 created: Solar Water Wells (50 MON goal)");

    const tx3 = await traceDonate.createCampaign(
      "Emergency Pediatric Medical Supplies",
      "Supplying essential antibiotics, surgical kits, and diagnostic tools to community emergency clinics.",
      ethers.parseEther("75"),
      "Healthcare",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
    );
    await tx3.wait();
    console.log(" ✓ Demo Campaign 3 created: Emergency Medical Supplies (75 MON goal)");
  } catch (err: any) {
    console.log(`Note: Demo campaigns initialization skipped or failed: ${err.message}`);
  }

  // Export contract address and ABI to frontend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/src/TraceDonate.sol/TraceDonate.json");
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const contractsConfigDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(contractsConfigDir)) {
    fs.mkdirSync(contractsConfigDir, { recursive: true });
  }

  const contractsConfigContent = `// Auto-generated deployment configuration
export const TRACEDONATE_CONTRACT_ADDRESS = "${contractAddress}" as \`0x\${string}\`;

export const MONAD_TESTNET_CHAIN_ID = 10143;

export const MONAD_EXPLORER_URL = "https://testnet.monadvision.com";
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";

export const TRACEDONATE_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;

  fs.writeFileSync(path.join(contractsConfigDir, "contracts.ts"), contractsConfigContent);
  console.log(`\n💾 Saved contract config to src/config/contracts.ts`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
