# TRACE DONATE — COMPLETE BUILD SPECIFICATION

Build a production-quality Web3 application called **TraceDonate** for the Monad Blitz hackathon.

## 1. PRODUCT

### Name

**TraceDonate**

### Tagline

**Every donation. Every payment. Every proof.**

### Core idea

TraceDonate is a transparent donation platform built on **Monad**.

The problem:

When people donate to charities, they usually cannot easily see what happens to their money afterward. They have to trust the organization to report how funds were used.

TraceDonate solves this by making the actual donation and eligible spending flow through a **Monad smart contract**, creating a verifiable on-chain financial trail.

A donor should be able to:

1. Connect their wallet.
2. Donate MON to a campaign.
3. See that the funds are held by the smart contract.
4. See campaign spending.
5. See where money was sent.
6. Open and verify the real Monad transaction.
7. Follow the flow of their donation.

The blockchain must be a CORE part of the application.

Do NOT create a normal charity website with a blockchain logo added afterward.

---

# 2. MOST IMPORTANT REQUIREMENT

This must be a REAL Monad application.

Do NOT fake blockchain transactions.

Do NOT use mock transaction hashes.

Do NOT create fake wallet balances.

Do NOT simulate successful blockchain transactions in the UI.

The application must:

* Connect to a real wallet.
* Use the real Monad Testnet.
* Interact with a deployed Solidity smart contract.
* Send real testnet MON.
* Read real contract state.
* Display real transaction hashes.
* Link to the real Monad explorer.
* Handle pending / success / failed transactions correctly.

Use the official current Monad Testnet configuration and RPC/explorer information from Monad's documentation rather than hardcoding outdated values.

---

# 3. HACKATHON REQUIREMENTS

The application must be designed around these requirements:

### Basic requirements

* Public GitHub repository.
* Proper README.
* Live public website.
* Smart contract deployed on Monad Testnet.
* Contract address clearly displayed.
* Contract source verified on the Monad explorer.
* Project hosted publicly, preferably Vercel.

### Working requirements

* All advertised functionality must work.
* At least one real live transaction must be possible during the demo.
* Another person must be able to use the application from the README without developer assistance.

### Bonus readiness

Architect the application so that it can later be deployed to Monad Mainnet without rewriting the application.

Keep the contract and network configuration clean and environment-based.

---

# 4. TECHNOLOGY

Use a modern production-ready stack.

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Web3

Prefer:

* viem
* wagmi
* compatible wallet connection library

### Smart contracts

* Solidity
* Foundry

### Backend / database

Use Supabase only where off-chain data is necessary.

### Storage

Use Supabase Storage for evidence files if needed.

Do NOT put private user information or large files directly on-chain.

### Deployment

* Vercel for frontend
* Monad Testnet for smart contract

---

# 5. SMART CONTRACT

Create a clean Solidity contract named:

`TraceDonate.sol`

The contract is the heart of the product.

Keep the contract understandable, secure and minimal.

The contract should support the following core functionality.

## Campaign creation

An organization can create a campaign.

Campaign fields should include:

* campaign ID
* organization wallet
* title
* description
* funding goal
* current funds
* total spent
* active status
* timestamp

Do not store large text or images on-chain.

Store only essential state.

---

# 6. DONATIONS

A donor connects their wallet and selects a campaign.

They enter an amount of MON.

Example:

`1 MON`

When they click Donate:

1. Wallet opens.
2. User confirms.
3. Transaction is sent to Monad.
4. Smart contract receives the funds.
5. Donation is recorded.
6. UI waits for transaction confirmation.
7. UI shows success.
8. Real transaction hash is displayed.
9. User can click "View on Monad Explorer."

The contract must emit a proper Donation event.

Example concept:

`Donation(campaignId, donor, amount, timestamp)`

Do not hardcode the exact implementation if a better secure pattern is appropriate.

---

# 7. MONEY MUST BE CONTROLLED BY THE CONTRACT

This is extremely important.

Donated funds must NOT simply go directly into an organization wallet.

Instead:

DONOR

↓

MONAD SMART CONTRACT

↓

CAMPAIGN BALANCE

The contract holds the funds.

The organization cannot simply withdraw the entire campaign balance.

This is what makes TraceDonate meaningfully different from a normal donation website.

---

# 8. EXPENSES

Organizations need to be able to create spending records.

Example:

### Food

Amount:

`0.4 MON`

Recipient:

`Supplier wallet`

Description:

`500 meal packets`

Evidence:

`Invoice / receipt / proof`

The organization submits the expense.

The application stores supporting evidence off-chain.

The smart contract records the important financial information.

For example:

* campaign ID
* expense ID
* amount
* recipient wallet
* category
* timestamp
* status
* evidence reference/hash where appropriate

---

# 9. EXPENSE APPROVAL

Implement a simple but meaningful verification mechanism.

Do NOT build a huge DAO.

For the hackathon MVP, use a controlled verification mechanism that is clearly explained in the UI and README.

The important rule:

### An expense cannot move campaign funds until the required verification condition is satisfied.

After approval:

The smart contract executes the payment.

Example:

CAMPAIGN CONTRACT

↓

0.4 MON

↓

SUPPLIER WALLET

The transaction must happen on Monad.

---

# 10. MONEY FLOW

The most important product feature is:

## "Follow My Money"

A donor should be able to open a campaign and see a visual money flow.

Example:

DONATION

`1 MON`

↓

CAMPAIGN

↓

`0.4 MON` → Food

`0.2 MON` → Transport

`0.1 MON` → Medicine

`0.3 MON` → Remaining

Each completed payment must be clickable.

Clicking it should show:

* amount
* category
* recipient wallet
* timestamp
* transaction hash
* evidence
* verification status
* Monad explorer link

---

# 11. IMPACT RECEIPT

After donating, generate a beautiful digital impact receipt.

Example:

## YOUR CONTRIBUTION

`1 MON`

Campaign:

`Flood Relief`

Current trace:

`0.4 MON → Food`

`0.2 MON → Transport`

`0.1 MON → Medicine`

`0.3 MON → Remaining`

Show:

**Verified on Monad**

with the actual transaction.

This should feel like a premium financial product, not a charity template.

---

# 12. CAMPAIGN PAGE

Create a premium campaign page.

Example:

# FLOOD RELIEF 2026

Emergency food and medical support.

### Funding

`72.4 MON / 100 MON`

Beautiful animated progress visualization.

Then:

### FUND ALLOCATION

Food — 42%

Medicine — 25%

Transport — 18%

Other — 10%

Remaining — 5%

Every category should be interactive.

---

# 13. DONOR DASHBOARD

Create a personal dashboard.

Show:

### Total donated

`12.4 MON`

### Total campaigns

`6`

### Funds traced

`94%`

### Verified spending

`8.7 MON`

### Active donations

`3`

Then show a timeline:

Donation

↓

Campaign

↓

Expense

↓

Supplier

↓

Blockchain transaction

This should visually communicate:

**"I can follow my money."**

---

# 14. ORGANIZATION DASHBOARD

Create a separate organization experience.

Organization can:

* Create campaign
* View campaign
* View donations
* Create expense
* Upload evidence
* See pending verification
* See approved expenses
* See completed blockchain payments
* View transaction hashes

Make it feel like professional financial software.

Not like a generic admin dashboard.

---

# 15. EVIDENCE

For each expense, allow the organization to attach:

* invoice
* receipt
* image
* short description

Store these off-chain.

Associate the evidence with the blockchain expense record.

The interface should clearly distinguish:

### Blockchain proof

from

### Supporting evidence

Blockchain proves the payment occurred.

Evidence supports what the payment was for.

Never falsely claim that blockchain automatically proves a physical-world event.

---

# 16. TRANSPARENCY PAGE

Create a dedicated page:

## "Where Does The Money Go?"

This is one of the most important pages.

Show a visual financial graph.

Example:

DONORS

↓

CAMPAIGN

↓

FUNDS

↓

FOOD

↓

SUPPLIER

↓

VERIFIED TRANSACTION

The user should understand the entire system without reading documentation.

---

# 17. BLOCKCHAIN EXPLORER LINKS

Every important blockchain transaction should have:

**View on Monad Explorer →**

Open the correct real explorer URL.

Never create fake explorer links.

Use environment configuration for the explorer base URL.

---

# 18. WALLET EXPERIENCE

Wallet UX must be excellent.

Support a mainstream EVM wallet.

When the wallet is not connected:

Show:

**Connect Wallet**

After connecting:

Show:

* shortened address
* network
* balance
* disconnect option

If the user is on the wrong network:

Show a clear:

**Switch to Monad Testnet**

action where supported.

Never leave users confused about network errors.

---

# 19. TRANSACTION UX

Every blockchain action needs:

### Before transaction

Show what is about to happen.

Example:

`Donate 1 MON`

### During transaction

Show:

`Waiting for wallet confirmation...`

Then:

`Transaction pending...`

Then:

`Confirming on Monad...`

Finally:

`Donation confirmed ✓`

Show transaction hash.

Allow:

`View on Monad Explorer`

Handle rejection gracefully.

Never show success before the blockchain confirms the transaction.

---

# 20. UI / DESIGN DIRECTION

This is VERY important.

The UI must NOT look AI-generated.

Do NOT create:

* generic purple gradients everywhere
* excessive glassmorphism
* random glowing circles
* unnecessary neon
* giant gradient text
* generic dashboard cards
* excessive rounded rectangles
* stock Web3 imagery
* cartoon crypto graphics
* template-looking sections

The design should look like a real startup backed by a strong product designer.

Think:

### Premium fintech + modern Web3 infrastructure.

References in spirit:

* Linear
* Stripe
* Vercel
* modern fintech products
* premium financial dashboards

But do NOT copy any existing product.

Create an original visual identity for TraceDonate.

---

# 21. VISUAL STYLE

Use a sophisticated dark interface as the primary experience.

Base:

Very deep charcoal / near-black.

Text:

Warm white / soft gray.

Accent:

Use ONE strong accent color consistently.

The accent should communicate:

**trust + transparency + verification**

Avoid rainbow gradients.

Use subtle borders.

Use generous whitespace.

Use strong typography.

Use clear hierarchy.

The website should feel:

**calm, trustworthy, futuristic, premium.**

Not "crypto casino."

---

# 22. 3D EFFECTS

Use 3D only where it improves the product.

Create a subtle interactive 3D centerpiece on the landing page representing:

### A transparent financial network.

For example:

A floating network of connected nodes:

DONOR

↓

CAMPAIGN

↓

PAYMENT

↓

SUPPLIER

↓

PROOF

The nodes should subtly move with depth/parallax.

Use Three.js / React Three Fiber only if performance remains good.

The 3D object must feel like part of the product concept.

Do NOT add a random spinning coin or blockchain cube.

---

# 23. ANIMATIONS

Animations should feel intentional and expensive.

Use subtle:

* page transitions
* number counting
* progress animations
* transaction status animations
* node connections
* hover states
* smooth chart transitions
* wallet connection transitions
* transaction confirmation animation

For the donation flow:

When a donation succeeds:

Show the money visually moving:

DONOR

↓

CAMPAIGN VAULT

Then settle into the campaign balance.

For an expense:

CAMPAIGN

↓

SUPPLIER

Then show:

**Verified on Monad**

This should become the signature interaction of the product.

---

# 24. LANDING PAGE

Create a premium hero.

Headline:

# **Know where your money goes.**

Subheadline:

**TraceDonate makes charitable giving transparent by putting donations and spending on-chain. Follow every payment. Verify every transaction.**

Primary CTA:

**Explore Campaigns**

Secondary CTA:

**How It Works**

Hero visual:

Interactive 3D financial transparency network.

Show subtle live blockchain activity.

Example:

`Donation verified`

`Expense recorded`

`Payment confirmed`

These should be real data where possible, not fake claims.

---

# 25. LANDING PAGE SECTIONS

Use:

### Hero

Know where your money goes.

### Problem

Donors give money.

Then the trail disappears.

### Solution

Trace every payment.

### How it works

1. Donate
2. Funds are secured
3. Organization spends
4. Payment is recorded
5. Donor verifies

### Live transparency

Show real campaign statistics from the backend/blockchain.

### Money flow

Interactive visual example.

### Why Monad

Explain simply:

**Fast, low-cost on-chain settlement makes transparent financial tracking practical.**

Do not use complicated blockchain jargon.

### Campaigns

Show active campaigns.

### Final CTA

**Give with proof.**

---

# 26. MICRO-INTERACTIONS

Create polished details:

* buttons have subtle physical response
* cards lift slightly
* wallet address copies with feedback
* transaction hashes copy cleanly
* progress bars animate
* verified badges animate once
* numbers count smoothly
* skeleton loading states
* empty states are beautifully designed
* errors are human-readable

Do not overanimate.

The UI must remain professional.

---

# 27. RESPONSIVENESS

The entire product must work on:

* desktop
* laptop
* tablet
* mobile

Mobile wallet interaction must be considered.

No horizontal overflow.

No broken charts.

No tiny text.

---

# 28. ACCESSIBILITY

Implement:

* keyboard navigation
* visible focus states
* sufficient contrast
* semantic HTML
* accessible buttons
* aria labels where necessary
* reduced-motion support

Animations should respect:

`prefers-reduced-motion`

---

# 29. SECURITY

Do not expose:

* private keys
* API secrets
* Supabase service keys
* deployment credentials

Use environment variables.

Never put secrets in frontend code.

Do not trust client-side amounts.

Validate values on the smart contract.

Use Solidity best practices.

Avoid unnecessary external contract dependencies.

---

# 30. ERROR HANDLING

Handle:

* rejected wallet transaction
* insufficient MON
* wrong network
* RPC failure
* contract revert
* failed transaction
* unavailable evidence
* campaign not found
* invalid amount

Never show:

"Something went wrong."

Instead explain the problem clearly.

---

# 31. DEMO MODE

Create a clearly labeled:

### Demo Campaign

so judges can immediately understand how to use the platform.

But do NOT fake blockchain activity.

The demo campaign must use the real deployed contract.

Provide enough testnet information in the README so judges can obtain test MON and interact with it.

---

# 32. ADMIN / ORGANIZATION AUTHORIZATION

Do not put private admin keys into the frontend.

Organization authorization must be based on wallet addresses/roles.

The smart contract should enforce authorization for protected functions.

---

# 33. DATABASE

Use Supabase for:

* campaign metadata
* organization profile
* evidence metadata
* expense descriptions
* supporting documents
* analytics

Blockchain remains the source of truth for:

* donations
* fund movements
* contract balances
* blockchain transaction references
* verified on-chain state

Do not duplicate blockchain state unnecessarily.

---

# 34. EVENT INDEXING

Use contract events to make transaction history easy to retrieve.

Important events should include concepts such as:

* CampaignCreated
* DonationReceived
* ExpenseCreated
* ExpenseApproved
* ExpenseExecuted
* RefundExecuted

Use events for frontend history wherever practical.

---

# 35. CONTRACT TESTING

Before deployment:

Write tests for:

* campaign creation
* donation
* multiple donations
* expense creation
* unauthorized expense
* approval
* payment execution
* insufficient campaign balance
* invalid campaign
* refund if implemented

Do not deploy until the basic contract tests pass.

---

# 36. README

Create a professional README.

It MUST contain:

# TraceDonate

Short explanation.

## Live Application

[actual deployed URL]

## Monad Contract

[actual deployed contract address]

## Monad Network

Monad Testnet

## Explorer

[actual explorer contract URL]

## Problem

Explain donation transparency.

## Solution

Explain TraceDonate.

## Why Blockchain?

Explain why the financial trail needs an independent, verifiable ledger.

## Why Monad?

Explain why Monad's performance and EVM compatibility make it suitable.

## Architecture

Include a simple architecture diagram.

## Features

List only features that actually work.

## Tech Stack

List actual technologies.

## How to Run

Give exact commands.

## Environment Variables

Explain required variables without exposing secrets.

## Wallet Setup

Explain how to connect to Monad Testnet.

## Testnet MON

Explain where/how a judge can obtain test tokens using current official Monad resources.

## Contract

Include deployment address and verification link.

## Demo Flow

Give judges a 60-second walkthrough.

The README must allow another developer to run the project without asking us questions.

---

# 37. GITHUB QUALITY

Keep the repository professional.

Use:

```text
/apps
/contracts
/components
/lib
/hooks
/abi
/public
```

or another clean architecture.

Do not commit:

* `.env`
* private keys
* build artifacts unnecessarily
* huge files
* unused templates
* random generated code
* dead components

Remove unused dependencies.

Add a proper `.gitignore`.

---

# 38. PERFORMANCE

The website must load quickly.

Do not make the 3D scene destroy performance.

Lazy-load heavy visual components.

Optimize images.

Avoid unnecessary client-side rendering.

Use server components where appropriate.

---

# 39. IMPORTANT PRODUCT PRINCIPLE

The product should communicate one thing everywhere:

# "FOLLOW YOUR MONEY."

Every major UI decision should reinforce that.

Do not turn this into a generic charity marketplace.

The main experience is:

**Donation → Money flow → Expense → Payment → Proof**

---

# 40. DO NOT OVERBUILD

This is a hackathon.

Prioritize:

### MUST WORK

1. Wallet connection
2. Monad Testnet
3. Campaign
4. Donation
5. Smart contract holds funds
6. Expense
7. Verified/authorized payment
8. Real transaction
9. Transaction explorer link
10. Money flow visualization

### NICE TO HAVE

* evidence uploads
* impact receipt
* analytics
* 3D network
* advanced animations
* multiple campaign types

If time becomes limited, sacrifice fancy features before sacrificing blockchain functionality.

---

# 41. FINAL DEMO EXPERIENCE

The final product must allow this exact flow:

### STEP 1

Open TraceDonate.

### STEP 2

Connect wallet.

### STEP 3

Open Demo Campaign.

### STEP 4

Click:

**Donate 0.1 MON**

### STEP 5

Wallet confirmation appears.

### STEP 6

Transaction confirms on Monad.

### STEP 7

UI shows:

**Donation verified ✓**

### STEP 8

Open:

**Follow My Money**

### STEP 9

Show campaign financial flow.

### STEP 10

Create/execute a small legitimate demo expense.

### STEP 11

Show:

`0.02 MON → Supplier`

### STEP 12

Click:

**Verify on Monad**

### STEP 13

Open the actual Monad explorer transaction.

This should be the centerpiece of the presentation.

---

# 42. JUDGE-FIRST DESIGN

A judge who opens the website for the first time should understand within 10 seconds:

### WHAT?

Transparent donations.

### HOW?

Blockchain-tracked money flow.

### WHY?

Donors don't have to blindly trust reports.

### WHERE?

Monad.

Do not force judges to read documentation to understand the product.

---

# 43. DO NOT USE THESE DESIGN PATTERNS

Absolutely avoid:

* generic AI-generated landing pages
* giant gradient text
* excessive purple
* excessive glassmorphism
* random 3D coins
* crypto rockets
* floating dollar signs
* fake "LIVE TRANSACTIONS" unless they are real
* fake statistics
* fake testimonials
* fake users
* fake partner logos
* fake charity logos
* meaningless charts
* excessive rounded cards
* huge shadows
* excessive neon
* stock photos of people donating

Every visual should serve the product.

---

# 44. FINAL QUALITY BAR

Before considering the project complete, audit it as if you were a Monad judge.

Ask:

### Blockchain

* Is the contract really deployed?
* Is the contract verified?
* Does money really move through the contract?
* Can I see a real transaction?
* Can I inspect it on Monad?

### Product

* Can I understand the product immediately?
* Can I donate without help?
* Can I follow my money?
* Can I verify spending?

### Design

* Does this look like a real startup?
* Does it feel premium?
* Does it avoid AI-generated aesthetics?
* Are animations purposeful?
* Is the 3D visualization meaningful?

### Submission

* Public GitHub?
* README?
* Live URL?
* Contract address?
* Explorer link?
* Deployment instructions?

---

# 45. BUILD ORDER

Do NOT start by spending hours designing the landing page.

Build in this order:

### Phase 1

Create and test Solidity contract.

### Phase 2

Deploy to Monad Testnet.

### Phase 3

Verify contract.

### Phase 4

Test real donation transaction.

### Phase 5

Connect wallet to frontend.

### Phase 6

Build campaign and donor flows.

### Phase 7

Build expense/payment flow.

### Phase 8

Build money-flow visualization.

### Phase 9

Add evidence and impact receipt.

### Phase 10

Build premium landing page.

### Phase 11

Add 3D and animations.

### Phase 12

Deploy to Vercel.

### Phase 13

Test from a completely fresh wallet/device.

### Phase 14

Finalize README.

### Phase 15

Record demo video and prepare submission.

---

# FINAL INSTRUCTION

Build TraceDonate as a **real, deployable Monad Web3 product**, not a prototype that merely looks like one.

Prioritize real blockchain functionality, security, reliability, clean UX and a distinctive premium visual identity.

When there is a choice between adding another feature and making an existing blockchain flow more reliable, **choose reliability**.

When there is a choice between adding more visual effects and improving the donation → payment → verification experience, **choose the product experience**.

The final result should feel like a product that could become a real startup—not an AI-generated hackathon template.

**Core message:**

# Give with proof.

## Follow every payment.

### Powered by Monad.
