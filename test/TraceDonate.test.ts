import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TraceDonate Smart Contract", function () {
  let traceDonate: any;
  let owner: SignerWithAddress;
  let org: SignerWithAddress;
  let donor1: SignerWithAddress;
  let donor2: SignerWithAddress;
  let supplier1: SignerWithAddress;
  let verifier: SignerWithAddress;
  let stranger: SignerWithAddress;

  const parseMon = (val: string) => ethers.parseEther(val);

  beforeEach(async function () {
    [owner, org, donor1, donor2, supplier1, verifier, stranger] = await ethers.getSigners();

    const TraceDonateFactory = await ethers.getContractFactory("TraceDonate");
    traceDonate = await TraceDonateFactory.deploy();
    await traceDonate.waitForDeployment();

    // Grant verifier role to verifier account
    await traceDonate.connect(owner).setVerifier(verifier.address, true);
  });

  describe("Deployment & Roles", function () {
    it("Should set deployer as owner and initial verifier", async function () {
      expect(await traceDonate.owner()).to.equal(owner.address);
      expect(await traceDonate.isVerifier(owner.address)).to.equal(true);
      expect(await traceDonate.isVerifier(verifier.address)).to.equal(true);
      expect(await traceDonate.isVerifier(stranger.address)).to.equal(false);
    });

    it("Should allow owner to toggle verifier status", async function () {
      await traceDonate.connect(owner).setVerifier(stranger.address, true);
      expect(await traceDonate.isVerifier(stranger.address)).to.equal(true);

      await traceDonate.connect(owner).setVerifier(stranger.address, false);
      expect(await traceDonate.isVerifier(stranger.address)).to.equal(false);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const tx = await traceDonate.connect(org).createCampaign(
        "Flood Relief 2026",
        "Emergency food and medical packs for flood victims",
        parseMon("50"),
        "Disaster Relief",
        "https://images.unsplash.com/photo-1547683905-f686c993aae5"
      );

      await expect(tx)
        .to.emit(traceDonate, "CampaignCreated")
        .withArgs(1, org.address, "Flood Relief 2026", parseMon("50"), "Disaster Relief", (await ethers.provider.getBlock("latest"))?.timestamp);

      const campaign = await traceDonate.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.organization).to.equal(org.address);
      expect(campaign.title).to.equal("Flood Relief 2026");
      expect(campaign.goal).to.equal(parseMon("50"));
      expect(campaign.currentBalance).to.equal(0n);
      expect(campaign.totalRaised).to.equal(0n);
      expect(campaign.totalSpent).to.equal(0n);
      expect(campaign.active).to.equal(true);
    });

    it("Should reject campaign creation with zero goal", async function () {
      await expect(
        traceDonate.connect(org).createCampaign("Zero Goal", "Desc", 0, "Other", "")
      ).to.be.revertedWithCustomError(traceDonate, "GoalMustBeGreaterThanZero");
    });
  });

  describe("Donations & Escrow", function () {
    beforeEach(async function () {
      await traceDonate.connect(org).createCampaign(
        "Medical Aid",
        "Critical surgical supplies",
        parseMon("10"),
        "Medical",
        ""
      );
    });

    it("Should accept donations, hold funds in contract, and update balances", async function () {
      const donateTx = await traceDonate.connect(donor1).donate(1, { value: parseMon("2.5") });

      await expect(donateTx)
        .to.emit(traceDonate, "DonationReceived")
        .withArgs(1, donor1.address, parseMon("2.5"), parseMon("2.5"), (await ethers.provider.getBlock("latest"))?.timestamp);

      const campaign = await traceDonate.getCampaign(1);
      expect(campaign.totalRaised).to.equal(parseMon("2.5"));
      expect(campaign.currentBalance).to.equal(parseMon("2.5"));

      // Check contract balance
      const contractBal = await ethers.provider.getBalance(await traceDonate.getAddress());
      expect(contractBal).to.equal(parseMon("2.5"));

      // Second donor
      await traceDonate.connect(donor2).donate(1, { value: parseMon("1.5") });
      const campaignAfter = await traceDonate.getCampaign(1);
      expect(campaignAfter.totalRaised).to.equal(parseMon("4.0"));
      expect(campaignAfter.currentBalance).to.equal(parseMon("4.0"));

      // Check global stats
      const stats = await traceDonate.getGlobalStats();
      expect(stats.totalDonated).to.equal(parseMon("4.0"));
      expect(stats.totalDonations).to.equal(2n);
    });

    it("Should reject 0 MON donation", async function () {
      await expect(
        traceDonate.connect(donor1).donate(1, { value: 0 })
      ).to.be.revertedWithCustomError(traceDonate, "ZeroDonation");
    });

    it("Should record donor donation history correctly", async function () {
      await traceDonate.connect(donor1).donate(1, { value: parseMon("1.0") });
      await traceDonate.connect(donor1).donate(1, { value: parseMon("2.0") });

      const donations = await traceDonate.getDonorDonations(donor1.address);
      expect(donations.length).to.equal(2);
      expect(donations[0].amount).to.equal(parseMon("1.0"));
      expect(donations[1].amount).to.equal(parseMon("2.0"));
    });
  });

  describe("Expense Creation, Approval & Direct Supplier Execution", function () {
    beforeEach(async function () {
      await traceDonate.connect(org).createCampaign(
        "Clean Water Initiative",
        "Building solar water filtration wells",
        parseMon("20"),
        "Infrastructure",
        ""
      );
      // Donor gives 5 MON
      await traceDonate.connect(donor1).donate(1, { value: parseMon("5.0") });
    });

    it("Should allow organization to create an expense within available balance", async function () {
      const tx = await traceDonate.connect(org).createExpense(
        1,
        parseMon("1.5"),
        supplier1.address,
        "Equipment",
        "Solar water pump unit (Model X)",
        "ipfs://QmExampleInvoice123"
      );

      await expect(tx)
        .to.emit(traceDonate, "ExpenseCreated")
        .withArgs(1, 1, supplier1.address, parseMon("1.5"), "Equipment", "ipfs://QmExampleInvoice123", (await ethers.provider.getBlock("latest"))?.timestamp);

      const expenses = await traceDonate.getCampaignExpenses(1);
      expect(expenses.length).to.equal(1);
      expect(expenses[0].amount).to.equal(parseMon("1.5"));
      expect(expenses[0].recipientSupplier).to.equal(supplier1.address);
      expect(expenses[0].status).to.equal(0); // Pending
    });

    it("Should reject expense creation from unauthorized accounts", async function () {
      await expect(
        traceDonate.connect(stranger).createExpense(
          1,
          parseMon("1.0"),
          supplier1.address,
          "Logistics",
          "Unauthorized expense",
          ""
        )
      ).to.be.revertedWithCustomError(traceDonate, "Unauthorized");
    });

    it("Should reject expense exceeding campaign balance", async function () {
      await expect(
        traceDonate.connect(org).createExpense(
          1,
          parseMon("10.0"), // Only 5 MON available
          supplier1.address,
          "Heavy Machinery",
          "Too expensive",
          ""
        )
      ).to.be.revertedWithCustomError(traceDonate, "InsufficientCampaignBalance");
    });

    it("Should approve and execute expense, transferring funds directly to supplier", async function () {
      // 1. Create expense
      await traceDonate.connect(org).createExpense(
        1,
        parseMon("1.5"),
        supplier1.address,
        "Water Filters",
        "100 ceramic water filter units",
        "ipfs://QmInvoiceWaterFilters"
      );

      const supplierBalBefore = await ethers.provider.getBalance(supplier1.address);

      // 2. Verifier approves
      const approveTx = await traceDonate.connect(verifier).approveExpense(1);
      await expect(approveTx)
        .to.emit(traceDonate, "ExpenseApproved")
        .withArgs(1, 1, verifier.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      // 3. Execute payout
      const execTx = await traceDonate.executeExpense(1);
      await expect(execTx)
        .to.emit(traceDonate, "ExpenseExecuted")
        .withArgs(1, 1, supplier1.address, parseMon("1.5"), parseMon("3.5"), (await ethers.provider.getBlock("latest"))?.timestamp);

      // Verify supplier balance increased by exactly 1.5 MON
      const supplierBalAfter = await ethers.provider.getBalance(supplier1.address);
      expect(supplierBalAfter - supplierBalBefore).to.equal(parseMon("1.5"));

      // Verify campaign state
      const campaign = await traceDonate.getCampaign(1);
      expect(campaign.currentBalance).to.equal(parseMon("3.5"));
      expect(campaign.totalSpent).to.equal(parseMon("1.5"));
      expect(campaign.totalRaised).to.equal(parseMon("5.0"));

      // Verify global stats
      const stats = await traceDonate.getGlobalStats();
      expect(stats.totalSpent).to.equal(parseMon("1.5"));
    });

    it("Should support 1-click approveAndExecute by verifier", async function () {
      await traceDonate.connect(org).createExpense(
        1,
        parseMon("2.0"),
        supplier1.address,
        "Pipes",
        "PVC piping bundle",
        "ipfs://QmInvoicePipes"
      );

      const supplierBalBefore = await ethers.provider.getBalance(supplier1.address);

      await traceDonate.connect(verifier).approveAndExecuteExpense(1);

      const supplierBalAfter = await ethers.provider.getBalance(supplier1.address);
      expect(supplierBalAfter - supplierBalBefore).to.equal(parseMon("2.0"));

      const campaign = await traceDonate.getCampaign(1);
      expect(campaign.currentBalance).to.equal(parseMon("3.0"));
      expect(campaign.totalSpent).to.equal(parseMon("2.0"));
    });
  });
});
