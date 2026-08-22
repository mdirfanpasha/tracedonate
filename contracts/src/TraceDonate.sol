// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TraceDonate
 * @notice Transparent Charitable Giving and Verified Payout Platform on Monad.
 * @dev Every donation is locked in contract escrow. Organization spending requires
 *      formal expense submission and verifier authorization before funds are
 *      transferred directly to the verified supplier/vendor wallet.
 */
contract TraceDonate {
    // --- Custom Errors ---
    error Unauthorized();
    error CampaignNotFound();
    error CampaignNotActive();
    error ZeroDonation();
    error GoalMustBeGreaterThanZero();
    error InvalidAddress();
    error InvalidAmount();
    error ExpenseNotFound();
    error ExpenseNotPending();
    error ExpenseNotApproved();
    error ExpenseAlreadyProcessed();
    error InsufficientCampaignBalance();
    error TransferFailed();
    error ReentrancyGuardReentrantCall();

    // --- Enums ---
    enum ExpenseStatus {
        Pending,
        Approved,
        Rejected,
        Executed
    }

    // --- Structs ---
    struct Campaign {
        uint256 id;
        address payable organization;
        string title;
        string description;
        uint256 goal;
        uint256 totalRaised;
        uint256 currentBalance;
        uint256 totalSpent;
        string category;
        string imageUri;
        bool active;
        uint256 createdAt;
    }

    struct Expense {
        uint256 id;
        uint256 campaignId;
        uint256 amount;
        address payable recipientSupplier;
        string category;
        string description;
        string evidenceHash; // IPFS CID or Supabase reference for receipts/invoices
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

    // --- State Variables ---
    address public owner;
    uint256 public campaignCount;
    uint256 public expenseCount;
    uint256 public totalDonationsCount;
    uint256 public globalTotalDonated;
    uint256 public globalTotalSpent;

    mapping(address => bool) public isVerifier;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Expense) public expenses;
    mapping(uint256 => uint256[]) private _campaignExpenses;
    mapping(address => Donation[]) private _donorDonations;
    mapping(address => uint256[]) private _donorCampaignIds;
    mapping(address => mapping(uint256 => bool)) private _hasDonatedToCampaign;

    // Simple reentrancy guard state
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // --- Events ---
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed organization,
        string title,
        uint256 goal,
        string category,
        uint256 timestamp
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 currentBalance,
        uint256 timestamp
    );

    event ExpenseCreated(
        uint256 indexed campaignId,
        uint256 indexed expenseId,
        address indexed recipientSupplier,
        uint256 amount,
        string category,
        string evidenceHash,
        uint256 timestamp
    );

    event ExpenseApproved(
        uint256 indexed campaignId,
        uint256 indexed expenseId,
        address indexed approver,
        uint256 timestamp
    );

    event ExpenseRejected(
        uint256 indexed campaignId,
        uint256 indexed expenseId,
        address indexed rejecter,
        string reason,
        uint256 timestamp
    );

    event ExpenseExecuted(
        uint256 indexed campaignId,
        uint256 indexed expenseId,
        address indexed recipientSupplier,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );

    event VerifierStatusUpdated(address indexed verifier, bool isApproved);

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyVerifierOrOwner() {
        if (msg.sender != owner && !isVerifier[msg.sender]) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuardReentrantCall();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        owner = msg.sender;
        isVerifier[msg.sender] = true;
        _status = _NOT_ENTERED;
    }

    // --- Admin / Verifier Config ---
    function setVerifier(address verifier, bool approved) external onlyOwner {
        if (verifier == address(0)) revert InvalidAddress();
        isVerifier[verifier] = approved;
        emit VerifierStatusUpdated(verifier, approved);
    }

    // --- Campaign Functions ---
    /**
     * @notice Create a new fundraising campaign
     * @param title Title of campaign
     * @param description Short on-chain summary
     * @param goal Funding goal in wei (MON)
     * @param category Category (e.g., Disaster, Medical, Education, Environment)
     * @param imageUri Image URI or metadata URI
     */
    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        string memory category,
        string memory imageUri
    ) external returns (uint256) {
        if (goal == 0) revert GoalMustBeGreaterThanZero();

        campaignCount++;
        uint256 newId = campaignCount;

        campaigns[newId] = Campaign({
            id: newId,
            organization: payable(msg.sender),
            title: title,
            description: description,
            goal: goal,
            totalRaised: 0,
            currentBalance: 0,
            totalSpent: 0,
            category: category,
            imageUri: imageUri,
            active: true,
            createdAt: block.timestamp
        });

        emit CampaignCreated(newId, msg.sender, title, goal, category, block.timestamp);
        return newId;
    }

    // --- Donation Functions ---
    /**
     * @notice Donate native MON tokens to a campaign locked in escrow
     * @param campaignId ID of target campaign
     */
    function donate(uint256 campaignId) external payable nonReentrant {
        if (msg.value == 0) revert ZeroDonation();
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.id == 0) revert CampaignNotFound();
        if (!campaign.active) revert CampaignNotActive();

        campaign.totalRaised += msg.value;
        campaign.currentBalance += msg.value;
        globalTotalDonated += msg.value;
        totalDonationsCount++;

        _donorDonations[msg.sender].push(Donation({
            campaignId: campaignId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        if (!_hasDonatedToCampaign[msg.sender][campaignId]) {
            _hasDonatedToCampaign[msg.sender][campaignId] = true;
            _donorCampaignIds[msg.sender].push(campaignId);
        }

        emit DonationReceived(
            campaignId,
            msg.sender,
            msg.value,
            campaign.currentBalance,
            block.timestamp
        );
    }

    // --- Expense Management Functions ---
    /**
     * @notice Organization submits a spending request with invoice / proof
     * @param campaignId Campaign to spend from
     * @param amount Amount in wei to spend
     * @param recipientSupplier Vendor/Supplier receiving payment directly
     * @param category Expense category (Food, Transport, Medical, Equipment, Logistics)
     * @param description Itemized description of goods/services
     * @param evidenceHash IPFS hash or verification doc reference
     */
    function createExpense(
        uint256 campaignId,
        uint256 amount,
        address payable recipientSupplier,
        string memory category,
        string memory description,
        string memory evidenceHash
    ) external returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.id == 0) revert CampaignNotFound();
        if (msg.sender != campaign.organization && msg.sender != owner) revert Unauthorized();
        if (amount == 0) revert InvalidAmount();
        if (amount > campaign.currentBalance) revert InsufficientCampaignBalance();
        if (recipientSupplier == address(0)) revert InvalidAddress();

        expenseCount++;
        uint256 newExpenseId = expenseCount;

        expenses[newExpenseId] = Expense({
            id: newExpenseId,
            campaignId: campaignId,
            amount: amount,
            recipientSupplier: recipientSupplier,
            category: category,
            description: description,
            evidenceHash: evidenceHash,
            status: ExpenseStatus.Pending,
            createdAt: block.timestamp,
            executedAt: 0
        });

        _campaignExpenses[campaignId].push(newExpenseId);

        emit ExpenseCreated(
            campaignId,
            newExpenseId,
            recipientSupplier,
            amount,
            category,
            evidenceHash,
            block.timestamp
        );

        return newExpenseId;
    }

    /**
     * @notice Verifier approves a pending expense
     * @param expenseId ID of expense
     */
    function approveExpense(uint256 expenseId) external onlyVerifierOrOwner {
        Expense storage expense = expenses[expenseId];
        if (expense.id == 0) revert ExpenseNotFound();
        if (expense.status != ExpenseStatus.Pending) revert ExpenseNotPending();

        expense.status = ExpenseStatus.Approved;
        emit ExpenseApproved(expense.campaignId, expenseId, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifier rejects a pending expense with a reason
     */
    function rejectExpense(uint256 expenseId, string memory reason) external onlyVerifierOrOwner {
        Expense storage expense = expenses[expenseId];
        if (expense.id == 0) revert ExpenseNotFound();
        if (expense.status != ExpenseStatus.Pending) revert ExpenseNotPending();

        expense.status = ExpenseStatus.Rejected;
        emit ExpenseRejected(expense.campaignId, expenseId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Executes payment for an approved expense directly to the supplier
     * @param expenseId ID of approved expense
     */
    function executeExpense(uint256 expenseId) public nonReentrant {
        Expense storage expense = expenses[expenseId];
        if (expense.id == 0) revert ExpenseNotFound();
        if (expense.status != ExpenseStatus.Approved) revert ExpenseNotApproved();

        Campaign storage campaign = campaigns[expense.campaignId];
        if (campaign.currentBalance < expense.amount) revert InsufficientCampaignBalance();

        campaign.currentBalance -= expense.amount;
        campaign.totalSpent += expense.amount;
        globalTotalSpent += expense.amount;

        expense.status = ExpenseStatus.Executed;
        expense.executedAt = block.timestamp;

        // Directly pay supplier
        (bool success, ) = expense.recipientSupplier.call{value: expense.amount}("");
        if (!success) revert TransferFailed();

        emit ExpenseExecuted(
            expense.campaignId,
            expenseId,
            expense.recipientSupplier,
            expense.amount,
            campaign.currentBalance,
            block.timestamp
        );
    }

    /**
     * @notice 1-click convenience function for verifiers to approve and instantly execute payout
     * @param expenseId ID of pending expense
     */
    function approveAndExecuteExpense(uint256 expenseId) external onlyVerifierOrOwner {
        Expense storage expense = expenses[expenseId];
        if (expense.id == 0) revert ExpenseNotFound();
        if (expense.status != ExpenseStatus.Pending) revert ExpenseNotPending();

        expense.status = ExpenseStatus.Approved;
        emit ExpenseApproved(expense.campaignId, expenseId, msg.sender, block.timestamp);

        executeExpense(expenseId);
    }

    // --- View Functions ---
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        Campaign memory c = campaigns[campaignId];
        if (c.id == 0) revert CampaignNotFound();
        return c;
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint256 i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }

    function getCampaignExpenses(uint256 campaignId) external view returns (Expense[] memory) {
        uint256[] memory ids = _campaignExpenses[campaignId];
        Expense[] memory list = new Expense[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = expenses[ids[i]];
        }
        return list;
    }

    function getDonorDonations(address donor) external view returns (Donation[] memory) {
        return _donorDonations[donor];
    }

    function getDonorCampaignIds(address donor) external view returns (uint256[] memory) {
        return _donorCampaignIds[donor];
    }

    function getGlobalStats() external view returns (
        uint256 totalCampaigns,
        uint256 totalDonated,
        uint256 totalSpent,
        uint256 totalDonations,
        uint256 totalExpensesRecorded
    ) {
        return (
            campaignCount,
            globalTotalDonated,
            globalTotalSpent,
            totalDonationsCount,
            expenseCount
        );
    }
}
