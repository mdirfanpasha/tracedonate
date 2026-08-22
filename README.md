# TraceDonate

> **Every donation. Every payment. Every proof.**  
> *Transparent Web3 charitable giving with escrow-locked fund flow and direct supplier settlement on Monad.*

---

## 🌟 Live Application & Contract Links

- **Live Public Website:** [https://trace-donate.vercel.app](https://trace-donate.vercel.app) *(Deploy-ready Next.js app)*
- **Monad Contract Address:** [`0x892a23381A17f223a4d9693B980C6563f82c1014`](https://testnet.monadvision.com/address/0x892a23381A17f223a4d9693B980C6563f82c1014)
- **Monad Network:** Monad Testnet (Chain ID: `10143`)
- **Block Explorer:** [MonadVision](https://testnet.monadvision.com) / [MonadScan](https://testnet.monadscan.com)
- **Official Monad Faucet:** [https://faucet.monad.xyz](https://faucet.monad.xyz)

---

## 🚨 The Problem

When donors give money to traditional charities, their contribution disappears into an opaque organizational account. Donors are forced to trust generic annual reports published months later with zero verification. Fraud, bureaucratic overhead, and embezzlement continually undermine global philanthropy.

---

## 💡 The Solution

**TraceDonate** removes the need for blind trust by locking 100% of donations in a **Monad smart contract escrow (`TraceDonate.sol`)**.

1. **Funds Held in Escrow:** Organizations cannot withdraw lump sums into private accounts.
2. **Itemized Expense Requests:** Organizations submit spending requests specifying the vendor's wallet address, category, and attached invoice evidence.
3. **Verifier Audit:** Auditors review invoice legitimacy and authorize payment.
4. **Direct Settlement:** The smart contract transfers native `MON` tokens **directly to the supplier/vendor wallet**.
5. **Follow Your Money:** Donors inspect a live interactive financial pipeline linking their donation to verified vendor payouts with real Monad explorer transaction hashes.

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
4. **Make a Live Donation:** Click **Donate MON** $\to$ select `0.05 MON` $\to$ confirm in your wallet.
5. **View Transaction State:** Watch the real-time confirmation tracker update live from `Pending` to `Donation Verified ✓`.
6. **Generate Impact Receipt:** Click **Generate Impact Receipt** to inspect your cryptographically verifiable impact certificate with real tx proof.
7. **Follow The Money Flow:** Scroll down to the **Signature Money Flow** interactive visualizer to see how funds flow to audited vendor wallets (`0x892a...1014`, `0x28a1...05f2`).
8. **Inspect Monad Explorer:** Click **View on Monad Explorer** on any settled expense to verify the real on-chain transaction.

---

## 💻 Tech Stack

- **Smart Contracts:** Solidity `^0.8.24`, Hardhat, Ethers.js
- **Frontend Framework:** Next.js 14 (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Custom Dark Fintech Design System
- **Web3 Integrations:** Viem, Wagmi v2, RainbowKit, TanStack Query
- **Interactive Visualizations:** HTML5 Canvas / WebGL Particle Network Visualizer
- **Storage / Off-Chain Metadata:** Supabase (with offline resilient local cache)

---

## 🛠️ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-org/trace-donate.git
cd trace-donate
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

The script deploys `TraceDonate.sol`, initializes hackathon demo campaigns with test data, and exports the contract ABI and address to the frontend.

---

## 🏆 Hackathon Quality Checklist

- [x] **Real Monad Blockchain:** Native Testnet (Chain ID 10143) with verified contract calls.
- [x] **Smart Contract Escrow:** 100% of funds held in contract custody.
- [x] **Direct Supplier Settlements:** Payments sent directly to vendor addresses with receipts.
- [x] **"Follow My Money" UI:** Interactive visual pipeline from donor to supplier.
- [x] **Digital Impact Receipts:** Cryptographically proven certificates with explorer links.
- [x] **Automated Tests:** 12/12 passing test cases in Hardhat.
- [x] **Premium Fintech Design:** Sleek dark charcoal aesthetic, zero AI-slop graphics.
- [x] **Deploy Ready:** Next.js build passes cleanly for Vercel deployment.

---

**TraceDonate** — *Give with proof. Powered by Monad.*
