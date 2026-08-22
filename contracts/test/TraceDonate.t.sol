// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITraceDonate {
    enum ExpenseStatus {
        Pending,
        Approved,
        Rejected,
        Executed
    }

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
        string evidenceHash;
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
}

// Simple test contract pattern compatible with standard forge-std
contract TraceDonateTest {
    // Basic test assertions
    event CampaignCreated(uint256 indexed campaignId, address indexed organization, string title, uint256 goal, string category, uint256 timestamp);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 currentBalance, uint256 timestamp);
    event ExpenseExecuted(uint256 indexed campaignId, uint256 indexed expenseId, address indexed recipientSupplier, uint256 amount, uint256 remainingBalance, uint256 timestamp);
}
