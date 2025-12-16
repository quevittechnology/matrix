const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Admin Settings", function () {
    let UniversalMatrix, matrix, RoyaltyVault, royaltyVault;
    let owner, feeReceiver, newFeeReceiver, user1, user2;
    let levelPrices, levelFees;

    beforeEach(async function () {
        [owner, feeReceiver, newFeeReceiver, user1, user2] = await ethers.getSigners();

        // Deploy RoyaltyVault
        RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
        royaltyVault = await RoyaltyVault.deploy(owner.address);
        await royaltyVault.waitForDeployment();

        // Deploy UniversalMatrix
        UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
        matrix = await upgrades.deployProxy(
            UniversalMatrix,
            [feeReceiver.address, await royaltyVault.getAddress(), owner.address],
            { initializer: "initialize", kind: "uups" }
        );
        await matrix.waitForDeployment();

        // Configure RoyaltyVault
        await royaltyVault.setUniversalMatrix(await matrix.getAddress());

        // Set level prices (required for testing)
        const prices = [
            ethers.parseEther("0.0133"),  // Level 1
            ethers.parseEther("0.0200"),  // Level 2
            ethers.parseEther("0.0400"),  // Level 3
            ethers.parseEther("0.0800"),  // Level 4
            ethers.parseEther("0.1600"),  // Level 5
            ethers.parseEther("0.3200"),  // Level 6
            ethers.parseEther("0.6400"),  // Level 7
            ethers.parseEther("1.2800"),  // Level 8
            ethers.parseEther("2.5600"),  // Level 9
            ethers.parseEther("5.1200"),  // Level 10
            ethers.parseEther("10.2400"), // Level 11
            ethers.parseEther("20.4800"), // Level 12
            ethers.parseEther("40.9600")  // Level 13
        ];
        await matrix.connect(owner).updateLevelPrices(prices);

        // Get level prices
        [levelPrices, levelFees] = await matrix.getLevels();
    });

    describe("1. Level Prices Configuration", function () {
        it("Should update all 13 level prices", async function () {
            const newPrices = [
                ethers.parseEther("0.0100"),
                ethers.parseEther("0.0150"),
                ethers.parseEther("0.0300"),
                ethers.parseEther("0.0600"),
                ethers.parseEther("0.1200"),
                ethers.parseEther("0.2400"),
                ethers.parseEther("0.4800"),
                ethers.parseEther("0.9600"),
                ethers.parseEther("1.9200"),
                ethers.parseEther("3.8400"),
                ethers.parseEther("7.6800"),
                ethers.parseEther("15.3600"),
                ethers.parseEther("30.7200")
            ];

            await matrix.connect(owner).updateLevelPrices(newPrices);
            const [updatedPrices] = await matrix.getLevels();

            for (let i = 0; i < 13; i++) {
                expect(updatedPrices[i]).to.equal(newPrices[i]);
            }
        });

        it("Should revert if non-owner tries to update prices", async function () {
            const newPrices = Array(13).fill(ethers.parseEther("0.01"));
            await expect(
                matrix.connect(user1).updateLevelPrices(newPrices)
            ).to.be.reverted;
        });

        it("Should allow registration with updated prices", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await expect(
                matrix.connect(user1).register(defaultRefer, defaultRefer, user1.address, { value: cost })
            ).to.emit(matrix, "Registered");
        });
    });

    describe("2. Sponsor Commission Percentage", function () {
        it("Should update sponsor commission percentage", async function () {
            await matrix.connect(owner).setSponsorCommission(7);
            expect(await matrix.sponsorCommissionPercent()).to.equal(7);
        });

        it("Should accept 0% commission", async function () {
            await matrix.connect(owner).setSponsorCommission(0);
            expect(await matrix.sponsorCommissionPercent()).to.equal(0);
        });

        it("Should accept 100% commission", async function () {
            await matrix.connect(owner).setSponsorCommission(100);
            expect(await matrix.sponsorCommissionPercent()).to.equal(100);
        });

        it("Should revert if percentage > 100", async function () {
            await expect(
                matrix.connect(owner).setSponsorCommission(101)
            ).to.be.revertedWith("Invalid percentage");
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(
                matrix.connect(user1).setSponsorCommission(10)
            ).to.be.reverted;
        });
    });

    describe("3. Sponsor Minimum Level", function () {
        it("Should update sponsor minimum level", async function () {
            await matrix.connect(owner).setSponsorMinLevel(5);
            expect(await matrix.sponsorMinLevel()).to.equal(5);
        });

        it("Should accept level 1", async function () {
            await matrix.connect(owner).setSponsorMinLevel(1);
            expect(await matrix.sponsorMinLevel()).to.equal(1);
        });

        it("Should accept level 13", async function () {
            await matrix.connect(owner).setSponsorMinLevel(13);
            expect(await matrix.sponsorMinLevel()).to.equal(13);
        });

        it("Should revert if level < 1", async function () {
            await expect(
                matrix.connect(owner).setSponsorMinLevel(0)
            ).to.be.revertedWith("Invalid level");
        });

        it("Should revert if level > 13", async function () {
            await expect(
                matrix.connect(owner).setSponsorMinLevel(14)
            ).to.be.revertedWith("Invalid level");
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(
                matrix.connect(user1).setSponsorMinLevel(5)
            ).to.be.reverted;
        });
    });

    describe("4. Sponsor Fallback Destination", function () {
        it("Should update to ROOT_USER (0)", async function () {
            await matrix.connect(owner).setSponsorFallback(0);
            expect(await matrix.sponsorFallback()).to.equal(0);
        });

        it("Should update to ADMIN (1)", async function () {
            await matrix.connect(owner).setSponsorFallback(1);
            expect(await matrix.sponsorFallback()).to.equal(1);
        });

        it("Should update to ROYALTY_POOL (2)", async function () {
            await matrix.connect(owner).setSponsorFallback(2);
            expect(await matrix.sponsorFallback()).to.equal(2);
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(
                matrix.connect(user1).setSponsorFallback(1)
            ).to.be.reverted;
        });
    });

    describe("5. Fee Receiver Address", function () {
        it("Should update fee receiver address", async function () {
            await matrix.connect(owner).setFeeReceiver(newFeeReceiver.address);
            expect(await matrix.feeReceiver()).to.equal(newFeeReceiver.address);
        });

        it("Should revert if address is zero", async function () {
            await expect(
                matrix.connect(owner).setFeeReceiver(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid address");
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(
                matrix.connect(user1).setFeeReceiver(newFeeReceiver.address)
            ).to.be.reverted;
        });

        it("Should send fees to new receiver after update", async function () {
            await matrix.connect(owner).setFeeReceiver(newFeeReceiver.address);

            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);
            const adminFee = (levelPrices[0] * levelFees[0]) / 100n;

            const balanceBefore = await ethers.provider.getBalance(newFeeReceiver.address);
            await matrix.connect(user1).register(defaultRefer, defaultRefer, user1.address, { value: cost });
            const balanceAfter = await ethers.provider.getBalance(newFeeReceiver.address);

            // Fee receiver should receive at least the admin fee
            // (may receive more due to contract sending entire remaining balance)
            const received = balanceAfter - balanceBefore;
            expect(received).to.be.gte(adminFee);
            expect(received).to.be.gt(0);
        });
    });

    describe("6. Royalty Vault Address", function () {
        it("Should update royalty vault address", async function () {
            const newVault = await RoyaltyVault.deploy(owner.address);
            await newVault.waitForDeployment();

            await matrix.connect(owner).setRoyaltyVault(await newVault.getAddress());
            expect(await matrix.royaltyVault()).to.equal(await newVault.getAddress());
        });

        it("Should revert if address is zero", async function () {
            await expect(
                matrix.connect(owner).setRoyaltyVault(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid address");
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(
                matrix.connect(user1).setRoyaltyVault(user2.address)
            ).to.be.reverted;
        });
    });

    describe("7. Contract Pause Status", function () {
        it("Should pause contract", async function () {
            await matrix.connect(owner).setPaused(true);
            expect(await matrix.paused()).to.equal(true);
        });

        it("Should unpause contract", async function () {
            await matrix.connect(owner).setPaused(true);
            await matrix.connect(owner).setPaused(false);
            expect(await matrix.paused()).to.equal(false);
        });

        it("Should emit Paused event", async function () {
            await expect(matrix.connect(owner).setPaused(true))
                .to.emit(matrix, "Paused")
                .withArgs(true);
        });

        it("Should block registration when paused", async function () {
            await matrix.connect(owner).setPaused(true);

            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await expect(
                matrix.connect(user1).register(defaultRefer, defaultRefer, user1.address, { value: cost })
            ).to.be.revertedWith("Contract paused");
        });

        it("Should block upgrades when paused", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, defaultRefer, user1.address, { value: cost });
            const userId = await matrix.id(user1.address);

            await matrix.connect(owner).setPaused(true);

            const upgradeCost = levelPrices[1] + (levelPrices[1] * levelFees[1] / 100n);
            await expect(
                matrix.connect(user1).upgrade(userId, 1, { value: upgradeCost })
            ).to.be.revertedWith("Contract paused");
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(
                matrix.connect(user1).setPaused(true)
            ).to.be.reverted;
        });
    });

    describe("8. Emergency Withdraw", function () {
        it("Should withdraw contract balance to owner", async function () {
            // Add some balance to contract
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);
            await matrix.connect(user1).register(defaultRefer, defaultRefer, user1.address, { value: cost });

            const contractBalance = await ethers.provider.getBalance(await matrix.getAddress());
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            const tx = await matrix.connect(owner).emergencyWithdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            // Owner should receive contract balance minus gas
            expect(ownerBalanceAfter).to.be.closeTo(
                ownerBalanceBefore + contractBalance - gasUsed,
                ethers.parseEther("0.001") // Allow small variance for gas
            );
        });

        it("Should revert if non-owner tries to withdraw", async function () {
            await expect(
                matrix.connect(user1).emergencyWithdraw()
            ).to.be.reverted;
        });
    });

    describe("9. View All Settings", function () {
        it("Should return all current settings correctly", async function () {
            // Check level prices
            const [prices, fees] = await matrix.getLevels();
            expect(prices.length).to.equal(13);
            expect(fees.length).to.equal(13);

            // Check sponsor settings
            const sponsorPercent = await matrix.sponsorCommissionPercent();
            const sponsorMinLevel = await matrix.sponsorMinLevel();
            const sponsorFallback = await matrix.sponsorFallback();
            expect(sponsorPercent).to.equal(5); // Default
            expect(sponsorMinLevel).to.equal(4); // Default
            expect(sponsorFallback).to.equal(0); // ROOT_USER

            // Check addresses
            const feeRec = await matrix.feeReceiver();
            const vault = await matrix.royaltyVault();
            expect(feeRec).to.equal(feeReceiver.address);
            expect(vault).to.equal(await royaltyVault.getAddress());

            // Check status
            const paused = await matrix.paused();
            expect(paused).to.equal(false);

            // Check constants
            const maxLevel = await matrix.MAX_LEVEL();
            const roiCap = await matrix.ROI_CAP_PERCENT();
            const royaltyPercent = await matrix.ROYALTY_PERCENT();
            expect(maxLevel).to.equal(13);
            expect(roiCap).to.equal(150);
            expect(royaltyPercent).to.equal(5);
        });
    });

    describe("10. Multiple Settings Updates", function () {
        it("Should update multiple settings in sequence", async function () {
            // Update prices
            const newPrices = Array(13).fill(ethers.parseEther("0.01"));
            await matrix.connect(owner).updateLevelPrices(newPrices);

            // Update sponsor settings
            await matrix.connect(owner).setSponsorCommission(7);
            await matrix.connect(owner).setSponsorMinLevel(5);
            await matrix.connect(owner).setSponsorFallback(1);

            // Update addresses
            await matrix.connect(owner).setFeeReceiver(newFeeReceiver.address);

            // Verify all updates
            const [prices] = await matrix.getLevels();
            expect(prices[0]).to.equal(newPrices[0]);
            expect(await matrix.sponsorCommissionPercent()).to.equal(7);
            expect(await matrix.sponsorMinLevel()).to.equal(5);
            expect(await matrix.sponsorFallback()).to.equal(1);
            expect(await matrix.feeReceiver()).to.equal(newFeeReceiver.address);
        });
    });
});
