export const TRACEDONATE_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x892A23381a17f223A4D9693B980c6563F82C1014") as `0x${string}`;

export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_EXPLORER_URL = "https://testnet.monadvision.com";
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";

export const TRACEDONATE_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CampaignNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CampaignNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpenseAlreadyProcessed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpenseNotApproved",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpenseNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpenseNotPending",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GoalMustBeGreaterThanZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientCampaignBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroDonation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "organization", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "category", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "donor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DonationReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "expenseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipientSupplier", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "category", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "evidenceHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ExpenseCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "expenseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "approver", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ExpenseApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "expenseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipientSupplier", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "remainingBalance", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ExpenseExecuted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "expenseId", "type": "uint256" }
    ],
    "name": "approveAndExecuteExpense",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "expenseId", "type": "uint256" }
    ],
    "name": "approveExpense",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "internalType": "string", "name": "category", "type": "string" },
      { "internalType": "string", "name": "imageUri", "type": "string" }
    ],
    "name": "createCampaign",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address payable", "name": "recipientSupplier", "type": "address" },
      { "internalType": "string", "name": "category", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "evidenceHash", "type": "string" }
    ],
    "name": "createExpense",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "expenseId", "type": "uint256" }
    ],
    "name": "executeExpense",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCampaigns",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address payable", "name": "organization", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "goal", "type": "uint256" },
          { "internalType": "uint256", "name": "totalRaised", "type": "uint256" },
          { "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
          { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "string", "name": "imageUri", "type": "string" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct TraceDonate.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "getCampaign",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address payable", "name": "organization", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "goal", "type": "uint256" },
          { "internalType": "uint256", "name": "totalRaised", "type": "uint256" },
          { "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
          { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "string", "name": "imageUri", "type": "string" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct TraceDonate.Campaign",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "campaignId", "type": "uint256" }
    ],
    "name": "getCampaignExpenses",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "address payable", "name": "recipientSupplier", "type": "address" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "evidenceHash", "type": "string" },
          { "internalType": "enum TraceDonate.ExpenseStatus", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "executedAt", "type": "uint256" }
        ],
        "internalType": "struct TraceDonate.Expense[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "donor", "type": "address" }
    ],
    "name": "getDonorDonations",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
          { "internalType": "address", "name": "donor", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct TraceDonate.Donation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      { "internalType": "uint256", "name": "totalCampaigns", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDonated", "type": "uint256" },
      { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDonations", "type": "uint256" },
      { "internalType": "uint256", "name": "totalExpensesRecorded", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "isVerifier",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Curated seed data for hackathon judges & instant demo exploration
export const SEED_CAMPAIGNS = [
  {
    id: 1,
    organization: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`,
    title: "Flood Relief 2026: Direct Emergency Response",
    description: "Delivering urgent emergency food packets, potable drinking water, and immediate triage medical kits to over 10,000 displaced families in critical monsoon flood regions.",
    goal: "100.000",
    goalWei: 100000000000000000000n,
    totalRaised: "72.400",
    totalRaisedWei: 72400000000000000000n,
    currentBalance: "24.100",
    currentBalanceWei: 24100000000000000000n,
    totalSpent: "48.300",
    totalSpentWei: 48300000000000000000n,
    category: "Disaster Relief",
    imageUri: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
    active: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
    expenses: [
      {
        id: 1,
        campaignId: 1,
        amount: "20.500",
        amountWei: 20500000000000000000n,
        recipientSupplier: "0x892a23381a17f223a4d9693b980c6563f82c1014" as `0x${string}`,
        category: "Food",
        description: "5,000 emergency ration kits & non-perishable high-protein grain bags",
        evidenceHash: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 4,
        txHash: "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2",
      },
      {
        id: 2,
        campaignId: 1,
        amount: "15.800",
        amountWei: 15800000000000000000n,
        recipientSupplier: "0x28a1c876b5d92e8a719c839d48b1938a92e105f2" as `0x${string}`,
        category: "Medical",
        description: "First responder antibiotics, wound dressings, and oral rehydration salts",
        evidenceHash: "ipfs://bafybeic2h7goxffo2aeqr6v6omj5v3h44v4qj54efvublmb3m7r4u4pzaa",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 2,
        txHash: "0x98f4c1029e8b7a6d5c4b3a21098f4c1029e8b7a6d5c4b3a21098f4c1029e8b7a",
      },
      {
        id: 3,
        campaignId: 1,
        amount: "12.000",
        amountWei: 12000000000000000000n,
        recipientSupplier: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65" as `0x${string}`,
        category: "Transport",
        description: "Helicopter & amphibious boat logistics fuel and operator charter",
        evidenceHash: "ipfs://bafybeib2zq7pldq3c3rwt2kkmqf54zln6m27a5mqqoxeab4n6fphg2yqnm",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 1,
        txHash: "0x5e8b2c1a4d9f03e7281a5c6d3f2e1a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
      },
      {
        id: 4,
        campaignId: 1,
        amount: "8.500",
        amountWei: 8500000000000000000n,
        recipientSupplier: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4df" as `0x${string}`,
        category: "Shelter",
        description: "Heavy-duty waterproof family shelter tents & emergency blankets",
        evidenceHash: "ipfs://bafybeif47eeyg7a7u6ox3w46eub7w5s7dmbw2c2yquz2pzao7f4k6g3pme",
        status: "Pending" as const,
        createdAt: Math.floor(Date.now() / 1000) - 3600 * 4,
      },
    ],
  },
  {
    id: 2,
    organization: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" as `0x${string}`,
    title: "Solar Water Purification Micro-Wells",
    description: "Installing deep-bore solar filtration stations supplying permanent, lab-tested safe drinking water to 4 off-grid drought stricken villages.",
    goal: "50.000",
    goalWei: 50000000000000000000n,
    totalRaised: "38.200",
    totalRaisedWei: 38200000000000000000n,
    currentBalance: "16.700",
    currentBalanceWei: 16700000000000000000n,
    totalSpent: "21.500",
    totalSpentWei: 21500000000000000000n,
    category: "Clean Water",
    imageUri: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    active: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 12,
    expenses: [
      {
        id: 5,
        campaignId: 2,
        amount: "14.000",
        amountWei: 14000000000000000000n,
        recipientSupplier: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as `0x${string}`,
        category: "Equipment",
        description: "Submersible Grundfos solar pump motors and PV array units",
        evidenceHash: "ipfs://bafybeihkm6f2x2qjefz2s6y5f5f3e4e4q6r7t8y9u0i1o2p3a4s5d6f7g8",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 8,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 7,
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      {
        id: 6,
        campaignId: 2,
        amount: "7.500",
        amountWei: 7500000000000000000n,
        recipientSupplier: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as `0x${string}`,
        category: "Logistics",
        description: "Well drilling rig transport & hydro-geological survey",
        evidenceHash: "ipfs://bafybeig5v3h44v4qj54efvublmb3m7r4u4pzaa2h7goxffo2aeqr6v6omj",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 4,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 3,
        txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      },
    ],
  },
  {
    id: 3,
    organization: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" as `0x${string}`,
    title: "Emergency Pediatric Trauma Care Supplies",
    description: "Procuring vital infant incubators, surgical instruments, and critical blood transfusion apparatus for remote community clinics.",
    goal: "80.000",
    goalWei: 80000000000000000000n,
    totalRaised: "54.000",
    totalRaisedWei: 54000000000000000000n,
    currentBalance: "30.000",
    currentBalanceWei: 30000000000000000000n,
    totalSpent: "24.000",
    totalSpentWei: 24000000000000000000n,
    category: "Medical",
    imageUri: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    active: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 15,
    expenses: [
      {
        id: 7,
        campaignId: 3,
        amount: "24.000",
        amountWei: 24000000000000000000n,
        recipientSupplier: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as `0x${string}`,
        category: "Medical",
        description: "2x Neonatal transport incubators & precision oxygen concentrators",
        evidenceHash: "ipfs://bafybeid3f2e1a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f5e8b2c1a4d9",
        status: "Executed" as const,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
        executedAt: Math.floor(Date.now() / 1000) - 86400 * 9,
        txHash: "0xaa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899",
      },
    ],
  },
];
