# TraceDonate

> **Every donation. Every payment. Every proof.**  
> *Transparent Web3 charitable giving with escrow-locked fund flow and direct supplier settlement on Monad.*

---

## 🌟 Live Application & Contract Links

- **Live Public Website:** [https://tracedonate.vercel.app](https://tracedonate.vercel.app)
- **Monad Contract Address:** [`0x892a23381A17f223a4d9693B980C6563f82c1014`](https://testnet.monadvision.com/address/0x892a23381A17f223a4d9693B980C6563f82c1014)
- **Monad Network:** Monad Testnet (Chain ID: `10143`)
- **RPC Endpoint:** `https://testnet-rpc.monad.xyz`
- **Block Explorers:** [MonadVision](https://testnet.monadvision.com) / [MonadScan](https://testnet.monadscan.com)
- **Official Monad Faucet:** [https://faucet.monad.xyz](https://faucet.monad.xyz)
- **GitHub Repository:** [https://github.com/mdirfanpasha/tracedonate](https://github.com/mdirfanpasha/tracedonate)

---

## 🚨 The Problem

When donors give money to traditional charities, their contribution disappears into an opaque organizational bank account. Donors are forced to trust generic annual reports published months later with zero mathematical verification. Fraud, excessive administrative overhead, and embezzlement continually undermine global humanitarian aid.

---

## 💡 The Solution

**TraceDonate** removes the need for blind trust by locking 100% of donations in a **Monad smart contract escrow (`TraceDonate.sol`)**.

1. **Funds Held in Escrow:** Organizations cannot withdraw lump sums into private accounts.
2. **Itemized Expense Requests:** Organizations submit spending requests specifying the vendor's wallet address, category, and attached mandatory receipt proof.
3. **Verifier Audit:** Authorized verifiers review invoice legitimacy and authorize payment.
4. **Direct Settlement:** The smart contract transfers native `MON` tokens **directly to the supplier/vendor wallet**.
5. **Follow Your Money:** Donors inspect a live interactive financial pipeline linking their donation to verified vendor payouts with real Monad explorer transaction hashes.

---

## 📜 Smart Contract Architecture (`TraceDonate.sol`)

The core financial logic is implemented in [`contracts/src/TraceDonate.sol`](contracts/src/TraceDonate.sol). The contract acts as a trustless financial custodian ensuring funds can only leave the contract when sent directly to verified suppliers.

### 📐 Data Structures

```solidity
enum ExpenseStatus { Pending, Approved, Rejected, Executed }

struct Campaign {
    uint256 id;
    address payable organization;
    string title;
    string description;
    uint256 goal;            // in wei
    uint256 totalRaised;     // in wei
    uint256 currentBalance;  // in wei (available in escrow)
    uint256 totalSpent;      // in wei
    string category;
    string imageUri;
    bool active;
    uint256 createdAt;
}

struct Expense {
    uint256 id;
    uint256 campaignId;
    uint256 amount;          // in wei
    address payable recipientSupplier;
    string category;
    string description;
    string evidenceHash;     // IPFS hash / receipt reference
    ExpenseStatus status;
    uint256 createdAt;
    uint256 executedAt;
}

struct Donation {
    uint256 campaignId;
    address donor;
    uint256 amount;
    uint256 timestamp;
}
```

---

### ⚙️ Core Smart Contract Functions

#### 1. Campaign Creation
```solidity
function createCampaign(
    string memory title,
    string memory description,
    uint256 goal,
    string memory category,
    string memory imageUri
) external returns (uint256)
```
- **Access:** Public. Anyone can deploy a transparent campaign.
- **Rules:** `goal` must be $> 0$.
- **Emits:** `event CampaignCreated(uint256 indexed campaignId, address indexed organization, string title, uint256 goal, string category, uint256 timestamp)`

#### 2. Escrow Donation
```solidity
function donate(uint256 campaignId) external payable nonReentrant
```
- **Access:** Public.
- **Rules:** `msg.value > 0`, campaign must exist and be active.
- **Escrow Invariant:** `msg.value` is locked in contract balance; `campaign.totalRaised` and `campaign.currentBalance` are credited.
- **Emits:** `event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 currentBalance, uint256 timestamp)`

#### 3. Expense Creation
```solidity
function createExpense(
    uint256 campaignId,
    uint256 amount,
    address payable recipientSupplier,
    string memory category,
    string memory description,
    string memory evidenceHash
) external returns (uint256)
```
- **Access:** Only the campaign organizer (`onlyCampaignOrg`).
- **Rules:** `amount <= campaign.currentBalance`, `recipientSupplier != address(0)`.
- **Emits:** `event ExpenseCreated(uint256 indexed campaignId, uint256 indexed expenseId, address indexed recipientSupplier, uint256 amount, string category, string evidenceHash, uint256 timestamp)`

#### 4. Verifier Audit & Direct Payout Execution
```solidity
function approveAndExecuteExpense(uint256 expenseId) external onlyVerifierOrOwner nonReentrant
```
- **Access:** Only authorized verifiers or contract owner.
- **Execution Invariant:** Smart contract transfers exact `amount` directly to `recipientSupplier.transfer(amount)`.
- **Accounting:** `campaign.currentBalance -= amount`, `campaign.totalSpent += amount`, `expense.status = Executed`.
- **Double Execution Protection:** Reverts if `expense.status != Pending`.
- **Emits:** `event ExpenseApproved(...)` & `event ExpenseExecuted(...)`

#### 5. View & Retrieval Functions
- `getCampaign(uint256 campaignId)` $\to$ Returns full campaign struct.
- `getAllCampaigns()` $\to$ Returns array of all campaigns on-chain.
- `getCampaignExpenses(uint256 campaignId)` $\to$ Returns all itemized expenses for a campaign.
- `getDonorDonations(address donor)` $\to$ Returns donation history for a donor address.
- `getGlobalStats()` $\to$ Returns total campaigns, total donated, and total spent across all campaigns.

---

## 💻 Interacting with the Smart Contract

### A. Via Foundry / Cast CLI

```bash
# 1. Read all campaigns on Monad Testnet
cast call 0x892a23381A17f223a4d9693B980C6563f82c1014 "getAllCampaigns()" --rpc-url https://testnet-rpc.monad.xyz

# 2. Inspect escrow balance of the contract
cast balance 0x892a23381A17f223a4d9693B980C6563f82c1014 --rpc-url https://testnet-rpc.monad.xyz

# 3. Donate 0.05 MON to Campaign #1
cast send 0x892a23381A17f223a4d9693B980C6563f82c1014 "donate(uint256)" 1 --value 0.05ether --rpc-url https://testnet-rpc.monad.xyz --private-key $YOUR_PRIVATE_KEY
```

### B. Via Viem / Wagmi TypeScript

```typescript
import { parseEther } from "viem";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";

// Donate 0.1 MON
await walletClient.writeContract({
  address: TRACEDONATE_CONTRACT_ADDRESS,
  abi: TRACEDONATE_ABI,
  functionName: "donate",
  args: [1n],
  value: parseEther("0.1"),
});
```

---

## ⚡ Why Monad?

Itemized micro-expense tracking requires recording every food bundle, medical kit, or fuel voucher on-chain. On traditional blockchains, gas fees would dwarf the actual donation amounts.

- **10,000 TPS Parallel Execution:** Handles high-volume disaster relief payment throughput in real time.
- **Sub-Second Finality:** Immediate payment settlement for emergency suppliers on the ground.
- **Negligible Gas Fees (< $0.001):** 100% of donation value reaches suppliers without gas slippage.
- **Full EVM Compatibility:** Mainstream Web3 wallet support across MetaMask, Rabby, and Phantom.

---

## 🏗️ Architecture & Money Flow

```
┌─────────────────┐
│   Donor Wallet  │ ──── (Donates Testnet MON) ───┐
└─────────────────┘                               │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │    TraceDonate.sol      │
                                     │  (Monad Escrow Locked)  │
                                     └─────────────────────────┘
                                                  │
                                                  ▼ (Requires Verifier Audit)
                                     ┌─────────────────────────┐
                                     │    Verified Releases    │
                                     └─────────────────────────┘
                                       │          │          │
                     ┌─────────────────┘          │          └─────────────────┐
                     ▼                            ▼                            ▼
            ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
            │   Food Vendor   │          │  Medical Clinic │          │ Logistical Corp │
            │   0x892a...1014 │          │   0x28a1...05f2 │          │   0x15d3...6a65 │
            └─────────────────┘          └─────────────────┘          └─────────────────┘
                     │                            │                            │
                     └────────────────────────────┼────────────────────────────┘
                                                  ▼
                                     ┌─────────────────────────┐
                                     │   Monad Block Explorer  │
                                     │ (Immutable Audit Trail) │
                                     └─────────────────────────┘
```

---

## 🚀 60-Second Hackathon Judge Walkthrough

1. **Connect Wallet:** Click **Connect Wallet** in the top navigation and connect your MetaMask, Rabby, or Phantom wallet on **Monad Testnet**.
2. **Get Testnet MON:** If your balance is 0, click **Get Testnet MON** to open the [Official Monad Faucet](https://faucet.monad.xyz).
3. **Open Demo Campaign:** Navigate to **Campaigns** $\to$ select **Flood Relief 2026**.
4. **Make a Live Donation:** Click **DONATE MON NOW** $\to$ select `0.05 MON` $\to$ confirm in your wallet.
5. **View Real Blockchain Confirmation:** Watch the confirmation tracker update live from `1. Confirm in wallet...` to `2. Processing on Monad...` to `✓ Donation confirmed`.
6. **Generate Impact Receipt:** Click **View Impact Receipt** to inspect your cryptographically verifiable impact certificate with real tx proof.
7. **Follow The Money Flow:** Scroll down to the **Signature Money Flow** interactive pipeline to see how funds flow to audited vendor wallets with mandatory receipt proofs.
8. **Inspect Monad Explorer:** Click **View on Monad Explorer** on any settled expense to verify the real on-chain transaction.

---

## 💻 Tech Stack

- **Smart Contracts:** Solidity `^0.8.24`, Foundry & Hardhat, Ethers.js
- **Frontend Framework:** Next.js 14 (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Clean Bright Fintech Social-Impact Design System
- **Web3 Integrations:** Viem, Wagmi v2, RainbowKit, TanStack Query
- **Interactive Visualizations:** HTML5 Canvas WebGL Financial Flow Stream
- **Evidence Storage:** Local Storage + Supabase Off-chain Receipt Storage

---

## 🛠️ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/mdirfanpasha/tracedonate.git
cd tracedonate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Smart Contract Tests
```bash
npx hardhat test
```
*Outputs 12 automated unit tests passing across deployment, escrow donations, expense approvals, and direct payouts.*

### 4. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file from the provided `.env.example`:

```env
# Monad Testnet Configuration
NEXT_PUBLIC_MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x892a23381A17f223a4d9693B980C6563f82c1014"
NEXT_PUBLIC_CHAIN_ID=10143

# Reown / WalletConnect ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="3a8170812b534d0ff9d794f19a901d64"

# Optional Deployer Private Key for Hardhat
PRIVATE_KEY=""
```

---

## 🦊 Monad Testnet Wallet Configuration

Add Monad Testnet manually to MetaMask / Rabby:

| Property | Value |
| :--- | :--- |
| **Network Name** | Monad Testnet |
| **RPC URL** | `https://testnet-rpc.monad.xyz` |
| **Chain ID** | `10143` |
| **Currency Symbol** | `MON` |
| **Block Explorer** | `https://testnet.monadvision.com` |

---

## 📜 Smart Contract Deployment

To deploy to Monad Testnet using Hardhat:

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

Or using Foundry:

```bash
forge script contracts/script/DeployTraceDonate.s.sol:DeployTraceDonateScript --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

---

## 🏆 Hackathon Quality Checklist

- [x] **Real Monad Blockchain:** Native Testnet (Chain ID 10143) with verified contract calls.
- [x] **Smart Contract Escrow:** 100% of funds held in contract custody.
- [x] **Direct Supplier Settlements:** Payments sent directly to vendor addresses with mandatory receipt proofs.
- [x] **"Follow My Money" UI:** Interactive visual pipeline from donor to supplier.
- [x] **Digital Impact Receipts:** Cryptographically proven certificates with explorer links.
- [x] **Automated Tests:** 12/12 passing test cases in Hardhat and Foundry.
- [x] **Premium Fintech Design:** Bright, warm, human, social-impact aesthetic.
- [x] **Deploy Ready:** Next.js build passes cleanly for production deployment.

---

**TraceDonate** — *Every donation. Every payment. Every proof. Powered by Monad.*
